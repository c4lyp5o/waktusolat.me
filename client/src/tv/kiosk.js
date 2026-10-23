// kiosk.js — browser side of the unattended TV: offline service worker, wake
// lock, daily reload. Every API is optional; where one is missing or refuses,
// the screen simply runs without it.
import { useEffect, useRef } from "react";
import { safeStorage } from "../lib/storage.js";
import { drift, reloadDue } from "../lib/waktu/kiosk.js";
import { mytIsoDate } from "../lib/waktu/mytime.js";

const RELOAD_KEY = "waktu:tv-reloaded";
const RELOAD_CHECK_MS = 60 * 1000;

// Scoped to the TV pages only (the worker also leaves the mosque editor
// pages under /m/ alone). Production only: in dev it would serve stale
// modules.
export function registerTvWorker() {
	if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
	navigator.serviceWorker
		// Scoped to the TV's own tree: /tv/ for a zone, /m/ for a mosque.
		.register("/tv-sw.js", { scope: window.location.pathname.startsWith("/m/") ? "/m/" : "/tv/" })
		.then(() => navigator.serviceWorker.ready)
		.then((reg) => {
			// The first page load happened before the worker took over, so hand
			// it the files already fetched.
			const urls = performance
				.getEntriesByType("resource")
				.map((e) => new URL(e.name).pathname)
				.filter((p) => p.startsWith("/assets/"));
			reg.active?.postMessage({ type: "cache", urls });
		})
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
