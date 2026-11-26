// Self-healing JAKIM refresh (utils/timesRefresh.js). JAKIM (cpray) is
// mocked; the module must be mocked before timesRefresh.js is imported.
import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	mock,
	setSystemTime,
	test,
} from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { jakimDateToIso } from "../utils/jakimDates.js";
import { makeRows, makeYearPayload } from "./fixtures.js";

// Per-test JAKIM behaviour: a payload, or an Error to throw.
let jakim;
const fetched = [];
mock.module("cpray", () => ({
	default: class {
		async getTimesbyYear(zone) {
			fetched.push(zone);
			if (jakim instanceof Error) throw jakim;
			return jakim;
		}
	},
}));

const { checkAndRefreshZones, latestDataDate, refreshZone } = await import(
	"../utils/timesRefresh.js"
);

const timesDir = join(import.meta.dir, "../data/times");
const testFile = (zone) => join(timesDir, `${zone}.json`);
const written = new Set();
// Unique zone names per test: failure throttling is module-level state.
let seq = 0;
const zoneName = () => {
	const zone = `__test${seq++}`;
	written.add(zone);
	return zone;
};

beforeEach(() => {
	setSystemTime(new Date(2026, 2, 15, 12));
	fetched.length = 0;
	jakim = undefined;
});
afterEach(() => setSystemTime());
afterAll(() => {
	for (const zone of written) rmSync(testFile(zone), { force: true });
});

describe("jakimDateToIso", () => {
	test("parses Malay and English abbreviations", () => {
		expect(jakimDateToIso("01-Mac-2026")).toBe("2026-03-01");
		expect(jakimDateToIso("1-May-2026")).toBe("2026-05-01");
		expect(jakimDateToIso("31-Dis-2026")).toBe("2026-12-31");
	});

	test("returns null for junk", () => {
		for (const bad of [undefined, null, "", "2026-03-01", "01-Foo-2026", "01-Mac"]) {
			expect(jakimDateToIso(bad)).toBeNull();
		}
	});
});

describe("latestDataDate", () => {
	test("returns the last row's ISO date", () => {
		expect(latestDataDate(makeRows(2026, 11, 30, 2))).toBe("2026-12-31");
	});

	test("returns null for empty, non-array or dateless data", () => {
		expect(latestDataDate([])).toBeNull();
		expect(latestDataDate(undefined)).toBeNull();
		expect(latestDataDate([{}])).toBeNull();
	});
});

describe("refreshZone", () => {
	test("writes a current-year payload and reports success", async () => {
		const zone = zoneName();
		jakim = makeYearPayload(2026);
		expect(await refreshZone(zone)).toBe(true);
		const saved = JSON.parse(readFileSync(testFile(zone), "utf8"));
		expect(saved.prayerTime).toHaveLength(365);
		// Atomic write: the temp file is renamed away, not left behind.
		expect(existsSync(`${testFile(zone)}.tmp`)).toBe(false);
	});

	test("rejects JAKIM's NO_RECORD payload without writing", async () => {
		const zone = zoneName();
		jakim = { status: "NO_RECORD!" };
		expect(await refreshZone(zone)).toBe(false);
		expect(existsSync(testFile(zone))).toBe(false);
	});

	test("rejects a re-served previous year without writing", async () => {
		const zone = zoneName();
		setSystemTime(new Date(2027, 0, 2, 12));
		jakim = makeYearPayload(2026);
		expect(await refreshZone(zone)).toBe(false);
		expect(existsSync(testFile(zone))).toBe(false);
	});

	test("returns false when the fetch throws", async () => {
		const zone = zoneName();
		jakim = new Error("ECONNRESET");
		expect(await refreshZone(zone)).toBe(false);
		expect(existsSync(testFile(zone))).toBe(false);
	});
});

describe("checkAndRefreshZones", () => {
	test("leaves fresh zones alone", async () => {
		const zone = zoneName();
		const summary = await checkAndRefreshZones({
			[zone]: { db: makeYearPayload(2026).prayerTime },
		});
		expect(fetched).toEqual([]);
		expect(summary).toMatchObject({ checked: 1, fresh: 1, refreshed: 0, stale: [], failed: [] });
	});

	test("refetches a zone with no data", async () => {
		const zone = zoneName();
		jakim = makeYearPayload(2026);
		const summary = await checkAndRefreshZones({ [zone]: { db: [] } });
		expect(fetched).toEqual([zone]);
		expect(summary).toMatchObject({ stale: [zone], refreshed: 1, failed: [] });
	});

	test("throttles a failing zone to 2 attempts per day, then retries the next day", async () => {
		const zone = zoneName();
		const zones = { [zone]: { db: makeRows(2026, 2, 1, 10) } }; // ends 10 Mac: stale
		jakim = new Error("down");

		await checkAndRefreshZones(zones);
		await checkAndRefreshZones(zones);
		const third = await checkAndRefreshZones(zones);
		expect(fetched).toEqual([zone, zone]);
		expect(third).toMatchObject({ stale: [zone], failed: [] });

		setSystemTime(new Date(2026, 2, 16, 12));
		await checkAndRefreshZones(zones);
		expect(fetched).toEqual([zone, zone, zone]);
	});

	test("a re-served old year counts as a failure, so the throttle applies", async () => {
		const zone = zoneName();
		setSystemTime(new Date(2027, 0, 1, 12));
		const zones = { [zone]: { db: makeYearPayload(2026).prayerTime } };
		jakim = makeYearPayload(2026);

		const first = await checkAndRefreshZones(zones);
		expect(first).toMatchObject({ refreshed: 0, failed: [zone] });
		await checkAndRefreshZones(zones);
		await checkAndRefreshZones(zones);
		expect(fetched).toEqual([zone, zone]);
	});
});
