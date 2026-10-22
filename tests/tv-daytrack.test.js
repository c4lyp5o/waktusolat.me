// TV display: day-track geometry (shared by the SVG and three.js renderers).
import { describe, expect, test } from "bun:test";
import { dayTrack, TRACK_PAD } from "../client/src/tv/lib/daytrack.js";
import { mytEpoch } from "../client/src/tv/lib/mytime.js";

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
