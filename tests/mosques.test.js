// Mosque registry (SPEC-mosque-registry.md): create, read, edit, rotate,
// delete, validation and creation limits, through the real routes.

import { Database } from "bun:sqlite";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CLIENT_IP_HEADER } from "../utils/clientIp.js";
import { RateLimiter } from "../utils/rateLimit.js";
import { call, dbPath } from "./app.js";

// After app.js, which points DB_PATH at a temp file before any DB opens.
const { creationLimits } = await import("../controllers/mosques.js");

const json = (body) => JSON.stringify(body);
const asIp = (ip) => ({ [CLIENT_IP_HEADER]: ip });
const bearer = (token) => ({ authorization: `Bearer ${token}` });

let ipSeq = 0;
const create = async (body = { name: "Masjid Al-Ikhlas", zone: "wly01" }) => {
	const res = await call("/mosques", {
		method: "POST",
		headers: asIp(`198.51.100.${++ipSeq % 250}`),
		body: json(body),
	});
	return { res, data: await res.json() };
};
const patch = (id, token, body) =>
	call(`/mosques/${id}`, { method: "PATCH", headers: bearer(token), body: json(body) });

const savedKey = process.env.ADMIN_API_KEY;
beforeEach(() => {
	creationLimits.perIp = new RateLimiter(5, 60 * 60 * 1000);
	creationLimits.global = new RateLimiter(500, 24 * 60 * 60 * 1000);
});
afterEach(() => {
	if (savedKey === undefined) delete process.env.ADMIN_API_KEY;
	else process.env.ADMIN_API_KEY = savedKey;
});

describe("create and read", () => {
	test("creates with defaults and returns the token once", async () => {
		const { res, data } = await create();
		expect(res.status).toBe(201);
		expect(data.mosque).toMatchObject({
			name: "Masjid Al-Ikhlas",
			zone: "wly01",
			iqamah: { subuh: 10, zohor: 10, asar: 10, maghrib: 10, isyak: 10 },
			jumaat: 30,
			solat: 10,
		});
		expect(data.mosque.id).toMatch(/^[0-9a-hjkmnp-tv-z]{10}$/);
		expect(data.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(data.tvPath).toBe(`/m/${data.mosque.id}`);
		expect(data.editPath).toBe(`/m/${data.mosque.id}/edit#k=${data.token}`);
	});

	test("public read never shows the token; the DB holds only its hash", async () => {
		const { data } = await create();
		const res = await call(`/mosques/${data.mosque.id}`);
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).not.toContain(data.token);
		expect(Object.keys(JSON.parse(text)).sort()).toEqual(
			["id", "iqamah", "jumaat", "name", "solat", "updatedAt", "zone"].sort(),
		);
		const row = new Database(dbPath, { readonly: true })
			.prepare("SELECT token_hash FROM mosques WHERE id = ?")
			.get(data.mosque.id);
		expect(row.token_hash).toMatch(/^[0-9a-f]{64}$/);
		expect(row.token_hash).not.toContain(data.token);
	});

	test("unknown id is 404", async () => {
		expect((await call("/mosques/zzzzzzzzzz")).status).toBe(404);
	});

	test("ETag: unchanged settings answer 304", async () => {
		const { data } = await create();
		const first = await call(`/mosques/${data.mosque.id}`);
		const etag = first.headers.get("etag");
		expect(etag).toBeTruthy();
		expect(first.headers.get("cache-control")).toBe("no-cache");
		const again = await call(`/mosques/${data.mosque.id}`, { headers: { "if-none-match": etag } });
		expect(again.status).toBe(304);
		await patch(data.mosque.id, data.token, { solat: 12 });
		const after = await call(`/mosques/${data.mosque.id}`, { headers: { "if-none-match": etag } });
		expect(after.status).toBe(200);
	});
});

describe("edit with the token", () => {
	test("patch changes only the given fields and moves updatedAt", async () => {
		const { data } = await create();
		const res = await patch(data.mosque.id, data.token, {
			name: "  Surau An-Nur ",
			iqamah: { subuh: 15, zohor: 10, asar: 10, maghrib: 5, isyak: 10 },
		});
		expect(res.status).toBe(200);
		const got = await (await call(`/mosques/${data.mosque.id}`)).json();
		expect(got.name).toBe("Surau An-Nur");
		expect(got.iqamah.maghrib).toBe(5);
		expect(got.zone).toBe("wly01");
		expect(got.jumaat).toBe(30);
		expect(got.updatedAt).toBeGreaterThan(data.mosque.updatedAt);
	});

	test("an empty patch checks the token without moving updatedAt", async () => {
		const { data } = await create();
		const res = await patch(data.mosque.id, data.token, {});
		expect(res.status).toBe(200);
		expect((await res.json()).updatedAt).toBe(data.mosque.updatedAt);
		expect((await patch(data.mosque.id, "x".repeat(43), {})).status).toBe(401);
	});

	test("missing or wrong token is 401 and changes nothing", async () => {
		const { data } = await create();
		const id = data.mosque.id;
		expect(
			(await call(`/mosques/${id}`, { method: "PATCH", body: json({ solat: 20 }) })).status,
		).toBe(401);
		expect((await patch(id, "x".repeat(43), { solat: 20 })).status).toBe(401);
		expect((await (await call(`/mosques/${id}`)).json()).solat).toBe(10);
	});

	test("rotation issues a new token and kills the old one", async () => {
		const { data } = await create();
		const id = data.mosque.id;
		const res = await call(`/mosques/${id}/token`, { method: "POST", headers: bearer(data.token) });
		expect(res.status).toBe(200);
		const { token, editPath } = await res.json();
		expect(token).not.toBe(data.token);
		expect(editPath).toBe(`/m/${id}/edit#k=${token}`);
		expect((await patch(id, data.token, { solat: 20 })).status).toBe(401);
		expect((await patch(id, token, { solat: 20 })).status).toBe(200);
	});

	test("patch on an unknown id is 404", async () => {
		expect((await patch("zzzzzzzzzz", "x", { solat: 5 })).status).toBe(404);
	});
});

describe("validation", () => {
	const cases = [
		["empty name", { name: "  ", zone: "wly01" }, "name"],
		["long name", { name: "x".repeat(61), zone: "wly01" }, "name"],
		["control char", { name: "a\nb", zone: "wly01" }, "name"],
		["bad zone", { name: "M", zone: "xxx99" }, "zone"],
		["partial iqamah", { name: "M", zone: "wly01", iqamah: { subuh: 10 } }, "iqamah"],
		[
			"iqamah over 60",
			{ name: "M", zone: "wly01", iqamah: { subuh: 61, zohor: 1, asar: 1, maghrib: 1, isyak: 1 } },
			"iqamah",
		],
		["jumaat over 90", { name: "M", zone: "wly01", jumaat: 91 }, "jumaat"],
		["solat 0", { name: "M", zone: "wly01", solat: 0 }, "solat"],
		["fraction", { name: "M", zone: "wly01", solat: 1.5 }, "solat"],
		["string number", { name: "M", zone: "wly01", jumaat: "30" }, "jumaat"],
		["unknown field", { name: "M", zone: "wly01", token_hash: "x" }, "token_hash"],
	];
	for (const [label, body, field] of cases) {
		test(`${label} is 400 naming ${field}`, async () => {
			const { res, data } = await create(body);
			expect(res.status).toBe(400);
			expect(data.field).toBe(field);
		});
	}

	test("a non-JSON or array body is 400", async () => {
		for (const body of ["not json", "[1]", ""]) {
			const res = await call("/mosques", { method: "POST", headers: asIp("192.0.2.1"), body });
			expect(res.status).toBe(400);
		}
	});

	test("zone is case-insensitive and stored lower-case", async () => {
		const { data } = await create({ name: "M", zone: "SGR01" });
		expect(data.mosque.zone).toBe("sgr01");
	});
});

describe("creation limits", () => {
	const post = (ip) =>
		call("/mosques", {
			method: "POST",
			headers: asIp(ip),
			body: json({ name: "M", zone: "wly01" }),
		});

	test("the 6th creation from one IP in an hour is 429; other IPs are unaffected", async () => {
		for (let i = 0; i < 5; i++) expect((await post("203.0.113.7")).status).toBe(201);
		expect((await post("203.0.113.7")).status).toBe(429);
		expect((await post("203.0.113.8")).status).toBe(201);
	});

	test("invalid requests do not use up the allowance", async () => {
		for (let i = 0; i < 8; i++) {
			await call("/mosques", { method: "POST", headers: asIp("203.0.113.9"), body: "{}" });
		}
		expect((await post("203.0.113.9")).status).toBe(201);
	});

	test("the daily global cap applies across IPs", async () => {
		creationLimits.global = new RateLimiter(2, 24 * 60 * 60 * 1000);
		expect((await post("203.0.113.20")).status).toBe(201);
		expect((await post("203.0.113.21")).status).toBe(201);
		expect((await post("203.0.113.22")).status).toBe(429);
	});
});

describe("delete", () => {
	const del = (id, headers = {}) => call(`/mosques/${id}`, { method: "DELETE", headers });

	test("the token holder can delete their own mosque", async () => {
		const { data } = await create();
		expect((await del(data.mosque.id, bearer(data.token))).status).toBe(204);
		expect((await call(`/mosques/${data.mosque.id}`)).status).toBe(404);
	});

	test("the admin key deletes; then 404", async () => {
		process.env.ADMIN_API_KEY = "test-admin-key";
		const { data } = await create();
		expect((await del(data.mosque.id, { "x-api-key": "test-admin-key" })).status).toBe(204);
		expect((await del(data.mosque.id, { "x-api-key": "test-admin-key" })).status).toBe(404);
	});

	test("neither credential, or a wrong key, is 401", async () => {
		process.env.ADMIN_API_KEY = "test-admin-key";
		const { data } = await create();
		expect((await del(data.mosque.id)).status).toBe(401);
		expect((await del(data.mosque.id, { "x-api-key": "nope" })).status).toBe(401);
	});

	test("with ADMIN_API_KEY unset, the admin path fails closed", async () => {
		delete process.env.ADMIN_API_KEY;
		const { data } = await create();
		expect((await del(data.mosque.id, { "x-api-key": "" })).status).toBe(401);
		expect((await del(data.mosque.id, { "x-api-key": "undefined" })).status).toBe(401);
	});
});
