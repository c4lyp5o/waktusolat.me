// TV display: server-offset clock and the per-zone year cache.
import { describe, expect, test } from "bun:test";
import { needsRefresh, readYear, writeYear } from "../client/src/tv/lib/cache.js";
import { computeOffset, createClock } from "../client/src/tv/lib/clock.js";
import { mytEpoch } from "../client/src/tv/lib/mytime.js";

// Map-backed Storage; `fail` makes every call throw (private mode, quota, blocked).
function fakeStorage({ fail = false } = {}) {
	const map = new Map();
	const guard =
		(fn) =>
		(...args) => {
			if (fail) throw new Error("SecurityError");
			return fn(...args);
		};
	return {
		getItem: guard((k) => (map.has(k) ? map.get(k) : null)),
		setItem: guard((k, v) => map.set(k, String(v))),
		removeItem: guard((k) => map.delete(k)),
		map,
	};
}

describe("clock", () => {
	test("offset is taken at the round-trip midpoint", () => {
		// Sent at 1000, received at 1200 (device clock); server said 61100.
		expect(computeOffset(1000, 61_100, 1200)).toBe(60_000);
	});

	test("sync corrects a device clock that is 10 minutes fast", async () => {
		let device = 1_000_000;
		const storage = fakeStorage();
		const fetchImpl = async () => {
			device += 100; // 100 ms each way
			const body = { now: 1_000_000 - 600_000 + 100 };
			device += 100;
			return { ok: true, json: async () => body };
		};
		const clock = createClock({ fetchImpl, storage, deviceNow: () => device });
		await clock.sync();
		expect(Math.abs(clock.now() - (device - 600_000))).toBeLessThanOrEqual(1000);
		// Persisted, so a reload offline starts corrected.
		const again = createClock({
			fetchImpl: async () => Promise.reject(new Error("offline")),
			storage,
			deviceNow: () => device,
		});
		expect(again.offset()).toBe(clock.offset());
	});

	test("a failed or implausible sync keeps the last offset", async () => {
		const storage = fakeStorage();
		let device = 0;
		const clock = createClock({
			fetchImpl: async () => ({ ok: true, json: async () => ({ now: 5000 }) }),
			storage,
			deviceNow: () => device,
		});
		await clock.sync();
		const good = clock.offset();
		for (const fetchImpl of [
			async () => {
				throw new Error("offline");
			},
			async () => ({ ok: false, json: async () => ({}) }),
			async () => ({ ok: true, json: async () => ({ now: "soon" }) }),
			async () => {
				device += 20_000; // 20 s round trip: too slow to trust
				return { ok: true, json: async () => ({ now: 1 }) };
			},
		]) {
			const c = createClock({ fetchImpl, storage, deviceNow: () => device });
			expect(await c.sync()).toBeNull();
			expect(c.offset()).toBe(good);
		}
	});

	test("works with no storage at all", async () => {
		const clock = createClock({
			fetchImpl: async () => ({ ok: true, json: async () => ({ now: 500 }) }),
			storage: fakeStorage({ fail: true }),
			deviceNow: () => 0,
		});
		expect(clock.offset()).toBe(0);
		expect(await clock.sync()).toBe(500);
	});
});

describe("year cache", () => {
	const days = [
		{ isoDate: "2026-10-22", hijri: "12 Ramadhan 1447", times: { subuh: 1 } },
		{ isoDate: "2026-10-23", hijri: "13 Ramadhan 1447", times: { subuh: 2 } },
	];
	const noon22 = mytEpoch(2026, 10, 22, 12, 0);

	test("round-trips per zone", () => {
		const storage = fakeStorage();
		expect(writeYear(storage, "wly01", days, noon22)).toBe(true);
		expect(readYear(storage, "wly01")).toEqual({ days, fetchedAt: noon22, meta: null });
		expect(readYear(storage, "jhr01")).toBeNull();
		// Zone meta (area name, negeri) is kept for offline boots.
		const meta = { area: "KUALA LUMPUR DAN PUTRAJAYA", negeri: "Wilayah Persekutuan Kuala Lumpur" };
		writeYear(storage, "wly01", days, noon22, meta);
		expect(readYear(storage, "wly01").meta).toEqual(meta);
	});

	test("missing, corrupt or throwing storage reads as no cache", () => {
		const storage = fakeStorage();
		storage.map.set("tv:year:v1:wly01", "{not json");
		expect(readYear(storage, "wly01")).toBeNull();
		storage.map.set("tv:year:v1:wly01", JSON.stringify({ days: "x" }));
		expect(readYear(storage, "wly01")).toBeNull();
		expect(readYear(fakeStorage({ fail: true }), "wly01")).toBeNull();
		expect(writeYear(fakeStorage({ fail: true }), "wly01", days, noon22)).toBe(false);
		expect(readYear(null, "wly01")).toBeNull();
	});

	test("needsRefresh: none, 6 h old, after Malaysian midnight, or today missing", () => {
		const entry = { days, fetchedAt: noon22 };
		expect(needsRefresh(null, noon22)).toBe(true);
		expect(needsRefresh(entry, noon22 + 5 * 3600_000)).toBe(false);
		expect(needsRefresh(entry, noon22 + 6 * 3600_000)).toBe(true);
		// 23:59 on the 22nd vs 00:01 on the 23rd (both under 6 h).
		const late = { days, fetchedAt: mytEpoch(2026, 10, 22, 23, 59) };
		expect(needsRefresh(late, mytEpoch(2026, 10, 22, 23, 59, 30))).toBe(false);
		expect(needsRefresh(late, mytEpoch(2026, 10, 23, 0, 1))).toBe(true);
		const old = { days: [days[0]], fetchedAt: mytEpoch(2026, 10, 23, 0, 30) };
		expect(needsRefresh(old, mytEpoch(2026, 10, 23, 1, 0))).toBe(true);
	});
});
