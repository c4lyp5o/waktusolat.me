// mosque-editor: token memory, programme wording, photo crop.
import { describe, expect, test } from "bun:test";
import { tvPath } from "../client/src/lib/mosqueApi.js";
import {
	forgetMosque,
	fragmentToken,
	loadMosques,
	rememberMosque,
	tokenFor,
} from "../client/src/lib/mosqueKeys.js";
import { cropSquare } from "../client/src/lib/photo.js";
import {
	atText,
	clockText,
	dayLabel,
	nextDate,
	resolveAt,
	whenText,
} from "../client/src/lib/programmeText.js";
import { isTvPath } from "../client/src/lib/routes.js";
import { parseRow } from "../client/src/lib/waktu/rows.js";

const TOKEN = "2Wirw5Ls5fvL-vQiK6X2j_4PWKBhp-ltr_OjHD1lPn4";
const memory = () => {
	const map = new Map();
	return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => map.set(k, String(v)) };
};

describe("mosqueKeys", () => {
	test("reads the token from the fragment only in its exact form", () => {
		expect(fragmentToken(`#k=${TOKEN}`)).toBe(TOKEN);
		expect(fragmentToken("#k=short")).toBeNull();
		expect(fragmentToken(`#x=${TOKEN}`)).toBeNull();
		expect(fragmentToken("")).toBeNull();
	});

	test("remembers newest first, replaces by id, forgets", () => {
		const s = memory();
		expect(rememberMosque(s, { id: "3h3efme7me", name: "A", token: TOKEN })).toBe(true);
		rememberMosque(s, { id: "73sb6g5vtc", name: "B", token: TOKEN });
		rememberMosque(s, { id: "3h3efme7me", name: "A2", token: TOKEN });
		expect(loadMosques(s).map((m) => m.name)).toEqual(["A2", "B"]);
		expect(tokenFor(s, "73sb6g5vtc")).toBe(TOKEN);
		forgetMosque(s, "73sb6g5vtc");
		expect(tokenFor(s, "73sb6g5vtc")).toBeNull();
	});

	test("blocked or corrupt storage is survivable", () => {
		expect(rememberMosque(null, { id: "3h3efme7me", name: "A", token: TOKEN })).toBe(false);
		expect(loadMosques(null)).toEqual([]);
		const s = memory();
		s.setItem("waktu:mosques", "{not json");
		expect(loadMosques(s)).toEqual([]);
		s.setItem("waktu:mosques", JSON.stringify([{ id: "../x", name: "A", token: TOKEN }]));
		expect(loadMosques(s)).toEqual([]);
	});
});

describe("programme wording", () => {
	const today = "2026-10-23"; // Friday
	// WLY01, Monday 26 Oct 2026 (Maghrib 19:01)
	const monday = parseRow({
		date: "26/10/2026 / 26/Oktober/2026",
		imsak: "05:38:00",
		fajr: "05:48:00",
		syuruk: "06:55:00",
		dhuhr: "13:00:00",
		asr: "16:20:00",
		maghrib: "19:01:00",
		isha: "20:10:00",
	});

	test("clock times in the Malay parts of the day", () => {
		expect(clockText("05:30")).toBe("5:30 pagi");
		expect(clockText("12:15")).toBe("12:15 tengah hari");
		expect(clockText("16:00")).toBe("4:00 petang");
		expect(clockText("21:00")).toBe("9:00 malam");
		expect(clockText("00:05")).toBe("12:05 pagi");
	});

	test("after a prayer, resolved from that day's real time; Friday Zohor is Jumaat", () => {
		expect(atText({ after: "maghrib" }, "2026-10-26", monday)).toBe("selepas Maghrib (7:01 malam)");
		expect(atText({ after: "maghrib" })).toBe("selepas Maghrib");
		expect(atText({ after: "zohor" }, "2026-10-23")).toBe("selepas Jumaat");
		expect(atText({ time: "21:00" }, "2026-10-26")).toBe("9:00 malam");
		expect(resolveAt({ after: "isyak" }, "2026-10-26", monday)).toBe(monday.times.isyak);
		expect(resolveAt({ after: "isyak" }, "2026-10-27", monday)).toBeNull();
	});

	test("when: weekly with its range, and one-off dates", () => {
		expect(whenText({ repeat: "weekly", weekday: 1, from: null, until: null }, today)).toBe(
			"Setiap Isnin",
		);
		expect(
			whenText({ repeat: "weekly", weekday: 1, from: "2026-11-02", until: "2026-11-30" }, today),
		).toBe("Setiap Isnin, mula Isnin, 2 November, hingga Isnin, 30 November");
		expect(whenText({ repeat: "once", date: "2026-10-31" }, today)).toBe("Sabtu, 31 Oktober");
		expect(whenText({ repeat: "once", date: "2027-01-02" }, today)).toBe("Sabtu, 2 Januari 2027");
		expect(dayLabel("2026-10-23", today)).toBe("Hari ini");
		expect(dayLabel("2026-10-24", today)).toBe("Esok");
	});

	test("next date for 'Cuti minggu ini': today counts, ranges respected", () => {
		const weekly = (weekday, from = null, until = null) => ({
			repeat: "weekly",
			weekday,
			from,
			until,
		});
		expect(nextDate(weekly(5), today)).toBe("2026-10-23");
		expect(nextDate(weekly(1), today)).toBe("2026-10-26");
		expect(nextDate(weekly(1, "2026-11-10"), today)).toBe("2026-11-16");
		expect(nextDate(weekly(1, null, "2026-10-25"), today)).toBeNull();
		expect(nextDate({ repeat: "once", date: today }, today)).toBeNull();
	});
});

describe("photo and TV link", () => {
	test("centred square crop", () => {
		expect(cropSquare(4000, 3000)).toEqual({ sx: 500, sy: 0, side: 3000 });
		expect(cropSquare(3000, 4000)).toEqual({ sx: 0, sy: 500, side: 3000 });
		expect(cropSquare(600, 600)).toEqual({ sx: 0, sy: 0, side: 600 });
	});

	test("the TV link is the short /m/:id", () => {
		expect(tvPath({ id: "7pb20m9j44", zone: "wly01" })).toBe("/m/7pb20m9j44");
	});

	test("TV paths get no site chrome; the mosque pages do", () => {
		for (const p of ["/tv/wly01", "/m/7pb20m9j44", "/m/7pb20m9j44/"])
			expect(isTvPath(p)).toBe(true);
		for (const p of ["/m/baru", "/m/baru/", "/m/7pb20m9j44/edit", "/", "/times/wly01", "/about"]) {
			expect(isTvPath(p)).toBe(false);
		}
	});
});
