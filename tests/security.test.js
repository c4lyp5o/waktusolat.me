// Client-IP resolution, rate limiting, admin auth and random-route caching.
import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { isPrivateIp, resolveClientIp } from "../utils/clientIp.js";
import { RateLimiter } from "../utils/rateLimit.js";
import { apiRoutes } from "./app.js";

describe("resolveClientIp", () => {
	test("behind Traefik (private peer) uses the LAST X-Forwarded-For hop", () => {
		expect(resolveClientIp("172.18.0.5", "1.2.3.4")).toBe("1.2.3.4");
		// A client-forged first entry is ignored; Traefik's appended hop wins.
		expect(resolveClientIp("172.18.0.5", "127.0.0.1, 203.0.113.9")).toBe("203.0.113.9");
		expect(resolveClientIp("::ffff:10.0.0.2", "198.51.100.7 ")).toBe("198.51.100.7");
	});

	test("a public peer cannot spoof via X-Forwarded-For", () => {
		expect(resolveClientIp("203.0.113.9", "127.0.0.1")).toBe("203.0.113.9");
	});

	test("falls back to the socket address, then 'unknown'", () => {
		expect(resolveClientIp("::ffff:127.0.0.1", undefined)).toBe("127.0.0.1");
		expect(resolveClientIp("172.18.0.5", " , ")).toBe("172.18.0.5");
		expect(resolveClientIp(undefined, undefined)).toBe("unknown");
	});

	test("isPrivateIp covers RFC1918, loopback and IPv6 local ranges only", () => {
		for (const ip of [
			"10.1.2.3",
			"172.16.0.1",
			"172.31.255.1",
			"192.168.1.1",
			"127.0.0.1",
			"::1",
		]) {
			expect(isPrivateIp(ip)).toBe(true);
		}
		for (const ip of ["fd12:3456::1", "fe80::1", "::ffff:192.168.0.1"]) {
			expect(isPrivateIp(ip)).toBe(true);
		}
		for (const ip of ["172.15.0.1", "172.32.0.1", "8.8.8.8", "2001:db8::1", ""]) {
			expect(isPrivateIp(ip)).toBe(false);
		}
	});
});

describe("RateLimiter", () => {
	afterEach(() => setSystemTime());

	test("allows max hits per window, then blocks, then recovers", () => {
		setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
		const limiter = new RateLimiter(3, 60_000);
		expect([1, 2, 3, 4].map(() => limiter.allow("a"))).toEqual([true, true, true, false]);
		expect(limiter.allow("b")).toBe(true);
		setSystemTime(new Date(2026, 0, 1, 12, 1, 1));
		expect(limiter.allow("a")).toBe(true);
	});

	test("sweeps idle keys once a window has passed", () => {
		setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
		const limiter = new RateLimiter(3, 60_000);
		for (let i = 0; i < 50; i++) limiter.allow(`k${i}`);
		expect(limiter.hits.size).toBe(50);
		setSystemTime(new Date(2026, 0, 1, 12, 1, 1));
		limiter.allow("fresh");
		expect([...limiter.hits.keys()]).toEqual(["fresh"]);
	});

	test("caps tracked keys, evicting the oldest", () => {
		const limiter = new RateLimiter(3, 60_000, 5);
		for (let i = 0; i < 20; i++) limiter.allow(`k${i}`);
		expect([...limiter.hits.keys()]).toEqual(["k15", "k16", "k17", "k18", "k19"]);
	});
});

describe("admin routes (x-api-key)", () => {
	const call = (path, { method = "GET", key } = {}) =>
		apiRoutes.handle(
			new Request(`http://localhost/api/v1${path}`, {
				method,
				headers: key === undefined ? {} : { "x-api-key": key },
			}),
		);
	afterEach(() => {
		delete process.env.ADMIN_API_KEY;
	});

	test("fail closed when ADMIN_API_KEY is unset", async () => {
		expect((await call("/visitors", { key: "" })).status).toBe(401);
		expect((await call("/visitors", { key: "anything" })).status).toBe(401);
	});

	test("reject a missing or wrong key", async () => {
		process.env.ADMIN_API_KEY = "s3cret";
		expect((await call("/visitors")).status).toBe(401);
		expect((await call("/visitors", { key: "s3cre" })).status).toBe(401);
		expect((await call("/cache/invalidate", { method: "POST", key: "nope" })).status).toBe(401);
	});

	test("accept the right key", async () => {
		process.env.ADMIN_API_KEY = "s3cret";
		const visitors = await call("/visitors", { key: "s3cret" });
		expect(visitors.status).toBe(200);
		expect(Array.isArray(await visitors.json())).toBe(true);
		const inv = await call("/cache/invalidate", { method: "POST", key: "s3cret" });
		expect(inv.status).toBe(200);
		expect(await inv.json()).toMatchObject({ message: "Cache invalidated" });
	});

	test("cache invalidation is no longer a GET", async () => {
		process.env.ADMIN_API_KEY = "s3cret";
		const res = await call("/cache/invalidate", { key: "s3cret" });
		expect(res.status).not.toBe(200);
	});

	test("public routes need no key", async () => {
		expect((await call("/visitors/stats")).status).toBe(200);
		expect((await call("/healthcheck")).status).toBe(200);
	});
});

describe("caching of random routes", () => {
	const get = async (path) =>
		(await apiRoutes.handle(new Request(`http://localhost/api/v1${path}`))).text();

	test("/quran/random is not cached", async () => {
		const bodies = new Set();
		for (let i = 0; i < 5; i++) bodies.add(await get("/quran/random"));
		// 5 identical picks out of ~6,236 verses would be astronomically unlikely.
		expect(bodies.size).toBeGreaterThan(1);
	});

	test("/quran/random still resolves to the random handler, not /quran/:lang/:id", async () => {
		const body = JSON.parse(await get("/quran/random"));
		expect(body.code ?? 200).not.toBe(404);
	});
});
