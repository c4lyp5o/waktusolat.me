// clock.js — "now" corrected against the server (GET /api/v1/time).
//
// TV clocks drift and are often set wrong. The offset to the server is
// measured at the round trip's midpoint, persisted so an offline reload
// starts corrected, and kept when a sync fails or is too slow to trust.

const STORAGE_KEY = "tv:clockOffset";
const MAX_ROUND_TRIP_MS = 10_000;

export const computeOffset = (sentAt, serverNow, receivedAt) =>
	serverNow - (sentAt + receivedAt) / 2;

function load(storage) {
	try {
		const n = Number(storage?.getItem(STORAGE_KEY));
		return Number.isFinite(n) ? n : 0;
	} catch {
		return 0;
	}
}

function save(storage, offset) {
	try {
		storage?.setItem(STORAGE_KEY, String(offset));
	} catch {
		// Storage unavailable: the offset still lives for this page load.
	}
}

export function createClock({
	fetchImpl,
	storage,
	deviceNow = () => Date.now(),
	url = "/api/v1/time",
}) {
	let offset = load(storage);
	return {
		now: () => deviceNow() + offset,
		offset: () => offset,
		// Resolves to the new offset, or null when this sync was not usable.
		async sync() {
			try {
				const sentAt = deviceNow();
				const res = await fetchImpl(url, { cache: "no-store" });
				const receivedAt = deviceNow();
				if (!res.ok || receivedAt - sentAt > MAX_ROUND_TRIP_MS) return null;
				const { now } = await res.json();
				if (!Number.isFinite(now)) return null;
				offset = computeOffset(sentAt, now, receivedAt);
				save(storage, offset);
				return offset;
			} catch {
				return null;
			}
		},
	};
}
