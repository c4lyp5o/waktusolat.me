// TV display: parsing /waktusolat/year rows and the screen state machine.
// Rows come from the real server formatter (timeCruncher) over the fixture
// year, so the parser is tested against exactly what the API returns.
// Fixture times: imsak 05:50, subuh 06:00, syuruk 07:10, zohor 13:15,
// asar 16:30, maghrib 19:20, isyak 20:30; hijri 12 Ramadhan 1447.
import { describe, expect, test } from "bun:test";
import { DEFAULTS } from "../client/src/tv/lib/config.js";
import { mytEpoch } from "../client/src/tv/lib/mytime.js";
import { dayFor, nextDay, parseRow, parseYear } from "../client/src/tv/lib/rows.js";
import { prayerWindows, rowStates, screenState } from "../client/src/tv/lib/schedule.js";
import { timeCruncher } from "../controllers/helpers.js";
import { makeRows, makeYearPayload } from "./fixtures.js";

const apiYear = (rows) => timeCruncher("year", { db: rows });
const days = parseYear(apiYear(makeYearPayload(2026).prayerTime));
const at = (y, mo, d, h, mi, s = 0) => mytEpoch(y, mo, d, h, mi, s);
const S = 1000;
const MIN = 60 * S;

// Thursday 22 Oct 2026 (not a Friday).
const THU = [2026, 10, 22];
const today = days.find((d) => d.isoDate === "2026-10-22");
const tomorrow = nextDay(days, today);
const state = (h, mi, s = 0, config = DEFAULTS, day = today, next = tomorrow) =>
	screenState(at(...THU, h, mi, s), day, next, config);

describe("rows", () => {
	test("parses an API row into Malaysia-time epochs", () => {
		expect(today.isoDate).toBe("2026-10-22");
		expect(today.times.subuh).toBe(at(...THU, 6, 0));
		expect(today.times.imsak).toBe(at(...THU, 5, 50));
		expect(today.times.isyak).toBe(at(...THU, 20, 30));
		expect(today.hijri).toBe("12 Ramadhan 1447");
		expect(days).toHaveLength(365);
	});

	test("rejects malformed rows instead of throwing", () => {
		expect(parseRow({})).toBeNull();
		expect(parseRow({ date: "garbage", fajr: "06:00:00" })).toBeNull();
		expect(parseYear(null)).toEqual([]);
		expect(parseYear({ data: "nope" })).toEqual([]);
	});

	test("dayFor finds the Malaysian calendar day", () => {
		expect(dayFor(days, at(...THU, 23, 59)).day.isoDate).toBe("2026-10-22");
		expect(dayFor(days, at(2026, 10, 23, 0, 0)).day.isoDate).toBe("2026-10-23");
		expect(dayFor(days, at(...THU, 12, 0)).estimate).toBe(false);
		expect(dayFor([], at(...THU, 12, 0))).toBeNull();
	});

	test("stale data: the nearest day re-anchored to today, flagged, no Hijri", () => {
		const { day, estimate } = dayFor(days, at(2027, 1, 2, 12, 0));
		expect(estimate).toBe(true);
		expect(day.isoDate).toBe("2027-01-02");
		expect(day.times.subuh).toBe(at(2027, 1, 2, 6, 0));
		expect(day.hijri).toBeNull(); // never computed, only JAKIM's
	});

	test("nextDay follows the calendar, null past the end of data", () => {
		expect(nextDay(days, today).isoDate).toBe("2026-10-23");
		expect(nextDay(days, days.at(-1))).toBeNull();
	});
});

describe("screenState", () => {
	test("before Subuh (after midnight): countdown to Subuh", () => {
		expect(state(1, 0)).toMatchObject({
			kind: "countdown",
			prayer: "subuh",
			target: at(...THU, 6, 0),
		});
	});

	test("every boundary of every prayer", () => {
		const azans = {
			subuh: [6, 0],
			zohor: [13, 15],
			asar: [16, 30],
			maghrib: [19, 20],
			isyak: [20, 30],
		};
		for (const [prayer, [h, m]] of Object.entries(azans)) {
			const azan = at(...THU, h, m);
			const s = (ms) => screenState(azan + ms, today, tomorrow, DEFAULTS);
			expect(s(-S)).toMatchObject({ kind: "countdown", prayer, target: azan });
			expect(s(0)).toMatchObject({ kind: "iqamah", prayer, target: azan + 10 * MIN });
			expect(s(10 * MIN - S)).toMatchObject({ kind: "iqamah", prayer });
			expect(s(10 * MIN)).toMatchObject({ kind: "solat", prayer, target: azan + 20 * MIN });
			expect(s(20 * MIN - S)).toMatchObject({ kind: "solat", prayer });
			expect(s(20 * MIN).kind).not.toBe("solat");
		}
	});

	test("advisory times are never the lead", () => {
		expect(state(5, 50)).toMatchObject({ kind: "countdown", prayer: "subuh" }); // at Imsak
		expect(state(7, 10)).toMatchObject({ kind: "countdown", prayer: "zohor" }); // at Syuruk
	});

	test("lead carries the azan and iqamah times of its prayer", () => {
		expect(state(12, 0)).toMatchObject({
			label: "Zohor",
			azan: at(...THU, 13, 15),
			iqamah: at(...THU, 13, 25),
		});
	});

	test("Friday: Zohor is Jumaat with the Jumaat offset", () => {
		const fri = days.find((d) => d.isoDate === "2026-10-23");
		const s = screenState(at(2026, 10, 23, 13, 20), fri, nextDay(days, fri), DEFAULTS);
		expect(s).toMatchObject({
			kind: "iqamah",
			prayer: "zohor",
			label: "Jumaat",
			target: at(2026, 10, 23, 13, 45),
		});
	});

	test("custom offsets; a zero iqamah goes straight to solat", () => {
		const config = { ...DEFAULTS, iqamah: { ...DEFAULTS.iqamah, maghrib: 0 }, solat: 5 };
		expect(state(19, 20, 0, config)).toMatchObject({
			kind: "solat",
			prayer: "maghrib",
			target: at(...THU, 19, 25),
		});
		expect(state(19, 25, 0, config)).toMatchObject({ kind: "countdown", prayer: "isyak" });
	});

	test("after Isyak's solat window: tomorrow's Subuh", () => {
		expect(state(20, 50)).toMatchObject({
			kind: "after-isyak",
			prayer: "subuh",
			target: at(2026, 10, 23, 6, 0),
			estimate: false,
		});
	});

	test("31 Dec with no next-year data: today's Subuh + 1 day, marked estimate", () => {
		const dec31 = days.at(-1);
		const s = screenState(at(2026, 12, 31, 22, 0), dec31, nextDay(days, dec31), DEFAULTS);
		expect(s).toMatchObject({ kind: "after-isyak", target: at(2027, 1, 1, 6, 0), estimate: true });
	});

	test("31 Dec with next-year data cached: the real 1 Jan Subuh", () => {
		const both = parseYear(
			apiYear([...makeYearPayload(2026).prayerTime, ...makeRows(2027, 0, 1, 2)]),
		);
		const dec31 = both.find((d) => d.isoDate === "2026-12-31");
		const s = screenState(at(2026, 12, 31, 22, 0), dec31, nextDay(both, dec31), DEFAULTS);
		expect(s).toMatchObject({ target: at(2027, 1, 1, 6, 0), estimate: false });
	});

	test("Subuh ends: secondary line only in the last 15 minutes before Syuruk", () => {
		expect(state(6, 54).secondary).toBeNull();
		expect(state(6, 55).secondary).toEqual({ kind: "subuh-ends", target: at(...THU, 7, 10) });
		expect(state(7, 9, 59).secondary).toMatchObject({ kind: "subuh-ends" });
		expect(state(7, 10).secondary).toBeNull();
	});
});

describe("rowStates", () => {
	test("passed / current / next / upcoming down the list", () => {
		expect(rowStates(at(...THU, 13, 20), today, state(13, 20))).toEqual({
			imsak: "passed",
			subuh: "passed",
			syuruk: "passed",
			zohor: "current",
			asar: "upcoming",
			maghrib: "upcoming",
			isyak: "upcoming",
		});
		expect(rowStates(at(...THU, 14, 0), today, state(14, 0))).toMatchObject({
			zohor: "passed",
			asar: "next",
			maghrib: "upcoming",
		});
	});

	test("after Isyak everything today has passed", () => {
		const rows = rowStates(at(...THU, 22, 0), today, state(22, 0));
		expect(Object.values(rows).every((s) => s === "passed")).toBe(true);
	});
});

test("prayerWindows: five windows in order", () => {
	expect(prayerWindows(today, DEFAULTS).map((w) => w.key)).toEqual([
		"subuh",
		"zohor",
		"asar",
		"maghrib",
		"isyak",
	]);
});
