// cache.js — the zone's year of prayer times in localStorage.
//
// The TV renders from this first, so it starts and keeps counting with no
// internet. Every storage call is guarded: private mode, a full quota or a
// TV browser that blocks storage all read as "no cache", never an error.
import { mytIsoDate } from "./mytime.js";

const REFRESH_AFTER_MS = 6 * 60 * 60 * 1000;
const keyFor = (zone) => `tv:year:v1:${zone}`;

export function readYear(storage, zone) {
	try {
		const entry = JSON.parse(storage.getItem(keyFor(zone)));
		if (!Array.isArray(entry?.days) || !Number.isFinite(entry.fetchedAt)) return null;
		return { days: entry.days, fetchedAt: entry.fetchedAt };
	} catch {
		return null;
	}
}

export function writeYear(storage, zone, days, fetchedAt) {
	try {
		storage.setItem(keyFor(zone), JSON.stringify({ days, fetchedAt }));
		return true;
	} catch {
		return false;
	}
}

// Refetch when there is no cache, it is 6 h old, a Malaysian midnight has
// passed since it was fetched, or it does not contain today.
export function needsRefresh(entry, now) {
	if (!entry) return true;
	if (now - entry.fetchedAt >= REFRESH_AFTER_MS) return true;
	const today = mytIsoDate(now);
	if (mytIsoDate(entry.fetchedAt) !== today) return true;
	return !entry.days.some((d) => d.isoDate === today);
}
