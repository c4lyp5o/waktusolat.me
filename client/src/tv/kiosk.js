// kiosk.js — browser side of the unattended TV: offline service worker, wake
// lock, daily reload. Every API is optional; where one is missing or refuses,
// the screen simply runs without it.
import { useEffect, useRef } from "react";
import { safeStorage } from "../lib/storage.js";
import { drift, reloadDue } from "../lib/waktu/kiosk.js";
import { mytIsoDate } from "../lib/waktu/mytime.js";

const RELOAD_KEY = "waktu:tv-reloaded";
const RELOAD_CHECK_MS = 60 * 1000;

// Every same-origin bundle file this page has fetched so far: the JS chunk,
// both stylesheets, and the tema's font files (which only load once a glyph is
// actually drawn, so this is read after document.fonts.ready).
export function assetUrls(entries = performance.getEntriesByType("resource")) {
	const urls = new Set();
	for (const e of entries) {
		try {
			const u = new URL(e.name, location.href);
			if (u.origin !== location.origin) continue;
			if (!u.pathname.startsWith("/assets/")) continue;
			urls.add(u.pathname);
		} catch {
			// A malformed entry is not worth a throw.
		}
	}
	return [...urls];
}

// Hands the worker the files this screen is actually using, so a Papan mosque
// boots green offline — not on Langit's white — and a tema switched later is
// cached too. Called on registration and again whenever the tema changes.
export async function cacheAssets() {
	if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
	try {
		const reg = await navigator.serviceWorker.getRegistration();
		if (!reg?.active) return;
		// A font file is only fetched when a glyph needs it: wait for the ones
		// this screen draws, but never block the TV on a slow font.
		await Promise.race([
			document.fonts?.ready ?? Promise.resolve(),
			new Promise((r) => setTimeout(r, 4000)),
		]);
		reg.active.postMessage({ type: "cache", urls: assetUrls() });
	} catch {
		// Offline-first is best effort; the screen does not care.
	}
}

// Scoped to the TV pages only (the worker also leaves the mosque editor
// pages under /m/ alone). Production only: in dev it would serve stale
// modules.
export function registerTvWorker() {
	if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
	navigator.serviceWorker
		// Scoped to the TV's own tree: /tv/ for a zone, /m/ for a mosque.
		.register("/tv-sw.js", { scope: window.location.pathname.startsWith("/m/") ? "/m/" : "/tv/" })
		.then(() => navigator.serviceWorker.ready)
		.then(cacheAssets)
		.catch(() => {});
}

// Keep the screen awake; the lock is released when the tab is hidden, so ask
// again whenever it becomes visible.
function useWakeLock() {
	useEffect(() => {
		if (!navigator.wakeLock) return;
		let lock = null;
		const acquire = async () => {
			try {
				lock = await navigator.wakeLock.request("screen");
			} catch {
				lock = null;
			}
		};
		const onVisible = () => document.visibilityState === "visible" && acquire();
		acquire();
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			document.removeEventListener("visibilitychange", onVisible);
			lock?.release().catch(() => {});
		};
	}, []);
}

// Reload once a day after 03:00 Malaysia time, but only when the server
// answers: never reload into a blank screen while the network is down.
function useDailyReload(now) {
	const nowRef = useRef(now);
	nowRef.current = now;
	useEffect(() => {
		const storage = safeStorage();
		const id = setInterval(async () => {
			const t = nowRef.current;
			const lastReload = storage?.getItem(RELOAD_KEY) ?? null;
			if (!reloadDue(t, { uptimeMs: performance.now(), lastReload })) return;
			try {
				const res = await fetch("/api/v1/time", { cache: "no-store" });
				if (!res.ok) return;
				storage?.setItem(RELOAD_KEY, mytIsoDate(t));
				window.location.reload();
			} catch {
				// Offline: try again next minute.
			}
		}, RELOAD_CHECK_MS);
		return () => clearInterval(id);
	}, []);
}

// One hook for the TV screen: returns the burn-in offset to apply.
export function useKiosk(now) {
	useEffect(registerTvWorker, []);
	useWakeLock();
	useDailyReload(now);
	// Recomputed each render (once a second); identical pixels cost nothing.
	const { x, y } = drift(now);
	return { transform: `translate(${x}px, ${y}px)` };
}
