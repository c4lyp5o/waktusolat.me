// Quran index search: forgiving of spelling, by number or by meaning.
import { expect, test } from "bun:test";
import { searchSurahs } from "../client/src/lib/surahSearch.js";

const en = JSON.parse(await Bun.file("data/quran/quran_en.json").text()).holyQuran;
const my = JSON.parse(await Bun.file("data/quran/quran_id.json").text()).holyQuran;
const list = en.map((s, i) => ({
	number: s.id,
	transliteration: s.transliteration,
	translation: s.translation,
	meaning: my[i].translation,
}));
const nums = (q) => searchSurahs(list, q).map((s) => s.number);

test("spellings people type: no hyphens, no article, no apostrophes", () => {
	expect(nums("yasin")[0]).toBe(36);
	expect(nums("ya sin")[0]).toBe(36);
	expect(nums("baqarah")[0]).toBe(2);
	expect(nums("al-baqarah")[0]).toBe(2);
	expect(nums("rahman")[0]).toBe(55);
	expect(nums("mulk")[0]).toBe(67);
});

test("by number: the exact surah first", () => {
	expect(nums("36")[0]).toBe(36);
	expect(nums("1")[0]).toBe(1);
});

test("by meaning (Malay or English)", () => {
	expect(nums("lebah")).toContain(16);
	expect(nums("cave")).toContain(18);
});

test("empty query lists all 114 in order", () => {
	expect(nums("")).toHaveLength(114);
	expect(nums("  ")[113]).toBe(114);
	expect(nums("zzzz")).toEqual([]);
});
