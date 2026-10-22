// useTv.js — the TV display's live inputs: corrected time and the zone's year.
import { useEffect, useMemo, useRef, useState } from "react";
import { needsRefresh, readYear, writeYear } from "./lib/cache.js";
import { createClock } from "./lib/clock.js";
import { parseYear } from "./lib/rows.js";

const CLOCK_SYNC_MS = 30 * 60 * 1000;
const DATA_CHECK_MS = 60 * 1000;
const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;

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
// rule, retried no more than every 5 minutes after a failure.
// status: "ready" | "loading" | "no-data" | "unknown-zone"
export function useYear(zone, now) {
	const storage = useMemo(safeStorage, []);
	const [entry, setEntry] = useState(() => readYear(storage, zone));
	const [status, setStatus] = useState(entry ? "ready" : "loading");
	const lastAttempt = useRef(0);
	const nowRef = useRef(now);
	nowRef.current = now;

	useEffect(() => {
		let cancelled = false;
		const refresh = async () => {
			const t = nowRef.current;
			if (!needsRefresh(entry, t) || t - lastAttempt.current < RETRY_AFTER_FAILURE_MS) return;
			lastAttempt.current = t;
			try {
				const res = await fetch(`/api/v1/waktusolat/year/${zone}`);
				if (cancelled) return;
				if (res.status === 400) return setStatus("unknown-zone");
				if (!res.ok) return entry || setStatus("no-data");
				const body = await res.json();
				const days = parseYear(body);
				if (cancelled || days.length === 0) return entry || setStatus("no-data");
				const next = { days, fetchedAt: t, meta: { area: body.zone, negeri: body.negeri } };
				writeYear(storage, zone, next.days, next.fetchedAt, next.meta);
				lastAttempt.current = 0;
				setEntry(next);
				setStatus("ready");
			} catch {
				// Offline: keep rendering the cache; retry after the back-off.
			}
		};
		refresh();
		const id = setInterval(refresh, DATA_CHECK_MS);
		return () => {
			cancelled = true;
			clearInterval(id);
		};
	}, [entry, storage, zone]);

	return { days: entry?.days ?? [], meta: entry?.meta ?? null, status };
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
