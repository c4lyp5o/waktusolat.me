// GET /quran/random and /hadis/:book with ?max= (short items for the TV
// banner) and the hadith reference (kitab, id). Additive: without max the
// responses keep their old shape.
import { describe, expect, test } from "bun:test";
import { call } from "./app.js";

const json = async (path) => {
	const res = await call(path);
	return { status: res.status, body: await res.json() };
};

describe("GET /quran/random", () => {
	test("without max: unchanged shape", async () => {
		const { status, body } = await json("/quran/random");
		expect(status).toBe(200);
		expect(Object.keys(body.data).sort()).toEqual(
			["arabic", "ayatNumber", "englishTranslation", "fromSurah", "malayTranslation"].sort(),
		);
	});

	test("with max=180: every Malay translation fits, and results still vary", async () => {
		const seen = new Set();
		for (let i = 0; i < 50; i++) {
			const { status, body } = await json("/quran/random?max=180");
			expect(status).toBe(200);
			expect(body.data.malayTranslation.length).toBeLessThanOrEqual(180);
			seen.add(`${body.data.fromSurah}:${body.data.ayatNumber}`);
		}
		expect(seen.size).toBeGreaterThan(1);
	});

	test("invalid max is a 400; a max nothing fits is a 404", async () => {
		for (const bad of ["0", "-5", "abc", "1.5", "100000"]) {
			expect((await call(`/quran/random?max=${bad}`)).status).toBe(400);
		}
		expect((await call("/quran/random?max=3")).status).toBe(404);
	});
});

describe("GET /hadis/:book", () => {
	test("adds the reference: kitab and id", async () => {
		const { status, body } = await json("/hadis/bukhari");
		expect(status).toBe(200);
		expect(typeof body.hadis).toBe("string");
		expect(body.kitab).toBe("Sahih Bukhari");
		expect(Number.isInteger(body.id)).toBe(true);
	});

	test("with max=180: every hadith fits (only ~2% of Bukhari does)", async () => {
		const seen = new Set();
		for (let i = 0; i < 50; i++) {
			const { status, body } = await json("/hadis/bukhari?max=180");
			expect(status).toBe(200);
			expect(body.hadis.length).toBeLessThanOrEqual(180);
			seen.add(body.id);
		}
		expect(seen.size).toBeGreaterThan(1);
	});

	test("unknown book stays 404; invalid max is 400", async () => {
		expect((await call("/hadis/nope?max=180")).status).toBe(404);
		expect((await call("/hadis/muslim?max=x")).status).toBe(400);
	});
});
