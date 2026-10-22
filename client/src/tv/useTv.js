// useTv.js — the TV display's live inputs: corrected time and the zone's year.
import { useEffect, useMemo, useRef, useState } from "react";
import { createClock } from "./lib/clock.js";
import { createYearLoader } from "./lib/yearLoader.js";

const CLOCK_SYNC_MS = 30 * 60 * 1000;
const DATA_CHECK_MS = 60 * 1000;

// localStorage, or null where the TV browser blocks it.
function safeStorage() {
	try {
		const storage = window.localStorage;
		storage.getItem("tv:probe");
		return storage;
	} catch {
		return null;
	}
}

// Ticks once per displayed second on server-corrected time. With `fixedNow`
// (dev-only ?now=) time starts there and runs forward in real time.
export function useNow(fixedNow) {
	const storage = useMemo(safeStorage, []);
	const clock = useMemo(() => createClock({ fetchImpl: fetch, storage }), [storage]);
	const mountedAt = useMemo(() => Date.now(), []);
	const read = () => (fixedNow == null ? clock.now() : fixedNow + (Date.now() - mountedAt));
	const [now, setNow] = useState(read);

	useEffect(() => {
		if (fixedNow != null) return;
		clock.sync();
		const id = setInterval(() => clock.sync(), CLOCK_SYNC_MS);
		return () => clearInterval(id);
	}, [clock, fixedNow]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: read() closes over values fixed at mount
	useEffect(() => {
		let timer;
		const tick = () => {
			const t = read();
			setNow(t);
			// Wake just after the next whole second so digits change on time.
			timer = setTimeout(tick, 1000 - (t % 1000) + 5);
		};
		tick();
		return () => clearTimeout(timer);
	}, []);

	return now;
}

// The zone's year: rendered from the cache first, refreshed per cache.js's
// rule (see lib/yearLoader.js). One loader per zone for the component's
// life, so an effect that re-runs (StrictMode, re-renders) reuses it.
// status: "ready" | "loading" | "no-data" | "unknown-zone"
export function useYear(zone, now) {
	const storage = useMemo(safeStorage, []);
	const [year, setYear] = useState(null);
	const loader = useMemo(
		() => createYearLoader({ zone, fetchImpl: fetch, storage, onUpdate: setYear }),
		[zone, storage],
	);
	const nowRef = useRef(now);
	nowRef.current = now;

	useEffect(() => {
		loader.refresh(nowRef.current);
		const id = setInterval(() => loader.refresh(nowRef.current), DATA_CHECK_MS);
		return () => clearInterval(id);
	}, [loader]);

	return year ?? loader.initial();
}

// True on a portrait screen (a phone): the TV layout is landscape only.
export function usePortrait() {
	// One MediaQueryList for the component's life (it re-renders every second).
	const query = useMemo(
		() =>
			typeof window.matchMedia === "function" ? window.matchMedia("(orientation: portrait)") : null,
		[],
	);
	const [portrait, setPortrait] = useState(() => query?.matches ?? false);
	useEffect(() => {
		if (!query) return;
		const onChange = (e) => setPortrait(e.matches);
		query.addEventListener?.("change", onChange);
		return () => query.removeEventListener?.("change", onChange);
	}, [query]);
	return portrait;
}
