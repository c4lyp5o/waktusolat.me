// Site revamp: zone search, remembered zone, theme resolution.
import { describe, expect, test } from "bun:test";
import { resolveTheme } from "../client/src/lib/theme.js";
import { loadZone, saveZone } from "../client/src/lib/zoneMemory.js";
import { buildZoneIndex, searchZones } from "../client/src/lib/zoneSearch.js";
import { ZONES } from "../controllers/zones.js";

const index = buildZoneIndex(ZONES);
const codes = (q) => searchZones(index, q).map((z) => z.code);

describe("searchZones", () => {
	test("finds a district by a few letters of any word", () => {
		expect(codes("gomb")).toEqual(["sgr01"]);
		expect(codes("shah alam")).toEqual(["sgr01"]);
		expect(codes("langk")).toEqual(["kdh06"]);
	});

	test("common short forms", () => {
		expect(codes("kl")).toContain("wly01");
		expect(codes("jb")).toContain("jhr02");
		expect(codes("kota kinabalu")).toContain("sbh07");
	});

	test("by state, and by zone code", () => {
		expect(codes("johor")).toEqual(["jhr01", "jhr02", "jhr03", "jhr04"]);
		expect(codes("WLY01")).toEqual(["wly01"]);
		expect(codes("jhr")).toEqual(["jhr01", "jhr02", "jhr03", "jhr04"]);
	});

	test("every word must match; case and punctuation ignored", () => {
		expect(codes("kuala lumpur")).toEqual(["wly01"]);
		expect(codes("  Kuala   LUMPUR, ")).toEqual(["wly01"]);
		expect(codes("kuala zzz")).toEqual([]);
	});

	test("results carry what the list shows", () => {
		expect(searchZones(index, "labuan")[0]).toMatchObject({
			code: "wly02",
			negeri: "Wilayah Persekutuan Labuan",
			name: "LABUAN",
		});
	});

	test("empty query: nothing (the page shows states instead)", () => {
		expect(codes("")).toEqual([]);
		expect(codes("   ")).toEqual([]);
	});
});

describe("zone memory", () => {
	const store = () => {
		const m = new Map();
		return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), m };
	};

	test("round-trips a valid zone code, lowercased", () => {
		const s = store();
		saveZone(s, "WLY01");
		expect(loadZone(s)).toBe("wly01");
	});

	test("ignores junk and blocked storage", () => {
		const s = store();
		s.m.set("waktu:zone", "<script>");
		expect(loadZone(s)).toBeNull();
		expect(loadZone(null)).toBeNull();
		const blocked = {
			getItem: () => {
				throw new Error("x");
			},
			setItem: () => {
				throw new Error("x");
			},
		};
		expect(loadZone(blocked)).toBeNull();
		expect(() => saveZone(blocked, "wly01")).not.toThrow();
	});
});

describe("resolveTheme", () => {
	test("the visitor's choice wins, else the system setting", () => {
		expect(resolveTheme("light", true)).toBe("light");
		expect(resolveTheme("dark", false)).toBe("dark");
		expect(resolveTheme(null, true)).toBe("dark");
		expect(resolveTheme(null, false)).toBe("light");
		expect(resolveTheme("purple", true)).toBe("dark");
	});
});
