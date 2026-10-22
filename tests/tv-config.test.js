// TV display: Malaysia-time helpers, prayer names and URL config.
import { describe, expect, test } from "bun:test";
import { DEFAULTS, parseConfig } from "../client/src/lib/waktu/config.js";
import { mytEpoch, mytParts } from "../client/src/lib/waktu/mytime.js";
import { ADVISORY, ORDER, PRAYERS, prayerLabel } from "../client/src/lib/waktu/names.js";

describe("mytime", () => {
	test("wall time in Malaysia is UTC+8 regardless of process TZ", () => {
		// 2026-10-23 05:00 UTC is 13:00 in Kuala Lumpur.
		const epoch = Date.UTC(2026, 9, 23, 5, 0, 0);
		expect(mytParts(epoch)).toMatchObject({
			year: 2026,
			month: 10,
			day: 23,
			hour: 13,
			minute: 0,
			weekday: 5,
		});
		expect(mytEpoch(2026, 10, 23, 13, 0, 0)).toBe(epoch);
	});

	test("the Malaysian date rolls over at 16:00 UTC", () => {
		expect(mytParts(Date.UTC(2026, 11, 31, 15, 59, 59)).day).toBe(31);
		expect(mytParts(Date.UTC(2026, 11, 31, 16, 0, 0))).toMatchObject({
			year: 2027,
			month: 1,
			day: 1,
		});
	});
});

describe("names", () => {
	test("five prayers, two advisory times, seven in display order", () => {
		expect(PRAYERS).toEqual(["subuh", "zohor", "asar", "maghrib", "isyak"]);
		expect(ADVISORY).toEqual(["imsak", "syuruk"]);
		expect(ORDER).toEqual(["imsak", "subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"]);
	});

	test("Zohor is Jumaat on a Friday in Malaysia time only", () => {
		const fri = mytEpoch(2026, 10, 23, 13, 0, 0); // Friday
		const thu = mytEpoch(2026, 10, 22, 13, 0, 0);
		expect(prayerLabel("zohor", fri)).toBe("Jumaat");
		expect(prayerLabel("zohor", thu)).toBe("Zohor");
		expect(prayerLabel("asar", fri)).toBe("Asar");
		// Thu 23:30 UTC is already Fri 07:30 in KL.
		expect(prayerLabel("zohor", Date.UTC(2026, 9, 22, 23, 30))).toBe("Jumaat");
	});
});

describe("parseConfig", () => {
	const parse = (qs, mode = "production") => parseConfig(new URLSearchParams(qs), mode);

	test("defaults: iqamah 10 each, Jumaat 30, solat 10", () => {
		expect(parse("")).toEqual(DEFAULTS);
		expect(DEFAULTS).toMatchObject({
			iqamah: { subuh: 10, zohor: 10, asar: 10, maghrib: 10, isyak: 10 },
			jumaat: 30,
			solat: 10,
			nama: null,
			now: null,
		});
	});

	test("valid values are taken", () => {
		const c = parse("iqamah=10,8,10,5,12&jumaat=25&solat=12&nama=%20Masjid%20Al-Ikhlas%20");
		expect(c.iqamah).toEqual({ subuh: 10, zohor: 8, asar: 10, maghrib: 5, isyak: 12 });
		expect(c).toMatchObject({ jumaat: 25, solat: 12, nama: "Masjid Al-Ikhlas" });
	});

	test("each invalid field falls back to its own default", () => {
		for (const bad of [
			"10,10",
			"10,10,10,10,10,10",
			"a,b,c,d,e",
			"10,10,10,10,61",
			"-1,10,10,10,10",
			"1.5,10,10,10,10",
			"",
		]) {
			expect(parse(`iqamah=${bad}&jumaat=20`).iqamah).toEqual(DEFAULTS.iqamah);
		}
		expect(parse("jumaat=91").jumaat).toBe(30);
		expect(parse("jumaat=x").jumaat).toBe(30);
		expect(parse("solat=0").solat).toBe(10);
		expect(parse("solat=61").solat).toBe(10);
		expect(parse(`nama=${"x".repeat(61)}`).nama).toBeNull();
		expect(parse("nama=%20%20").nama).toBeNull();
	});

	test("?now= is a Malaysia wall time, honoured only outside production", () => {
		expect(parse("now=2026-10-23T13:05", "development").now).toBe(mytEpoch(2026, 10, 23, 13, 5, 0));
		expect(parse("now=2026-10-23T13:05:30", "staging").now).toBe(mytEpoch(2026, 10, 23, 13, 5, 30));
		expect(parse("now=2026-10-23T13:05", "production").now).toBeNull();
		expect(parse("now=yesterday", "development").now).toBeNull();
		expect(parse("now=2026-13-40T25:99", "development").now).toBeNull();
	});
});
