// S7/Jalur: the day band's geometry. Pure, so the placement rule that keeps
// Asar, Maghrib and Isyak from printing over each other is locked by a test.
import { describe, expect, test } from "bun:test";
import { clockPercent, dayPercent, MIN_GAP, ribbonMarks } from "../client/src/lib/waktu/ribbon.js";

// Malaysia time is UTC+8; the band is the visitor's own day.
const at = (h, m = 0) => Date.UTC(2026, 10, 23, h - 8, m);

const TIMES = {
	imsak: at(5, 40),
	subuh: at(5, 50),
	syuruk: at(6, 59),
	zohor: at(13, 2),
	asar: at(16, 25),
	maghrib: at(19, 0),
	isyak: at(20, 13),
};

describe("dayPercent / clockPercent", () => {
	test("midnight is the start, noon is half the band", () => {
		expect(clockPercent(at(0, 0))).toBe(0);
		expect(clockPercent(at(12, 0))).toBeCloseTo(50, 5);
		expect(dayPercent(at(0, 0))).toBeCloseTo(0, 5);
		expect(dayPercent(at(12, 0))).toBeCloseTo(50, 5);
	});

	test("seconds move the marker, by less than a tenth of a percent", () => {
		// 30 s is 0.035% of a day, a minute 0.069%.
		expect(dayPercent(at(12, 0) + 30_000)).toBeGreaterThan(50);
		expect(dayPercent(at(12, 0) + 30_000)).toBeLessThan(50.05);
		expect(dayPercent(at(12, 0) + 60_000)).toBeCloseTo(50.069, 3);
	});
});

describe("ribbonMarks", () => {
	const marks = ribbonMarks(TIMES, at(9, 0));

	test("the five prayers, in order, at their own positions", () => {
		expect(marks.map((m) => m.key)).toEqual(["subuh", "zohor", "asar", "maghrib", "isyak"]);
		expect(marks[0].left).toBeLessThan(marks[1].left);
		expect(marks[4].left).toBeLessThanOrEqual(100);
		expect(marks[2].label).toBe("Asar");
	});

	test("the ones before now are marked past, the rest are not", () => {
		expect(marks.filter((m) => m.past).map((m) => m.key)).toEqual(["subuh"]);
	});

	test("no two marks on the same row are closer than MIN_GAP", () => {
		for (let i = 0; i < marks.length; i++) {
			for (let j = i + 1; j < marks.length; j++) {
				if (marks[i].row !== marks[j].row) continue;
				expect(Math.abs(marks[i].left - marks[j].left)).toBeGreaterThanOrEqual(MIN_GAP);
			}
		}
	});

	test("a cluster of prayers still gets distinct rows", () => {
		const tight = ribbonMarks(
			{ ...TIMES, asar: at(18, 30), maghrib: at(18, 50), isyak: at(19, 10) },
			at(9, 0),
		);
		const rows = tight.slice(2).map((m) => m.row);
		expect(new Set(rows).size).toBeGreaterThan(1);
	});
});
