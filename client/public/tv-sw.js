// tv-sw.js — offline boot for the mosque TV (/tv/*). Registered with scope
// /tv/ by the TV screen only. It keeps the page shell and the hashed bundle
// files; prayer data and the clock offset live in the page's localStorage.
const VERSION = "v1";
const SHELL = `tv-shell-${VERSION}`;
const ASSETS = `tv-assets-${VERSION}`;
const SHELL_KEY = "/index.html";

// The server answers with `Vary: *` and a Content-Range, which the Cache API
// refuses to store; keep only the body and its type.
const plain = (res) =>
	new Response(res.body, {
		headers: { "content-type": res.headers.get("content-type") || "application/octet-stream" },
	});

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(SHELL)
			.then(async (cache) => {
				const res = await fetch(SHELL_KEY);
				if (res.ok) await cache.put(SHELL_KEY, plain(res));
			})
			.catch(() => {})
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((k) => k !== SHELL && k !== ASSETS).map((k) => caches.delete(k))),
			)
			.then(() => self.clients.claim()),
	);
});

// The page lists the bundle files it loaded before this worker took over.
self.addEventListener("message", (event) => {
	if (event.data?.type !== "cache" || !Array.isArray(event.data.urls)) return;
	const urls = event.data.urls.filter((u) => typeof u === "string" && u.startsWith("/assets/"));
	event.waitUntil(
		caches.open(ASSETS).then(async (cache) => {
			for (const url of urls) {
				if (await cache.match(url)) continue;
				try {
					const res = await fetch(url);
					if (res.ok) await cache.put(url, plain(res));
				} catch {}
			}
		}),
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;
	if (request.method !== "GET") return;
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return;
	if (request.mode === "navigate") event.respondWith(shell(request));
	else if (url.pathname.startsWith("/assets/")) event.respondWith(asset(request));
});

// Network first, so a deploy is picked up; the cached shell when offline or
// when the server errors. A changed shell means new hashed bundle names, so
// the old bundle files are dropped.
async function shell(request) {
	const cache = await caches.open(SHELL);
	try {
		const res = await fetch(request);
		if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
		if (res.ok && (res.headers.get("content-type") || "").includes("text/html")) {
			try {
				const html = await res.clone().text();
				const prev = await cache.match(SHELL_KEY);
				if (prev && (await prev.text()) !== html) await caches.delete(ASSETS);
				await cache.put(SHELL_KEY, plain(new Response(html, { headers: res.headers })));
			} catch {}
		}
		return res;
	} catch {
		return (await cache.match(SHELL_KEY)) || Response.error();
	}
}

// Hashed file names never change content: cache first.
async function asset(request) {
	const cache = await caches.open(ASSETS);
	const hit = await cache.match(request);
	if (hit) return hit;
	const res = await fetch(request);
	if (res.ok) await cache.put(request, plain(res.clone()));
	return res;
}
