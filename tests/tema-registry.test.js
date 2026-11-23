// S0: one registry for tema ids, shared by the client and the server.
// The value is only useful if both sides agree, so this test pins the
// registry shape; `parseConfig` honouring it is proven with the parser.
import { describe, expect, test } from "bun:test";
import { DEFAULT_TEMA, isTema, TEMA_IDS, TEMAS, WEB_TEMAS } from "../shared/temas.js";

describe("tema registry", () => {
	test("ids are unique, non-empty and frozen", () => {
		expect(Array.isArray(TEMAS)).toBe(true);
		expect(TEMA_IDS.length).toBeGreaterThan(0);
		expect(new Set(TEMA_IDS).size).toBe(TEMA_IDS.length);
		for (const id of TEMA_IDS) expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
		expect(Object.isFrozen(TEMAS)).toBe(true);
	});

	test("every tema has a name, a mode the CSS can honour, and a web flag", () => {
		for (const tema of TEMAS) {
			expect(typeof tema.name).toBe("string");
			expect(tema.name.length).toBeGreaterThan(0);
			expect(["auto", "fixed"]).toContain(tema.mode);
			expect(typeof tema.web).toBe("boolean");
			expect(typeof tema.tv.layout).toBe("string");
			expect(tema.tv.layout.length).toBeGreaterThan(0);
		}
	});

	test("the default is one of the ids", () => {
		expect(TEMA_IDS).toContain(DEFAULT_TEMA);
		expect(isTema(DEFAULT_TEMA)).toBe(true);
		expect(isTema("nope")).toBe(false);
	});

	test("every web tema is a tema, with a page for it", () => {
		expect(WEB_TEMAS.length).toBeGreaterThan(0);
		for (const id of WEB_TEMAS) expect(TEMA_IDS).toContain(id);
		expect(WEB_TEMAS).toEqual(["langit", "takwim", "malam", "jalur", "dail", "kaca", "siang", "poster", "editorial", "mihrab", "kad", "papan"]);
	});

	test("every tema names a layout for each surface", () => {
		for (const t of TEMAS) {
			expect(typeof t.tv.layout).toBe("string");
			expect(typeof t.tvPortrait.layout).toBe("string");
			expect(t.swatch.ground).toMatch(/^#[0-9a-f]{6}$/i);
			expect(t.swatch.ink).toMatch(/^#[0-9a-f]{6}$/i);
			expect(t.swatch.accent).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});
});
