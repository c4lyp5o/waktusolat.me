// /m/:id: settings -> config, cache, the 2-hour drop-off, the "when" line,
// and the banner's rotation.
import { describe, expect, test } from "bun:test";
import { DEFAULTS } from "../client/src/lib/waktu/config.js";
import {
	bannerSlot,
	DROP_AFTER_MS,
	liveProgrammes,
	mosqueConfig,
	readMosque,
	whenLine,
	writeMosque,
} from "../client/src/lib/waktu/mosqueTv.js";
import { mytEpoch } from "../client/src/lib/waktu/mytime.js";
import { parseRow } from "../client/src/lib/waktu/rows.js";

const row = (d, maghrib = "19:01:00", isha = "20:10:00") =>
	parseRow({
		date: `${d}/10/2026 / ${d}/Oktober/2026`,
		imsak: "05:38:00",
		fajr: "05:48:00",
		syuruk: "06:55:00",
		dhuhr: "13:00:00",
		asr: "16:20:00",
		maghrib,
		isha,
	});
const days = [row(23), row(24), row(26)];
const p = (id, extra = {}) => ({ id, title: `P${id}`, speaker: null, photo: null, ...extra });
const feed = {
	from: "2026-10-23",
	until: "2026-10-29",
	items: [
		{ date: "2026-10-23", at: { after: "isyak" }, programme: p("a") },
		{ date: "2026-10-23", at: { time: "10:00" }, programme: p("b") },
		{ date: "2026-10-24", at: { time: "09:00" }, programme: p("c") },
		{ date: "2026-10-26", at: { after: "maghrib" }, programme: p("d") },
		{ date: "2026-10-27", at: { after: "maghrib" }, programme: p("e") },
	],
};
const at = (d, h, m = 0) => mytEpoch(2026, 10, d, h, m);

describe("settings and cache", () => {
	test("the mosque's settings become the TV config", () => {
		const m = {
			name: "Masjid Al-Ikhlas",
			zone: "wly01",
			iqamah: { subuh: 15, zohor: 10, asar: 10, maghrib: 5, isyak: 10 },
			jumaat: 25,
			solat: 12,
		};
		expect(mosqueConfig(m)).toEqual({
			...DEFAULTS,
			iqamah: m.iqamah,
			jumaat: 25,
			solat: 12,
			nama: "Masjid Al-Ikhlas",
			now: null,
		});
	});

	test("cache round-trip; blocked or corrupt storage reads as nothing", () => {
		const map = new Map();
		const s = { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, v) };
		const entry = {
			mosque: { zone: "wly01" },
			mosqueTag: 'W/"1"',
			feed,
			feedTag: null,
			gone: false,
		};
		writeMosque(s, "abc", entry);
		expect(readMosque(s, "abc")).toEqual(entry);
		expect(readMosque(null, "abc")).toBeNull();
		writeMosque(null, "abc", entry); // no throw
		map.set("tv:mosque:v1:x", "{bad");
		expect(readMosque(s, "x")).toBeNull();
	});
});

describe("live programmes", () => {
	test("in date then real-time order; today's 10:00 before tonight's Isyak", () => {
		const live = liveProgrammes(feed, days, at(23, 9));
		expect(live.map((i) => i.programme.id)).toEqual(["b", "a", "c", "d", "e"]);
		expect(live[1].start).toBe(at(23, 20, 10));
		expect(live.at(-1).start).toBeNull(); // 27 Oct times not loaded
	});

	test("an occurrence drops 2 hours after it starts, and past days go", () => {
		expect(liveProgrammes(feed, days, at(23, 12)).map((i) => i.programme.id)).toEqual([
			"b",
			"a",
			"c",
			"d",
			"e",
		]);
		expect(liveProgrammes(feed, days, at(23, 12, 1)).map((i) => i.programme.id)).toEqual([
			"a",
			"c",
			"d",
			"e",
		]);
		const afterIsyak = at(23, 20, 10) + DROP_AFTER_MS;
		expect(liveProgrammes(feed, days, afterIsyak).map((i) => i.programme.id)).toContain("a");
		expect(liveProgrammes(feed, days, afterIsyak + 1).map((i) => i.programme.id)).not.toContain(
			"a",
		);
		expect(liveProgrammes(feed, days, at(24, 0, 5)).map((i) => i.programme.id)).toEqual([
			"c",
			"d",
			"e",
		]);
	});

	test("an empty or missing feed is nothing", () => {
		expect(liveProgrammes(null, days, at(23, 9))).toEqual([]);
		expect(liveProgrammes({ items: [] }, days, at(23, 9))).toEqual([]);
	});
});

describe("when line", () => {
	const live = liveProgrammes(feed, days, at(23, 9));
	const by = (id) => live.find((i) => i.programme.id === id);
	test("Hari ini / Malam ini / Esok / a date, with real prayer times", () => {
		expect(whenLine(by("b"), at(23, 9))).toBe("Hari ini · 10:00 pagi");
		// 23 Oct 2026 is a Friday; after Isyak in the evening.
		expect(whenLine(by("a"), at(23, 9))).toBe("Malam ini · selepas Isyak (8:10 malam)");
		expect(whenLine(by("c"), at(23, 9))).toBe("Esok · 9:00 pagi");
		expect(whenLine(by("d"), at(23, 9))).toBe("Isnin, 26 Oktober · selepas Maghrib (7:01 malam)");
		expect(whenLine(by("e"), at(23, 9))).toBe("Selasa, 27 Oktober · selepas Maghrib");
	});
});

describe("banner rotation", () => {
	test("every programme, then one ayat or hadith, repeating", () => {
		const seq = Array.from({ length: 8 }, (_, i) => bannerSlot(i, 3));
		expect(seq).toEqual([
			{ programme: 0 },
			{ programme: 1 },
			{ programme: 2 },
			{ quote: true },
			{ programme: 0 },
			{ programme: 1 },
			{ programme: 2 },
			{ quote: true },
		]);
	});
	test("no programmes: always ayat and hadith, as today", () => {
		expect(bannerSlot(0, 0)).toEqual({ quote: true });
		expect(bannerSlot(5, 0)).toEqual({ quote: true });
	});
});
