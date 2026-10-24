// yearLoader.js — fetch and cache the zone's year for the TV display.
//
// Cache-first: initial() returns what localStorage holds. refresh(now)
// refetches only when cache.js says so, never runs two requests at once, and
// backs off 5 minutes after a failure only (not after a start). A result is
// always applied, so a React effect that starts, is torn down and starts
// again (StrictMode, re-renders) cannot strand the screen without data.
import { needsRefresh, readYear, writeYear } from "./cache.js";
import { parseYear } from "./rows.js";

const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;

// status: "ready" | "loading" | "no-data" | "unknown-zone"
export function createYearLoader({ zone, fetchImpl, storage, onUpdate }) {
	let entry = readYear(storage, zone);
	let status = entry ? "ready" : "loading";
	let inFlight = false;
	let lastFailure = Number.NEGATIVE_INFINITY;

	const snapshot = () => ({
		days: entry?.days ?? [],
		meta: entry?.meta ?? null,
		status,
	});
	const set = (next) => {
		status = next;
		onUpdate(snapshot());
	};
	const fail = (now, next) => {
		lastFailure = now;
		// With a cached year the screen keeps showing it, whatever went wrong.
		if (!entry) set(next);
	};

	async function refresh(now) {
		if (inFlight || !needsRefresh(entry, now) || now - lastFailure < RETRY_AFTER_FAILURE_MS) return;
		inFlight = true;
		try {
			const res = await fetchImpl(`/api/v1/waktusolat/year/${zone}`);
			if (res.status === 400) {
				lastFailure = now;
				return set("unknown-zone");
			}
			if (!res.ok) return fail(now, "no-data");
			const body = await res.json();
			const days = parseYear(body);
			if (days.length === 0) return fail(now, "no-data");
			entry = { days, fetchedAt: now, meta: { area: body.zone, negeri: body.negeri } };
			writeYear(storage, zone, entry.days, entry.fetchedAt, entry.meta);
			lastFailure = Number.NEGATIVE_INFINITY;
			set("ready");
		} catch {
			// Offline or a bad body: keep the cache, retry after the back-off.
			fail(now, status);
		} finally {
			inFlight = false;
		}
	}

	return { initial: snapshot, refresh };
}
