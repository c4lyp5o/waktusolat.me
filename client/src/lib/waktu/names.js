// names.js — prayer keys, display order and Malay labels for the TV display.
import { mytParts } from "./mytime.js";

// The five prayers that have an azan, an iqamah and a solat window.
export const PRAYERS = ["subuh", "zohor", "asar", "maghrib", "isyak"];
// Advisory times: listed, never the lead, no iqamah (spec: Screen states).
export const ADVISORY = ["imsak", "syuruk"];
// Display order down the list.
export const ORDER = ["imsak", "subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"];

// Field names in /api/v1/waktusolat rows.
export const API_FIELD = {
	imsak: "imsak",
	subuh: "fajr",
	syuruk: "syuruk",
	zohor: "dhuhr",
	asar: "asr",
	maghrib: "maghrib",
	isyak: "isha",
};

const LABEL = {
	imsak: "Imsak",
	subuh: "Subuh",
	syuruk: "Syuruk",
	zohor: "Zohor",
	asar: "Asar",
	maghrib: "Maghrib",
	isyak: "Isyak",
};

export const isFriday = (epochMs) => mytParts(epochMs).weekday === 5;

// On Friday (Malaysia time) Zohor is Jumaat.
export function prayerLabel(key, epochMs) {
	if (key === "zohor" && isFriday(epochMs)) return "Jumaat";
	return LABEL[key];
}
