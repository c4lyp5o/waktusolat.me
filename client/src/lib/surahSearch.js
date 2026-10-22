// surahSearch.js — find a surah the way people type it: "yasin" for Ya-Sin,
// "baqarah" for Al-Baqarah, a number, or a word of its meaning.

const squash = (s) =>
	String(s ?? "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]/g, "");

// The Arabic article in its transliterated forms (Al-, An-, Ar-, ...).
const ARTICLE = /^(al|an|ar|as|at|ad|az|ash|adh)(?=[a-z]{3})/;
const bare = (s) => s.replace(ARTICLE, "");

export function searchSurahs(list, query) {
	const q = squash(query);
	if (!q) return list;
	if (/^\d+$/.test(q)) {
		const exact = list.filter((s) => String(s.number) === q);
		return [
			...exact,
			...list.filter((s) => String(s.number).startsWith(q) && String(s.number) !== q),
		];
	}
	const qb = bare(q);
	const byName = [];
	const byMeaning = [];
	for (const s of list) {
		const t = squash(s.transliteration);
		if (t.startsWith(q) || bare(t).startsWith(qb)) byName.push(s);
		else if (t.includes(q) || squash(s.meaning).includes(q) || squash(s.translation).includes(q)) {
			byMeaning.push(s);
		}
	}
	return [...byName, ...byMeaning];
}
