// zoneMemory.js — the visitor's zone, remembered so `/` shows their times
// with zero taps. Guarded: blocked storage simply means no memory.

const KEY = "waktu:zone";
const ZONE_CODE = /^[a-z]{3}\d{2}$/;

export function loadZone(storage) {
	try {
		const code = String(storage.getItem(KEY) ?? "").toLowerCase();
		return ZONE_CODE.test(code) ? code : null;
	} catch {
		return null;
	}
}

export function saveZone(storage, code) {
	try {
		storage.setItem(KEY, String(code).toLowerCase());
	} catch {
		// Storage blocked: the zone is just not remembered.
	}
}
