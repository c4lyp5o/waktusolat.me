// tv-sw.js — offline boot for the mosque TV: /tv/:zone and a registered
// mosque's /m/:id. Registered by the TV screen only, with scope /tv/ or /m/.
// It keeps the page shell, the hashed bundle files and the programme
// photos; prayer data, the clock offset and the mosque's settings and
// programmes live in the page's localStorage.
const VERSION = "v1";
const SHELL = `tv-shell-${VERSION}`;
const ASSETS = `tv-assets-${VERSION}`;
const PHOTOS = `tv-photos-${VERSION}`;
const MAX_PHOTOS = 100;

// Only TV screens get the offline shell; the mosque editor pages under /m/
// (/m/baru, /m/:id/edit) always load from the network.
const isTvPage = (path) =>
	path.startsWith("/tv/") || (/^\/m\/[^/]+\/?$/.test(path) && !/^\/m\/baru\/?$/.test(path));
// A programme photo. Its URL carries ?v=<version>, so a cached copy is
// never stale: a new upload is a new URL.
const isPhoto = (url) =>
	/^\/api\/v1\/mosques\/[^/]+\/programmes\/[^/]+\/photo$/.test(url.pathname) &&
	url.searchParams.has("v");
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
				Promise.all(
					keys.filter((k) => ![SHELL, ASSETS, PHOTOS].includes(k)).map((k) => caches.delete(k)),
				),
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
	if (request.mode === "navigate") {
		if (isTvPage(url.pathname)) event.respondWith(shell(request));
	} else if (url.pathname.startsWith("/assets/")) event.respondWith(asset(request));
	else if (isPhoto(url)) event.respondWith(photo(request));
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

// Cache first; the oldest photos are dropped beyond MAX_PHOTOS.
async function photo(request) {
	const cache = await caches.open(PHOTOS);
	const hit = await cache.match(request);
	if (hit) return hit;
	const res = await fetch(request);
	if (res.ok) {
		await cache.put(request, plain(res.clone()));
		const keys = await cache.keys();
		for (const old of keys.slice(0, Math.max(0, keys.length - MAX_PHOTOS))) await cache.delete(old);
	}
	return res;
}
