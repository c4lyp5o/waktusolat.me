// Programmes (SPEC-programmes.md): CRUD under the mosque's token, the 7-day
// upcoming feed in Malaysia dates, and the speaker photo.
import { afterEach, beforeEach, describe, expect, setSystemTime, test } from "bun:test";
import { CLIENT_IP_HEADER } from "../utils/clientIp.js";
import { RateLimiter } from "../utils/rateLimit.js";
import { call } from "./app.js";

// After app.js, which points DB_PATH at a temp file before any DB opens.
const { creationLimits } = await import("../controllers/mosques.js");
const { cleanJpeg, mytToday, PHOTO, photoLimits } = await import("../controllers/programmes.js");

const json = (body) => JSON.stringify(body);
const bearer = (token) => ({ authorization: `Bearer ${token}` });

// 2026-10-26 is a Monday (Isnin), Malaysia time.
const MON_NOON_MYT = Date.UTC(2026, 9, 26, 4, 0);

let ipSeq = 0;
async function newMosque() {
	const res = await call("/mosques", {
		method: "POST",
		headers: { [CLIENT_IP_HEADER]: `198.18.0.${++ipSeq % 250}` },
		body: json({ name: "Masjid Ujian", zone: "wly01" }),
	});
	const data = await res.json();
	return { id: data.mosque.id, token: data.token };
}
const add = async (m, body, token = m.token) => {
	const res = await call(`/mosques/${m.id}/programmes`, {
		method: "POST",
		headers: bearer(token),
		body: json(body),
	});
	return { res, data: await res.json() };
};
const weekly = (extra = {}) => ({
	title: "Kuliah Maghrib",
	speaker: "Ustaz Ahmad",
	repeat: "weekly",
	weekday: 1,
	at: { after: "maghrib" },
	...extra,
});
const once = (extra = {}) => ({
	title: "Ceramah Maulidur Rasul",
	repeat: "once",
	date: "2026-10-31",
	at: { time: "21:00" },
	...extra,
});

// A minimal JPEG: SOI, APP0 (JFIF), APP1 (Exif with a GPS tag), COM,
// SOF0 (w x h), SOS, scan data, EOI, then trailing junk.
function jpeg(width = 600, height = 600, { exif = true, junk = true } = {}) {
	const seg = (marker, payload) => [
		0xff,
		marker,
		(payload.length + 2) >> 8,
		(payload.length + 2) & 255,
		...payload,
	];
	const ascii = (s) => [...s].map((c) => c.charCodeAt(0));
	const bytes = [
		0xff,
		0xd8,
		...seg(0xe0, ascii("JFIF\0\x01\x01\0\0\x01\0\x01\0\0")),
		...(exif ? seg(0xe1, ascii("Exif\0\0GPSLatitude=3.1390")) : []),
		...(exif ? seg(0xfe, ascii("shot on a phone")) : []),
		...seg(0xc0, [8, height >> 8, height & 255, width >> 8, width & 255, 1, 1, 0x11, 0]),
		...seg(0xda, [1, 1, 0, 0, 0x3f, 0]),
		0x12,
		0x34,
		0xff,
		0x00,
		0x56,
		0xff,
		0xd9,
		...(junk ? ascii("<script>alert(1)</script>") : []),
	];
	return new Uint8Array(bytes);
}
const put = (m, pid, body, token = m.token, type = "image/jpeg") =>
	call(`/mosques/${m.id}/programmes/${pid}/photo`, {
		method: "PUT",
		headers: { ...bearer(token), "content-type": type, [CLIENT_IP_HEADER]: "198.18.1.1" },
		body,
	});

beforeEach(() => {
	creationLimits.perIp = new RateLimiter(1000, 60 * 60 * 1000);
	photoLimits.perIp = new RateLimiter(30, 60 * 60 * 1000);
});
afterEach(() => setSystemTime());

describe("CRUD under the mosque's token", () => {
	test("create, list, edit, delete", async () => {
		const m = await newMosque();
		const { res, data } = await add(m, weekly({ skip: ["2026-11-02"] }));
		expect(res.status).toBe(201);
		expect(data).toMatchObject({
			title: "Kuliah Maghrib",
			speaker: "Ustaz Ahmad",
			note: null,
			repeat: "weekly",
			weekday: 1,
			from: null,
			until: null,
			skip: ["2026-11-02"],
			at: { after: "maghrib" },
			photo: null,
		});
		expect(data.id).toMatch(/^[0-9a-hjkmnp-tv-z]{8}$/);

		await add(m, once());
		const list = await (await call(`/mosques/${m.id}/programmes`)).json();
		expect(list.map((p) => p.repeat)).toEqual(["weekly", "once"]);

		const edited = await call(`/mosques/${m.id}/programmes/${data.id}`, {
			method: "PATCH",
			headers: bearer(m.token),
			body: json({ at: { time: "20:45" }, note: "Dewan solat utama" }),
		});
		expect(edited.status).toBe(200);
		expect(await edited.json()).toMatchObject({
			at: { time: "20:45" },
			note: "Dewan solat utama",
			weekday: 1,
		});

		const del = await call(`/mosques/${m.id}/programmes/${data.id}`, {
			method: "DELETE",
			headers: bearer(m.token),
		});
		expect(del.status).toBe(204);
		expect((await (await call(`/mosques/${m.id}/programmes`)).json()).length).toBe(1);
	});

	test("switching weekly to once drops the weekly fields", async () => {
		const m = await newMosque();
		const { data } = await add(m, weekly({ from: "2026-10-01" }));
		const res = await call(`/mosques/${m.id}/programmes/${data.id}`, {
			method: "PATCH",
			headers: bearer(m.token),
			body: json({ repeat: "once", date: "2026-11-14" }),
		});
		expect(res.status).toBe(200);
		const got = await res.json();
		expect(got).toMatchObject({ repeat: "once", date: "2026-11-14" });
		expect(got.weekday).toBeUndefined();
	});

	test("no token, a wrong token, or another mosque's token cannot write", async () => {
		const a = await newMosque();
		const b = await newMosque();
		const { data } = await add(a, weekly());
		expect((await add(a, weekly(), "nope")).res.status).toBe(401);
		const viaOther = await call(`/mosques/${b.id}/programmes/${data.id}`, {
			method: "PATCH",
			headers: bearer(b.token),
			body: json({ title: "Hijacked" }),
		});
		expect(viaOther.status).toBe(404);
		const crossed = await call(`/mosques/${a.id}/programmes/${data.id}`, {
			method: "DELETE",
			headers: bearer(b.token),
		});
		expect(crossed.status).toBe(401);
		const list = await (await call(`/mosques/${a.id}/programmes`)).json();
		expect(list[0].title).toBe("Kuliah Maghrib");
	});

	test("any change moves the mosque's ETag", async () => {
		const m = await newMosque();
		const etag = (await call(`/mosques/${m.id}`)).headers.get("etag");
		await add(m, weekly());
		const res = await call(`/mosques/${m.id}`, { headers: { "if-none-match": etag } });
		expect(res.status).toBe(200);
	});

	test("the 51st programme is refused", async () => {
		const m = await newMosque();
		for (let i = 0; i < 50; i++)
			expect((await add(m, weekly({ title: `K${i}` }))).res.status).toBe(201);
		const { res, data } = await add(m, weekly());
		expect(res.status).toBe(400);
		expect(data.message).toContain("50");
	});

	test("deleting the mosque removes its programmes and photos", async () => {
		const m = await newMosque();
		const { data } = await add(m, weekly());
		await put(m, data.id, jpeg());
		const del = await call(`/mosques/${m.id}`, { method: "DELETE", headers: bearer(m.token) });
		expect(del.status).toBe(204);
		expect((await call(`/mosques/${m.id}/programmes`)).status).toBe(404);
		expect((await call(`/mosques/${m.id}/programmes/${data.id}/photo`)).status).toBe(404);
	});
});

describe("validation", () => {
	const cases = [
		["no title", weekly({ title: " " }), "title"],
		["long title", weekly({ title: "x".repeat(81) }), "title"],
		["multi-line speaker", weekly({ speaker: "a\nb" }), "speaker"],
		["bad repeat", weekly({ repeat: "monthly" }), "repeat"],
		["bad weekday", weekly({ weekday: 7 }), "weekday"],
		["date on weekly", weekly({ date: "2026-10-31" }), "date"],
		["weekday on once", once({ weekday: 1 }), "weekday"],
		["impossible date", once({ date: "2026-02-30" }), "date"],
		["bad time", weekly({ at: { time: "24:00" } }), "at"],
		["bad prayer", weekly({ at: { after: "dhuha" } }), "at"],
		["two at keys", weekly({ at: { time: "20:00", after: "isyak" } }), "at"],
		["from after until", weekly({ from: "2026-12-01", until: "2026-11-01" }), "until"],
		["skip on the wrong day", weekly({ skip: ["2026-10-27"] }), "skip"],
		["skip outside range", weekly({ until: "2026-10-31", skip: ["2026-11-02"] }), "skip"],
		["repeated skip", weekly({ skip: ["2026-11-02", "2026-11-02"] }), "skip"],
		[
			"too many skips",
			weekly({
				skip: Array.from(
					{ length: 21 },
					(_, i) => `2027-01-${String(4 + 7 * (i % 4)).padStart(2, "0")}`,
				),
			}),
			"skip",
		],
		["unknown field", weekly({ html: "<b>" }), "html"],
	];
	for (const [label, body, field] of cases) {
		test(`${label} is 400 naming ${field}`, async () => {
			const m = await newMosque();
			const { res, data } = await add(m, body);
			expect(res.status).toBe(400);
			expect(data.field).toBe(field);
		});
	}
});

describe("upcoming feed (Malaysia dates)", () => {
	const feed = async (m, headers = {}) => call(`/mosques/${m.id}/programmes/upcoming`, { headers });

	test("7 days from today, in date then time order, with skips, ranges and one-offs", async () => {
		setSystemTime(new Date(MON_NOON_MYT));
		const m = await newMosque();
		await add(m, weekly({ title: "Isnin", skip: [] })); // Mon 26 Oct
		await add(m, weekly({ title: "Selasa cuti", weekday: 2, skip: ["2026-10-27"] }));
		await add(m, weekly({ title: "Rabu tamat", weekday: 3, until: "2026-10-27" }));
		await add(m, weekly({ title: "Ahad mula", weekday: 0, from: "2026-11-01" }));
		await add(m, once({ title: "Lepas", date: "2026-10-25" }));
		await add(m, once({ title: "Sabtu", date: "2026-10-31" }));
		await add(m, once({ title: "Jauh", date: "2026-11-02" }));
		await add(m, once({ title: "Isnin pagi", date: "2026-10-26", at: { after: "subuh" } }));
		const res = await feed(m);
		const body = await res.json();
		expect(body.from).toBe("2026-10-26");
		expect(body.until).toBe("2026-11-01");
		expect(body.items.map((i) => `${i.date} ${i.programme.title}`)).toEqual([
			"2026-10-26 Isnin pagi",
			"2026-10-26 Isnin",
			"2026-10-31 Sabtu",
			"2026-11-01 Ahad mula",
		]);
		expect(body.items[1].at).toEqual({ after: "maghrib" });
	});

	test("Malaysia midnight: 16:30 UTC is already the next day", () => {
		expect(mytToday(Date.UTC(2026, 9, 25, 15, 59))).toBe("2026-10-25");
		expect(mytToday(Date.UTC(2026, 9, 25, 16, 0))).toBe("2026-10-26");
	});

	test("the ETag moves with an edit and with the date", async () => {
		setSystemTime(new Date(MON_NOON_MYT));
		const m = await newMosque();
		const etag = (await feed(m)).headers.get("etag");
		expect((await feed(m, { "if-none-match": etag })).status).toBe(304);
		setSystemTime(new Date(MON_NOON_MYT + 24 * 60 * 60 * 1000));
		expect((await feed(m, { "if-none-match": etag })).status).toBe(200);
	});

	test("unknown mosque is 404", async () => {
		expect((await call("/mosques/zzzzzzzzzz/programmes/upcoming")).status).toBe(404);
	});
});

describe("speaker photo", () => {
	test("cleanJpeg strips EXIF, comments and trailing bytes and reads the size", () => {
		const out = cleanJpeg(jpeg(640, 480));
		expect(out).toMatchObject({ width: 640, height: 480 });
		const text = new TextDecoder("latin1").decode(out.bytes);
		expect(text).not.toContain("GPS");
		expect(text).not.toContain("phone");
		expect(text).not.toContain("script");
		expect(text).toContain("JFIF");
		expect([...out.bytes.slice(-2)]).toEqual([0xff, 0xd9]);
		expect(cleanJpeg(new TextEncoder().encode("GIF89a")).error).toBeTruthy();
	});

	test("cleanJpeg cuts at the first end marker: an appended second image (MPF) goes", () => {
		const first = jpeg(600, 600, { exif: false, junk: false });
		const second = jpeg(600, 600, { exif: true, junk: false });
		const joined = new Uint8Array([...first, ...second]);
		const out = cleanJpeg(joined);
		expect(out.bytes.length).toBe(first.length);
		expect(new TextDecoder("latin1").decode(out.bytes)).not.toContain("GPS");
	});

	test("cleanJpeg keeps an ICC colour profile, drops other APP2 data", () => {
		const icc = [0xff, 0xe2, 0, 16, ...[..."ICC_PROFILE\0"].map((c) => c.charCodeAt(0)), 1, 1];
		const mpf = [0xff, 0xe2, 0, 8, ...[..."MPF\0"].map((c) => c.charCodeAt(0)), 0, 0];
		const base = jpeg(600, 600, { exif: false, junk: false });
		const withApp2 = new Uint8Array([...base.slice(0, 2), ...icc, ...mpf, ...base.slice(2)]);
		const text = new TextDecoder("latin1").decode(cleanJpeg(withApp2).bytes);
		expect(text).toContain("ICC_PROFILE");
		expect(text).not.toContain("MPF");
	});

	test("cleanJpeg accepts restart markers and escaped bytes inside the scan", () => {
		const base = jpeg(600, 600, { exif: false, junk: false });
		const sos = base.findIndex((b, k) => b === 0xff && base[k + 1] === 0xda);
		const scanStart = sos + 2 + 12;
		const withRst = new Uint8Array([
			...base.slice(0, scanStart),
			0xaa,
			0xff,
			0xd0,
			0xbb,
			0xff,
			0x00,
			...base.slice(scanStart),
		]);
		const out = cleanJpeg(withRst);
		expect(out.error).toBeUndefined();
		expect(out.bytes.length).toBe(withRst.length);
	});

	test("upload, serve, replace, remove", async () => {
		const m = await newMosque();
		const { data } = await add(m, weekly());
		const up = await put(m, data.id, jpeg());
		expect(up.status).toBe(200);
		const withPhoto = await up.json();
		expect(withPhoto.photo).toMatch(
			new RegExp(`^/api/v1/mosques/${m.id}/programmes/${data.id}/photo\\?v=\\d+$`),
		);

		const img = await call(withPhoto.photo.replace("/api/v1", ""));
		expect(img.status).toBe(200);
		expect(img.headers.get("content-type")).toBe("image/jpeg");
		expect(img.headers.get("x-content-type-options")).toBe("nosniff");
		expect(img.headers.get("cache-control")).toContain("immutable");
		const served = new TextDecoder("latin1").decode(await img.arrayBuffer());
		expect(served).not.toContain("GPS");
		expect(served).not.toContain("script");

		const again = await (await put(m, data.id, jpeg(300, 300))).json();
		expect(again.photo).not.toBe(withPhoto.photo);
		const stale = await call(withPhoto.photo.replace("/api/v1", ""));
		expect(stale.headers.get("cache-control")).toBe("no-cache");

		const removed = await call(`/mosques/${m.id}/programmes/${data.id}/photo`, {
			method: "DELETE",
			headers: bearer(m.token),
		});
		expect((await removed.json()).photo).toBeNull();
		expect((await call(`/mosques/${m.id}/programmes/${data.id}/photo`)).status).toBe(404);
	});

	test("refuses no token, non-JPEG, too big, too small", async () => {
		const m = await newMosque();
		const { data } = await add(m, weekly());
		expect((await put(m, data.id, jpeg(), "nope")).status).toBe(401);
		expect((await put(m, data.id, new TextEncoder().encode("<svg onload=alert(1)>"))).status).toBe(
			400,
		);
		const huge = new Uint8Array(PHOTO.maxBytes + 1);
		huge.set(jpeg());
		expect((await put(m, data.id, huge)).status).toBe(400);
		expect((await put(m, data.id, jpeg(32, 32))).status).toBe(400);
		expect((await put(m, data.id, jpeg(2000, 600))).status).toBe(400);
	});

	test("per-IP upload limit and the total storage cap", async () => {
		const m = await newMosque();
		const { data } = await add(m, weekly());
		photoLimits.perIp = new RateLimiter(2, 60 * 60 * 1000);
		expect((await put(m, data.id, jpeg())).status).toBe(200);
		expect((await put(m, data.id, jpeg())).status).toBe(200);
		expect((await put(m, data.id, jpeg())).status).toBe(429);

		photoLimits.perIp = new RateLimiter(30, 60 * 60 * 1000);
		const saved = PHOTO.maxTotalBytes;
		PHOTO.maxTotalBytes = 0;
		try {
			const { data: other } = await add(m, weekly({ title: "Lain" }));
			expect((await put(m, other.id, jpeg())).status).toBe(507);
		} finally {
			PHOTO.maxTotalBytes = saved;
		}
	});
});
