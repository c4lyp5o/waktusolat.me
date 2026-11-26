// TV display: burn-in drift and the daily-reload decision.
import { describe, expect, test } from "bun:test";
import {
	DRIFT_CYCLE_MS,
	DRIFT_PX,
	drift,
	MIN_UPTIME_MS,
	reloadDue,
} from "../client/src/lib/waktu/kiosk.js";
import { mytEpoch } from "../client/src/lib/waktu/mytime.js";

describe("drift", () => {
	test("stays within ±6 px, in whole pixels, over a full cycle", () => {
		const seen = new Set();
		for (let t = 0; t < DRIFT_CYCLE_MS; t += 10_000) {
			const { x, y } = drift(t);
			expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
			expect(Math.abs(x)).toBeLessThanOrEqual(DRIFT_PX);
			expect(Math.abs(y)).toBeLessThanOrEqual(DRIFT_PX);
			seen.add(`${x},${y}`);
		}
		expect(seen.size).toBeGreaterThan(20);
	});

	test("repeats every 20 minutes", () => {
		const t = 7_654_321;
		expect(drift(t)).toEqual(drift(t + DRIFT_CYCLE_MS));
	});

	test("moves at most 1 px per 10 s", () => {
		for (let t = 0; t < DRIFT_CYCLE_MS; t += 10_000) {
			const a = drift(t);
			const b = drift(t + 10_000);
			expect(Math.abs(a.x - b.x)).toBeLessThanOrEqual(1);
			expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
		}
	});
});

describe("reloadDue", () => {
	const up = MIN_UPTIME_MS + 1;
	const at = (h, m) => mytEpoch(2026, 10, 23, h, m);

	test("only during the 03:00 hour (Malaysia time)", () => {
		expect(reloadDue(at(2, 59), { uptimeMs: up, lastReload: null })).toBe(false);
		expect(reloadDue(at(3, 0), { uptimeMs: up, lastReload: null })).toBe(true);
		expect(reloadDue(at(3, 59), { uptimeMs: up, lastReload: null })).toBe(true);
		expect(reloadDue(at(4, 0), { uptimeMs: up, lastReload: null })).toBe(false);
	});

	test("once per day", () => {
		expect(reloadDue(at(3, 5), { uptimeMs: up, lastReload: "2026-10-23" })).toBe(false);
		expect(reloadDue(at(3, 5), { uptimeMs: up, lastReload: "2026-10-22" })).toBe(true);
	});

	test("never on a freshly loaded page", () => {
		expect(reloadDue(at(3, 5), { uptimeMs: 60_000, lastReload: null })).toBe(false);
	});
});
