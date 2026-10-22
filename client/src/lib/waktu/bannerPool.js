// bannerPool.js — content for the TV banner: short ayat and hadith from our
// own API, normalised to one shape and kept in localStorage so the banner
// keeps rotating offline.

// Fits two lines at the banner's 3.2vh at full width (no shrink-to-fit).
// At 160: 3,545 ayat; Bukhari 100, Muslim 108, Nasa'i 89 hadith.
export const BANNER_MAX = 160;
const ARABIC_MAX = 60; // one line beside the reference
const POOL_SIZE = 30;
const STORAGE_KEY = "tv:banner:v1";
// Books with enough short hadith to rotate without repeats (Abu Daud,
// Tirmizi and Ibnu Majah have 3-8 under the cap).
const HADITH_BOOKS = ["bukhari", "muslim", "nasai"];

// { kind, key, text, arabic, ref } or null.
export function normalizeAyat(body) {
	const d = body?.data;
	const text = d?.malayTranslation?.trim();
	const surah = String(d?.fromSurah ?? "").split(" / ")[1];
	if (!text || text.length > BANNER_MAX || !surah || !Number.isInteger(d.ayatNumber)) return null;
	const arabic = d.arabic?.trim();
	return {
		kind: "ayat",
		key: `q:${surah}:${d.ayatNumber}`,
		text,
		arabic: arabic && arabic.length <= ARABIC_MAX ? arabic : null,
		ref: `Surah ${surah}, ayat ${d.ayatNumber}`,
	};
}

// The dataset's id is not a canonical hadith number, so the reference shown
// is the kitab alone; the id only dedupes.
export function normalizeHadith(body) {
	const text = body?.hadis?.trim();
	if (!text || text.length > BANNER_MAX || !body.kitab) return null;
	return { kind: "hadith", key: `h:${body.kitab}:${body.id}`, text, arabic: null, ref: body.kitab };
}

// Rotation i: even -> an ayat, odd -> a hadith, cycling the books.
export function sourceFor(i) {
	if (i % 2 === 0)
		return { url: `/api/v1/quran/random?max=${BANNER_MAX}`, normalize: normalizeAyat };
	const book = HADITH_BOOKS[Math.floor(i / 2) % HADITH_BOOKS.length];
	return { url: `/api/v1/hadis/${book}?max=${BANNER_MAX}`, normalize: normalizeHadith };
}

export function addToPool(pool, item, size = POOL_SIZE) {
	return [...pool.filter((x) => x.key !== item.key), item].slice(-size);
}

// Offline: the item after lastKey, round-robin.
export function nextFromPool(pool, lastKey) {
	if (pool.length === 0) return null;
	const i = pool.findIndex((x) => x.key === lastKey);
	return pool[(i + 1) % pool.length];
}

export function loadPool(storage) {
	try {
		const pool = JSON.parse(storage.getItem(STORAGE_KEY));
		return Array.isArray(pool) ? pool.filter((x) => x?.key && x.text) : [];
	} catch {
		return [];
	}
}

export function savePool(storage, pool) {
	try {
		storage.setItem(STORAGE_KEY, JSON.stringify(pool));
	} catch {
		// Storage blocked or full: the banner still rotates for this load.
	}
}
