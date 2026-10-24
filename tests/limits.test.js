// Request-body cap, chat limits, and visitor-table performance guards.
import { afterEach, describe, expect, setSystemTime, test } from "bun:test";
import { Readable } from "node:stream";
import { MAX_MESSAGE_LENGTH, TokenBucket, validateChatMessage } from "../utils/chatLimits.js";
import { BodyTooLargeError, readBody } from "../utils/readBody.js";
import { call, initializeDatabase } from "./app.js";

// A node:http-like request: a Readable plus a headers object.
const fakeReq = (chunks, headers = {}) => Object.assign(Readable.from(chunks), { headers });

describe("readBody", () => {
	test("returns the full body under the limit", async () => {
		const body = await readBody(fakeReq([Buffer.from("ab"), Buffer.from("cd")]), 10);
		expect(body.toString()).toBe("abcd");
	});

	test("accepts a body exactly at the limit", async () => {
		expect((await readBody(fakeReq([Buffer.alloc(10)]), 10)).length).toBe(10);
	});

	test("rejects with 413 once streamed bytes pass the limit", async () => {
		const req = fakeReq([Buffer.alloc(6), Buffer.alloc(6)]);
		const err = await readBody(req, 10).catch((e) => e);
		expect(err).toBeInstanceOf(BodyTooLargeError);
		expect(err.status).toBe(413);
	});

	test("rejects up front on an oversized Content-Length", async () => {
		const req = fakeReq([Buffer.alloc(1)], { "content-length": "11" });
		await expect(readBody(req, 10)).rejects.toBeInstanceOf(BodyTooLargeError);
	});
});

describe("validateChatMessage", () => {
	test("trims and accepts normal text", () => {
		expect(validateChatMessage("  salam  ")).toEqual({ ok: true, message: "salam" });
	});

	test("rejects empty / non-string input", () => {
		for (const bad of ["", "   ", null, undefined]) {
			expect(validateChatMessage(bad).ok).toBe(false);
		}
	});

	test("enforces MAX_MESSAGE_LENGTH (matches the client input cap)", () => {
		expect(validateChatMessage("x".repeat(MAX_MESSAGE_LENGTH)).ok).toBe(true);
		const tooLong = validateChatMessage("x".repeat(MAX_MESSAGE_LENGTH + 1));
		expect(tooLong.ok).toBe(false);
		expect(tooLong.error).toContain("too long");
	});
});

describe("TokenBucket", () => {
	test("allows a burst, blocks, then refills over time", () => {
		const bucket = new TokenBucket(3, 1, 0);
		expect([0, 0, 0, 0].map((t) => bucket.take(t))).toEqual([true, true, true, false]);
		expect(bucket.take(500)).toBe(false); // half a token
		expect(bucket.take(1000)).toBe(true);
		expect(bucket.take(1000)).toBe(false);
	});

	test("never refills above capacity", () => {
		const bucket = new TokenBucket(2, 1, 0);
		expect([60_000, 60_000, 60_000].map((t) => bucket.take(t))).toEqual([true, true, false]);
	});
});

describe("visitors table", () => {
	afterEach(() => {
		setSystemTime();
		delete process.env.ADMIN_API_KEY;
	});

	test("the /thanks dedupe lookup uses the (ip, date) index", async () => {
		const db = await initializeDatabase();
		const plan = db
			.prepare(
				"EXPLAIN QUERY PLAN SELECT 1 FROM visitors WHERE ip_address = ? AND visit_date >= ? LIMIT 1",
			)
			.all("1.2.3.4", "2026-01-01")
			.map((row) => row.detail)
			.join(" | ");
		expect(plan).toContain("idx_visitors_ip_date");
	});

	test("/visitors is paginated, newest first", async () => {
		process.env.ADMIN_API_KEY = "k";
		const db = await initializeDatabase();
		const insert = db.prepare("INSERT INTO visitors (ip_address, visit_date) VALUES (?, ?)");
		for (let i = 0; i < 30; i++) insert.run(`10.9.0.${i}`, new Date().toISOString());
		const page = async (qs) =>
			(await call(`/visitors${qs}`, { headers: { "x-api-key": "k" } })).json();

		const first = await page("?limit=10");
		expect(first).toHaveLength(10);
		expect(first[0].id).toBeGreaterThan(first[9].id);
		const second = await page("?limit=10&offset=10");
		expect(second[0].id).toBe(first[9].id - 1);
		// Bad / oversized params fall back to sane bounds instead of erroring.
		expect((await page("?limit=-5")).length).toBeGreaterThanOrEqual(30);
		expect((await call("/visitors?limit=abc", { headers: { "x-api-key": "k" } })).status).toBe(200);
	});

	test("/visitors/stats is memoized for 60s", async () => {
		const db = await initializeDatabase();
		const insert = db.prepare("INSERT INTO visitors (ip_address, visit_date) VALUES (?, ?)");
		const stats = async () => (await (await call("/visitors/stats")).json()).data.total_visits;

		setSystemTime(new Date(Date.now() + 10 * 60_000)); // past any earlier memo
		const before = await stats();
		insert.run("10.8.0.1", new Date().toISOString());
		expect(await stats()).toBe(before); // still memoized
		setSystemTime(new Date(Date.now() + 61_000));
		expect(await stats()).toBe(before + 1);
	});
});
