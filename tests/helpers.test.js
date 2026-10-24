// Date-anchored prayer-time serving (controllers/helpers.js).
import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import {
	buildDateIndex,
	resolveTodayIndex,
	timeCruncher,
	timeReminder,
} from "../controllers/helpers.js";
import { makeRows, makeYearPayload } from "./fixtures.js";

// Pin "now" to local noon so the helpers' local-date logic is deterministic.
const at = (year, monthIndex, day) => setSystemTime(new Date(year, monthIndex, day, 12));

afterEach(() => setSystemTime());

describe("buildDateIndex", () => {
	test("maps Malay and English month abbreviations to ISO dates", () => {
		const index = buildDateIndex([
			{ date: "01-Mac-2026" },
			{ date: "02-Mar-2026" },
			{ date: "15-Ogos-2026" },
			{ date: "31-Dec-2026" },
		]);
		expect([...index.entries()]).toEqual([
			["2026-03-01", 0],
			["2026-03-02", 1],
			["2026-08-15", 2],
			["2026-12-31", 3],
		]);
	});

	test("skips unparseable dates and keeps the first duplicate", () => {
		const index = buildDateIndex([
			{ date: "garbage" },
			{ date: "01-Xyz-2026" },
			{},
			null,
			{ date: "05-Jan-2026" },
			{ date: "05-Jan-2026" },
		]);
		expect([...index.entries()]).toEqual([["2026-01-05", 4]]);
	});
});

describe("resolveTodayIndex", () => {
	test("returns -1 for missing or empty data", () => {
		expect(resolveTodayIndex([])).toBe(-1);
		expect(resolveTodayIndex(undefined)).toBe(-1);
	});

	test("finds today's row by date, not by position", () => {
		at(2026, 2, 15);
		const rows = makeRows(2026, 2, 10, 10); // 10..19 Mac
		expect(resolveTodayIndex(rows)).toBe(5);
	});

	test("handles leap day", () => {
		at(2028, 1, 29);
		const { prayerTime } = makeYearPayload(2028);
		expect(prayerTime[resolveTodayIndex(prayerTime)].date).toBe("29-Feb-2028");
	});

	test("clamps to the last row when data is stale", () => {
		at(2027, 0, 1);
		const { prayerTime } = makeYearPayload(2026);
		expect(resolveTodayIndex(prayerTime)).toBe(prayerTime.length - 1);
	});
});

describe("timeCruncher", () => {
	const zone = (rows) => ({ db: rows });

	test("returns [] for a zone with no data", () => {
		expect(timeCruncher("today", zone([]))).toEqual([]);
	});

	test("returns 'error' for an unknown period", () => {
		at(2026, 2, 15);
		expect(timeCruncher("decade", zone(makeRows(2026, 2, 15, 3)))).toBe("error");
	});

	test("today returns today and tomorrow, formatted", () => {
		at(2026, 2, 15);
		const out = timeCruncher("today", zone(makeYearPayload(2026).prayerTime));
		expect(out).toHaveLength(2);
		expect(out[0].date).toBe("15/3/2026 / 15/Mac/2026");
		expect(out[0].day).toBe("Ahad / Sunday");
		expect(out[0].hijri).toBe("12/9/1447 / 12/Ramadhan/1447");
		expect(out[0].fajr).toBe("06:00:00");
		expect(out[1].date).toBe("16/3/2026 / 16/Mac/2026");
	});

	test("today on the last day of data returns only that day", () => {
		at(2026, 11, 31);
		const out = timeCruncher("today", zone(makeYearPayload(2026).prayerTime));
		expect(out.map((r) => r.date)).toEqual(["31/12/2026 / 31/Disember/2026"]);
	});

	test("week returns 7 days from today", () => {
		at(2026, 2, 15);
		const out = timeCruncher("week", zone(makeYearPayload(2026).prayerTime));
		expect(out).toHaveLength(7);
		expect(out[0].date.startsWith("15/3/2026")).toBe(true);
		expect(out[6].date.startsWith("21/3/2026")).toBe(true);
	});

	test("week spans the year rollover when next year's rows exist", () => {
		at(2026, 11, 29);
		const out = timeCruncher("week", zone(makeRows(2026, 11, 1, 62)));
		expect(out.map((r) => r.date.split(" / ")[0])).toEqual([
			"29/12/2026",
			"30/12/2026",
			"31/12/2026",
			"1/1/2027",
			"2/1/2027",
			"3/1/2027",
			"4/1/2027",
		]);
	});

	test("month returns every row in the current month", () => {
		at(2026, 1, 10);
		const out = timeCruncher("month", zone(makeYearPayload(2026).prayerTime));
		expect(out).toHaveLength(28);
		expect(out[0].date.startsWith("1/2/2026")).toBe(true);
		expect(out[27].date.startsWith("28/2/2026")).toBe(true);
	});

	test("month ignores the same month of another year", () => {
		at(2027, 0, 10);
		const out = timeCruncher("month", zone(makeRows(2026, 0, 1, 400)));
		expect(out.every((r) => r.date.split(" / ")[0].endsWith("/1/2027"))).toBe(true);
		// 400 rows from 01-Jan-2026 cover all of Jan 2027; Jan 2026 must not leak in.
		expect(out).toHaveLength(31);
	});

	test("month on stale data follows the served (last) day, not the calendar", () => {
		at(2027, 0, 1);
		const out = timeCruncher("month", zone(makeYearPayload(2026).prayerTime));
		expect(out).toHaveLength(31);
		expect(out[0].date.startsWith("1/12/2026")).toBe(true);
	});

	test("year returns every row", () => {
		at(2026, 5, 1);
		expect(timeCruncher("year", zone(makeYearPayload(2026).prayerTime))).toHaveLength(365);
	});
});

describe("timeReminder", () => {
	const today = () => timeCruncher("today", { db: makeYearPayload(2026).prayerTime });

	test("after isha on the last day of data, counts down to fajr without a tomorrow row", async () => {
		setSystemTime(new Date(2026, 11, 31, 21));
		const rows = today();
		expect(rows).toHaveLength(1);
		const { nextSolah } = await timeReminder(rows);
		expect(nextSolah.name).toBe("fajr");
		// Tomorrow 06:00 from 21:00 -> 9h.
		expect(nextSolah.hours).toBe(9);
	});

	test("mid-afternoon points at asr", async () => {
		setSystemTime(new Date(2026, 2, 15, 14));
		const { nextSolah } = await timeReminder(today());
		expect(nextSolah).toMatchObject({ name: "asr", hours: 2, minutes: 30 });
	});
});
