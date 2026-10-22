// TV display: the banner's content pool (ayat and hadith, kept for offline).
import { describe, expect, test } from "bun:test";
import {
	addToPool,
	BANNER_MAX,
	loadPool,
	nextFromPool,
	normalizeAyat,
	normalizeHadith,
	savePool,
	sourceFor,
} from "../client/src/lib/waktu/bannerPool.js";

const ayatBody = {
	data: {
		fromSurah: "الإخلاص / Al-Ikhlas",
		ayatNumber: 1,
		arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
		englishTranslation: "Say, He is Allah, [who is] One,",
		malayTranslation: "Katakanlah (wahai Muhammad): (Tuhanku) ialah Allah Yang Maha Esa;",
	},
};
const hadithBody = { hadis: "Agama itu nasihat.", kitab: "Sahih Muslim", id: 82 };

function memoryStorage({ fail = false } = {}) {
	const map = new Map();
	const guard =
		(fn) =>
		(...a) => {
			if (fail) throw new Error("blocked");
			return fn(...a);
		};
	return {
		getItem: guard((k) => map.get(k) ?? null),
		setItem: guard((k, v) => map.set(k, v)),
		map,
	};
}

describe("normalize", () => {
	test("ayat: Malay text, surah + ayat reference, short Arabic kept", () => {
		expect(normalizeAyat(ayatBody)).toEqual({
			kind: "ayat",
			key: "q:Al-Ikhlas:1",
			text: "Katakanlah (wahai Muhammad): (Tuhanku) ialah Allah Yang Maha Esa;",
			arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
			ref: "Surah Al-Ikhlas, ayat 1",
		});
	});

	test("ayat: Arabic over 60 characters is dropped (one line on the banner)", () => {
		const long = { data: { ...ayatBody.data, arabic: "ا".repeat(61) } };
		expect(normalizeAyat(long).arabic).toBeNull();
	});

	test("hadith: text and kitab as the reference (dataset id is for dedupe only)", () => {
		expect(normalizeHadith(hadithBody)).toEqual({
			kind: "hadith",
			key: "h:Sahih Muslim:82",
			text: "Agama itu nasihat.",
			arabic: null,
			ref: "Sahih Muslim",
		});
	});

	test("malformed or over-long bodies are rejected", () => {
		expect(normalizeAyat({})).toBeNull();
		expect(normalizeHadith({ hadis: "" })).toBeNull();
		expect(normalizeHadith({ ...hadithBody, hadis: "x".repeat(BANNER_MAX + 1) })).toBeNull();
	});
});

describe("sources", () => {
	test("alternate ayat and hadith; hadith cycles the books with enough short items", () => {
		const urls = Array.from({ length: 8 }, (_, i) => sourceFor(i).url);
		expect(urls).toEqual([
			`/api/v1/quran/random?max=${BANNER_MAX}`,
			`/api/v1/hadis/bukhari?max=${BANNER_MAX}`,
			`/api/v1/quran/random?max=${BANNER_MAX}`,
			`/api/v1/hadis/muslim?max=${BANNER_MAX}`,
			`/api/v1/quran/random?max=${BANNER_MAX}`,
			`/api/v1/hadis/nasai?max=${BANNER_MAX}`,
			`/api/v1/quran/random?max=${BANNER_MAX}`,
			`/api/v1/hadis/bukhari?max=${BANNER_MAX}`,
		]);
	});
});

describe("pool", () => {
	const a = normalizeAyat(ayatBody);
	const h = normalizeHadith(hadithBody);

	test("dedupes by key, newest last, capped", () => {
		let pool = addToPool([], a);
		pool = addToPool(pool, h);
		pool = addToPool(pool, a);
		expect(pool.map((x) => x.key)).toEqual([h.key, a.key]);
		const many = Array.from({ length: 40 }, (_, i) => ({ ...h, key: `h:${i}` }));
		expect(many.reduce((p, x) => addToPool(p, x, 30), [])).toHaveLength(30);
	});

	test("offline rotation walks the pool round-robin", () => {
		const pool = [a, h];
		expect(nextFromPool(pool, null)).toBe(a);
		expect(nextFromPool(pool, a.key)).toBe(h);
		expect(nextFromPool(pool, h.key)).toBe(a);
		expect(nextFromPool(pool, "gone")).toBe(a);
		expect(nextFromPool([], null)).toBeNull();
	});

	test("persists across reloads; blocked storage reads as empty", () => {
		const storage = memoryStorage();
		savePool(storage, [a, h]);
		expect(loadPool(storage)).toEqual([a, h]);
		storage.map.set("tv:banner:v1", "{bad");
		expect(loadPool(storage)).toEqual([]);
		expect(loadPool(memoryStorage({ fail: true }))).toEqual([]);
		expect(() => savePool(memoryStorage({ fail: true }), [a])).not.toThrow();
		expect(loadPool(null)).toEqual([]);
	});
});
