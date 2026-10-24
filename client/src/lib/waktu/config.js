// config.js — the TV display's settings, read from the URL query.
//
// /tv/wly01?iqamah=10,8,10,5,10&jumaat=30&solat=10&nama=Masjid%20Al-Ikhlas&tema=songket
// Every field is validated on its own; an invalid value falls back to that
// field's default and is never shown. `now` (a fixed Malaysia wall time for
// previews and screenshots) is honoured only outside production builds.
import { mytEpoch } from "./mytime.js";
import { PRAYERS } from "./names.js";

// The TV's themes (SPEC-redesign.md); the first is the default.
export const TEMAS = Object.freeze(["langit", "takwim", "songket"]);

export const DEFAULTS = Object.freeze({
	iqamah: Object.freeze({ subuh: 10, zohor: 10, asar: 10, maghrib: 10, isyak: 10 }),
	jumaat: 30,
	solat: 10,
	nama: null,
	tema: "langit",
	now: null,
});

const MAX_NAME = 60;

// A whole number in [min, max], or null.
function intIn(value, min, max) {
	if (value === null || !/^\d{1,3}$/.test(value)) return null;
	const n = Number(value);
	return n >= min && n <= max ? n : null;
}

function parseIqamah(value) {
	const parts = String(value ?? "").split(",");
	if (parts.length !== PRAYERS.length) return DEFAULTS.iqamah;
	const minutes = parts.map((p) => intIn(p.trim(), 0, 60));
	if (minutes.includes(null)) return DEFAULTS.iqamah;
	return Object.fromEntries(PRAYERS.map((key, i) => [key, minutes[i]]));
}

function parseName(value) {
	const name = String(value ?? "").trim();
	return name && name.length <= MAX_NAME ? name : null;
}

// "2026-10-23T13:05" or "2026-10-23T13:05:30", as Malaysia wall time.
function parseNow(value) {
	const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(value ?? ""));
	if (!m) return null;
	const [year, month, day, hour, minute, second] = m.slice(1).map((v) => Number(v ?? 0));
	if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
		return null;
	}
	return mytEpoch(year, month, day, hour, minute, second);
}

export function parseConfig(params, mode) {
	return {
		iqamah: params.has("iqamah") ? parseIqamah(params.get("iqamah")) : DEFAULTS.iqamah,
		jumaat: intIn(params.get("jumaat"), 0, 90) ?? DEFAULTS.jumaat,
		solat: intIn(params.get("solat"), 1, 60) ?? DEFAULTS.solat,
		nama: parseName(params.get("nama")),
		tema: TEMAS.includes(params.get("tema")) ? params.get("tema") : DEFAULTS.tema,
		now: mode !== "production" && params.has("now") ? parseNow(params.get("now")) : null,
	};
}
