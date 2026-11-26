// row-state vocabulary — CSS may only key off the states the schedule emits.
//
// This exists because it went wrong silently: `rowStates` emits `passed`, and
// thirteen stylesheets were written against `[data-state="past"]`, a selector
// that never matched. Nothing failed — the rows simply never dimmed. A test on
// the vocabulary is cheap; noticing missing dimming on a wall is not.

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { rowStates } from "../client/src/lib/waktu/schedule.js";

const SRC = join(import.meta.dir, "..", "client", "src");
// The ribbon paints its own marks and has its own vocabulary.
const OWN_VOCABULARY = new Set(["ribbon.css"]);

function cssFiles(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const path = join(dir, name);
		if (statSync(path).isDirectory()) cssFiles(path, out);
		else if (name.endsWith(".css")) out.push(path);
	}
	return out;
}

// Every state the schedule can put on a row, derived from the code itself:
// one real day, walked through each kind of window.
const DAY = {
	isoDate: "2026-11-23",
	hijri: "13 Jamadilakhir 1448",
	times: {
		imsak: Date.UTC(2026, 10, 22, 21, 40),
		subuh: Date.UTC(2026, 10, 22, 21, 50),
		syuruk: Date.UTC(2026, 10, 22, 22, 59),
		zohor: Date.UTC(2026, 10, 23, 5, 2),
		asar: Date.UTC(2026, 10, 23, 8, 25),
		maghrib: Date.UTC(2026, 10, 23, 11, 0),
		isyak: Date.UTC(2026, 10, 23, 12, 13),
	},
};

function emit(at, kind) {
	return Object.values(
		rowStates(at, DAY, { kind, prayer: "zohor", target: at, azan: at, iqamah: at }),
	);
}

describe("row-state vocabulary", () => {
	const states = new Set([
		...emit(DAY.times.imsak - 1, "countdown"),
		...emit(DAY.times.zohor, "iqamah"),
		...emit(DAY.times.zohor, "solat"),
	]);

	test("the schedule emits a small, known set of states", () => {
		expect([...states].sort()).toEqual(["current", "next", "passed", "upcoming"]);
	});

	test("every stylesheet keys off those states, and only those", () => {
		const offenders = [];
		for (const path of cssFiles(SRC)) {
			const css = readFileSync(path, "utf8");
			const allowed = OWN_VOCABULARY.has(path.split("/").pop())
				? new Set([...states, "past"])
				: states;
			for (const match of css.matchAll(/data-state="([a-z-]+)"/g)) {
				if (!allowed.has(match[1])) {
					offenders.push(`${relative(SRC, path)}: data-state="${match[1]}"`);
				}
			}
		}
		expect(offenders).toEqual([]);
	});
});
