// Site: the sky phase behind the lead, from the zone's real prayer times.
import { expect, test } from "bun:test";
import { mytEpoch } from "../client/src/lib/waktu/mytime.js";
import { JAWI } from "../client/src/lib/waktu/names.js";
import { skyPhase } from "../client/src/lib/waktu/sky.js";

const at = (h, m) => mytEpoch(2026, 10, 22, h, m);
const today = {
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

test("each window of the day has its sky, boundaries inclusive at the start", () => {
	const cases = [
		[at(2, 0), "malam"],
		[at(5, 38), "malam"],
		[at(5, 39), "subuh"],
		[at(6, 55), "subuh"],
		[at(6, 56), "pagi"],
		[at(13, 1), "zohor"],
		[at(16, 18), "asar"],
		[at(18, 59), "asar"],
		[at(19, 0), "senja"],
		[at(20, 10), "malam"],
		[at(23, 59), "malam"],
	];
	for (const [t, phase] of cases) expect(skyPhase(t, today)).toBe(phase);
});

test("Jawi names for every prayer and for Jumaat", () => {
	expect(JAWI).toMatchObject({
		imsak: "إمساك",
		subuh: "صبح",
		syuruk: "شروق",
		zohor: "ظهر",
		asar: "عصر",
		maghrib: "مغرب",
		isyak: "عشاء",
		jumaat: "جمعة",
	});
});
