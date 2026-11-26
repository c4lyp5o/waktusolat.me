// GET /api/v1/time — server clock for the TV display's offset correction.
import { describe, expect, test } from "bun:test";
import { call } from "./app.js";

describe("GET /time", () => {
	test("returns the server's epoch ms and timezone", async () => {
		const before = Date.now();
		const res = await call("/time");
		const after = Date.now();
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.tz).toBe("Asia/Kuala_Lumpur");
		expect(body.now).toBeGreaterThanOrEqual(before);
		expect(body.now).toBeLessThanOrEqual(after);
	});

	test("is never cached", async () => {
		const res = await call("/time");
		expect(res.headers.get("cache-control")).toBe("no-store");
		const a = (await res.json()).now;
		await Bun.sleep(20);
		const b = (await (await call("/time")).json()).now;
		expect(b).toBeGreaterThan(a);
	});
});
