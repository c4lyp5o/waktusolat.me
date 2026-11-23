// S4: which screen a TV URL is shown on. Pure function, no DOM.
import { describe, expect, test } from "bun:test";
import { surfaceOf } from "../client/src/tv/surface.js";

describe("surfaceOf", () => {
	test("landscape panels stay on the landscape screen", () => {
		expect(surfaceOf(1920, 1080)).toBe("tv");
		expect(surfaceOf(1280, 720)).toBe("tv");
		expect(surfaceOf(3840, 2160)).toBe("tv");
	});

	test("a tall panel is the portrait screen", () => {
		expect(surfaceOf(1080, 1920)).toBe("tvPotret");
		expect(surfaceOf(2160, 3840)).toBe("tvPotret");
		expect(surfaceOf(390, 844)).toBe("tvPotret");
	});

	test("a square panel stays landscape, and junk falls back to tv", () => {
		expect(surfaceOf(1080, 1080)).toBe("tv");
		expect(surfaceOf(0, 1920)).toBe("tv");
		expect(surfaceOf(undefined, undefined)).toBe("tv");
		expect(surfaceOf(Number.NaN, 1080)).toBe("tv");
	});
});
