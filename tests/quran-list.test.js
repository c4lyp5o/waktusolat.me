// GET /quran: the surah index. Additive fields for the revamped index:
// Malay meaning, verse count, Makkiyah/Madaniyah.
import { expect, test } from "bun:test";
import { call } from "./app.js";

test("each surah keeps its old fields and adds meaning, verses, type", async () => {
	const { data } = await (await call("/quran")).json();
	expect(data).toHaveLength(114);
	expect(data[0]).toMatchObject({
		number: 1,
		name: "الفاتحة",
		transliteration: "Al-Fatihah",
		translation: "The Opener",
		meaning: "Pembukaan",
		verses: 7,
		type: "meccan",
	});
	expect(data[1]).toMatchObject({ number: 2, verses: 286, type: "medinan" });
	expect(data.reduce((n, s) => n + s.verses, 0)).toBe(6236);
});
