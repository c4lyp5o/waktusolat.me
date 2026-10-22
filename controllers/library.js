// library.js — data registry for waktusolat.me.
//
// Prayer-time JSONs are loaded at runtime from data/times/<zone>.json
// (gitignored). The zone list, negeri and display names live in zones.js.

import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ZONES } from "./zones.js";

const quranmy = JSON.parse(
	readFileSync(join(import.meta.dir, "../data/quran/quran_id.json"), "utf8"),
);
const quranen = JSON.parse(
	readFileSync(join(import.meta.dir, "../data/quran/quran_en.json"), "utf8"),
);
const readJson = (rel) => JSON.parse(readFileSync(join(import.meta.dir, rel), "utf8"));

const bukhari = readJson("../data/hadith/sahih-bukhari.json");
const muslim = readJson("../data/hadith/sahih-muslim.json");
const abu_daud = readJson("../data/hadith/sunan-abu-daud.json");
const nasai = readJson("../data/hadith/sunan-al-nasai.json");
const tirmizi = readJson("../data/hadith/sunan-al-tirmizi.json");
const ibnu_majah = readJson("../data/hadith/sunan-ibnu-majah.json");

const Quranen = quranen.holyQuran;
const Quranmy = quranmy.holyQuran;
const BukhariBook = bukhari;
const MuslimBook = muslim;
const AbudaudBook = abu_daud;
const NasaiBook = nasai;
const TirmiziBook = tirmizi;
const IbnumajahBook = ibnu_majah;

// Prayer-time DBs live in data/times/ (gitignored, refreshed by
// utils/timesRefresh.js in the background — at boot and when stale).
// Files are cached in memory keyed by mtime, so a background refresh is
// picked up on the next access without a restart. Missing/error files
// (e.g. zones JAKIM does not publish) get an empty db — TimeHelpers
// returns an explicit empty set for them instead of crashing.
const timesCache = new Map(); // zone -> { mtimeMs, rows }

export function readPrayerTimes(zone) {
	try {
		const file = join(import.meta.dir, "../data/times/", `${zone}.json`);
		const mtimeMs = statSync(file).mtimeMs;
		const cached = timesCache.get(zone);
		if (cached && cached.mtimeMs === mtimeMs) return cached.rows;
		const parsed = JSON.parse(readFileSync(file, "utf8"));
		const rows = Array.isArray(parsed.prayerTime) ? parsed.prayerTime : [];
		timesCache.set(zone, { mtimeMs, rows });
		return rows;
	} catch {
		timesCache.delete(zone);
		return [];
	}
}

// zone -> { db (live, mtime-cached), negeri, name }
const Zones = Object.fromEntries(
	Object.entries(ZONES).map(([zone, info]) => [
		zone,
		{
			get db() {
				return readPrayerTimes(zone);
			},
			...info,
		},
	]),
);

export {
	AbudaudBook,
	BukhariBook,
	IbnumajahBook,
	MuslimBook,
	NasaiBook,
	Quranen,
	Quranmy,
	TirmiziBook,
	Zones,
};
