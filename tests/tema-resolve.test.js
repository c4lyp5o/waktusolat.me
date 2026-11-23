// S2/S5b: which tema paints the site. URL > remembered > default, and only a
// tema with a site page (all three today) is ever eligible for the web.
import { describe, expect, test } from "bun:test";
import { readSavedTema, resolveTema, saveTema, TEMA_KEY } from "../client/src/lib/tema.js";
import { DEFAULT_TEMA, WEB_TEMAS } from "../shared/temas.js";

// saveTema/applyTema touch <html> and fire the swap event; a tiny stub is enough.
const events = [];
globalThis.document = {
	documentElement: { dataset: {} },
	dispatchEvent: (e) => events.push(e.detail?.id),
};
const memoryStore = () => {
	const m = new Map();
	return {
		getItem: (k) => (m.has(k) ? m.get(k) : null),
		setItem: (k, v) => m.set(k, v),
		raw: m,
	};
};

describe("resolveTema", () => {
	test("URL wins, then the remembered choice, then the default", () => {
		expect(resolveTema({ url: "langit", saved: null })).toBe("langit");
		expect(resolveTema({ url: null, saved: "langit" })).toBe("langit");
		expect(resolveTema({ url: "papan", saved: "langit" })).toBe("papan");
		expect(resolveTema({})).toBe(DEFAULT_TEMA);
	});

	test("an unknown value never wins", () => {
		expect(resolveTema({ url: "neon", saved: "langit" })).toBe("langit");
		expect(resolveTema({ url: "songket", saved: "takwim" })).toBe("takwim");
		expect(resolveTema({ url: "", saved: "" })).toBe(DEFAULT_TEMA);
		expect(resolveTema({ url: "__proto__" })).toBe(DEFAULT_TEMA);
	});

	test("every tema with a site page is eligible, and only those", () => {
		expect(WEB_TEMAS).toEqual(["langit", "takwim", "malam", "jalur", "dail", "kaca", "siang", "poster", "editorial", "mihrab", "kad", "papan"]);
		for (const id of WEB_TEMAS) {
			expect(resolveTema({ url: id })).toBe(id);
			expect(resolveTema({ saved: id })).toBe(id);
		}
		// A retired tema stays out even as the fallback.
		expect(resolveTema({ url: "songket" })).toBe(DEFAULT_TEMA);
		expect(resolveTema({ fallback: "songket" })).toBe(DEFAULT_TEMA);
	});
});

describe("saveTema", () => {
	test("stores and paints an eligible tema", () => {
		const store = memoryStore();
		expect(saveTema("takwim", store)).toBe(true);
		expect(store.getItem(TEMA_KEY)).toBe("takwim");
		expect(document.documentElement.dataset.tema).toBe("takwim");
	});

	test("painting tells the page, so it can swap without a reload", () => {
		events.length = 0;
		saveTema("papan", memoryStore());
		expect(events.at(-1)).toBe("papan");
	});

	test("refuses a tema with no site page", () => {
		const store = memoryStore();
		expect(saveTema("songket", store)).toBe(false);
		expect(store.getItem(TEMA_KEY)).toBe(null);
	});

	test("a blocked store still applies for this visit", () => {
		const blocked = {
			getItem: () => null,
			setItem: () => {
				throw new Error("blocked");
			},
		};
		expect(() => saveTema("langit", blocked)).not.toThrow();
		expect(saveTema("langit", blocked)).toBe(true);
		expect(document.documentElement.dataset.tema).toBe("langit");
	});

	test("reading a missing or broken store is null, not a throw", () => {
		expect(readSavedTema(null)).toBe(null);
		expect(
			readSavedTema({
				getItem: () => {
					throw new Error("x");
				},
			}),
		).toBe(null);
	});
});
