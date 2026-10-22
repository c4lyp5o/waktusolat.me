// TV display: day-track geometry (shared by the SVG and three.js renderers).
import { describe, expect, test } from "bun:test";
import { dayTrack, STARS, TRACK_PAD } from "../client/src/lib/waktu/daytrack.js";
import { mytEpoch } from "../client/src/lib/waktu/mytime.js";

// Real WLY01 times for 22 Oct 2026.
const at = (h, m) => mytEpoch(2026, 10, 22, h, m);
const day = {
	times: {
		imsak: at(5, 39),
		subuh: at(5, 49),
		syuruk: at(6, 56),
		zohor: at(13, 1),
		asar: at(16, 18),
		maghrib: at(19, 0),
		isyak: at(20, 10),
	},
};

describe("dayTrack", () => {
	test("axis runs Subuh -> Isyak; Imsak is left to the list (10 min from Subuh)", () => {
		const { ticks } = dayTrack(at(12, 0), day);
		expect(ticks.map((t) => t.key)).toEqual([
			"subuh",
			"syuruk",
			"zohor",
			"asar",
			"maghrib",
			"isyak",
		]);
		expect(ticks[0].x).toBeCloseTo(TRACK_PAD, 6);
		expect(ticks.at(-1).x).toBeCloseTo(1 - TRACK_PAD, 6);
	});

	test("ticks sit at their true times, in order", () => {
		const { ticks } = dayTrack(at(12, 0), day);
		const span = day.times.isyak - day.times.subuh;
		const zohor = ticks.find((t) => t.key === "zohor");
		expect(zohor.x).toBeCloseTo(
			TRACK_PAD + (1 - 2 * TRACK_PAD) * ((day.times.zohor - day.times.subuh) / span),
			6,
		);
		for (let i = 1; i < ticks.length; i++) expect(ticks[i].x).toBeGreaterThan(ticks[i - 1].x);
	});

	test("the sun rides the Syuruk -> Maghrib arc: low at the ends, highest at solar noon", () => {
		expect(dayTrack(at(6, 56), day).sun.lift).toBeCloseTo(0, 6);
		const noon = day.times.syuruk + (day.times.maghrib - day.times.syuruk) / 2;
		expect(dayTrack(noon, day).sun.lift).toBeCloseTo(1, 6);
		const mid = dayTrack(at(16, 18), day);
		expect(mid.sun.lift).toBeGreaterThan(0);
		expect(mid.sun.lift).toBeLessThan(1);
		// The sun's x is the time axis, so it sits on Asar's tick at Asar.
		expect(mid.sun.x).toBeCloseTo(mid.ticks.find((t) => t.key === "asar").x, 6);
	});

	test("no sun outside daylight; phases follow the day", () => {
		const cases = [
			[at(4, 0), "night"],
			[at(6, 0), "dawn"],
			[at(12, 0), "day"],
			[at(19, 30), "dusk"],
			[at(22, 0), "night"],
		];
		for (const [t, phase] of cases) {
			const track = dayTrack(t, day);
			expect(track.phase).toBe(phase);
			expect(track.sun === null).toBe(phase !== "day");
		}
	});

	test("the now marker is on the axis between Subuh and Isyak only", () => {
		expect(dayTrack(at(4, 0), day).nowX).toBeNull();
		expect(dayTrack(at(22, 0), day).nowX).toBeNull();
		expect(dayTrack(at(5, 49), day).nowX).toBeCloseTo(TRACK_PAD, 6);
	});

	test("arc spans Syuruk to Maghrib", () => {
		const { arc, ticks } = dayTrack(at(12, 0), day);
		expect(arc.from).toBeCloseTo(ticks.find((t) => t.key === "syuruk").x, 6);
		expect(arc.to).toBeCloseTo(ticks.find((t) => t.key === "maghrib").x, 6);
	});
});

// Regression: the old star formula ((i*0.618)%1, (i*0.382+0.13)%1) put every
// star on a few diagonal lines, which read as a dotted line, not a sky.
describe("STARS", () => {
	test("scattered: x and y uncorrelated, spread across the sky, above the horizon", () => {
		const n = STARS.length;
		const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
		const xs = STARS.map((s) => s.x);
		const ys = STARS.map((s) => s.y);
		const mx = mean(xs);
		const my = mean(ys);
		const cov = mean(STARS.map((s) => (s.x - mx) * (s.y - my)));
		const sd = (a, m) => Math.sqrt(mean(a.map((v) => (v - m) ** 2)));
		expect(Math.abs(cov / (sd(xs, mx) * sd(ys, my)))).toBeLessThan(0.3);
		// No three stars on one line through consecutive indices (the old bug).
		let collinear = 0;
		for (let i = 0; i + 2 < n; i++) {
			const [a, b, c] = [STARS[i], STARS[i + 1], STARS[i + 2]];
			const area = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
			if (area < 0.002) collinear++;
		}
		expect(collinear).toBeLessThanOrEqual(1);
		for (const s of STARS) {
			expect(s.x).toBeGreaterThanOrEqual(0.02);
			expect(s.x).toBeLessThanOrEqual(0.98);
			expect(s.y).toBeLessThanOrEqual(0.7); // y from the top: stars stay high
		}
		// Every third of the width has stars.
		for (const [lo, hi] of [
			[0, 1 / 3],
			[1 / 3, 2 / 3],
			[2 / 3, 1],
		]) {
			expect(xs.filter((x) => x >= lo && x < hi).length).toBeGreaterThanOrEqual(4);
		}
	});
});
