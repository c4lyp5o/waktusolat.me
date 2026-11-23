// S7: which files the TV hands to its service worker. Pure function; the
// worker keeps exactly these, so a Papan mosque boots green offline.
import { describe, expect, test } from "bun:test";

const ORIGIN = "https://waktusolat.me";
globalThis.location = { href: `${ORIGIN}/tv/sgr01`, origin: ORIGIN };

const { assetUrls } = await import("../client/src/tv/kiosk.js");

const entry = (name) => ({ name });

describe("assetUrls", () => {
	test("keeps this origin's bundle files, deduped", () => {
		const urls = assetUrls([
			entry(`${ORIGIN}/assets/TvApp-abc.js`),
			entry(`${ORIGIN}/assets/TvApp-abc.css`),
			entry(`${ORIGIN}/assets/papan-def.css`),
			entry(`${ORIGIN}/assets/papan-def.css`),
			entry(`${ORIGIN}/assets/reem-kufi-1.woff2`),
		]);
		expect(urls).toEqual([
			"/assets/TvApp-abc.js",
			"/assets/TvApp-abc.css",
			"/assets/papan-def.css",
			"/assets/reem-kufi-1.woff2",
		]);
	});

	test("leaves the API, the page itself and other origins alone", () => {
		const urls = assetUrls([
			entry(`${ORIGIN}/api/v1/waktusolat/week/sgr01`),
			entry(`${ORIGIN}/tv/sgr01`),
			entry("https://fonts.gstatic.com/s/x.woff2"),
			entry("https://cdn.example.com/assets/app.js"),
		]);
		expect(urls).toEqual([]);
	});

	test("a malformed entry or no entries at all is an empty list, not a throw", () => {
		expect(assetUrls([entry("not a url"), {}])).toEqual([]);
		expect(assetUrls([])).toEqual([]);
	});

	test("relative names resolve against the page (performance entries may be relative)", () => {
		expect(assetUrls([entry("/assets/x-1.woff2")])).toEqual(["/assets/x-1.woff2"]);
	});
});
