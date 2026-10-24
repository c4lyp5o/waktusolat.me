// programmes.js — a mosque's programmes (SPEC-programmes.md): kuliah and
// classes, once or weekly, at a clock time or "selepas {prayer}", with an
// optional speaker photo. Writes need the mosque's edit token (mosques.js).
//
// "After a prayer" stays a prayer name here: the TV holds the zone's prayer
// times and resolves it itself. All dates are Malaysia calendar dates.
import initializeDatabase from "../db/db.js";
import { CLIENT_IP_HEADER } from "../utils/clientIp.js";
import { RateLimiter } from "../utils/rateLimit.js";
import { authorised, fail, newId, nextVersion, readJson, touch } from "./mosques.js";

const db = await initializeDatabase();

const PRAYERS = ["subuh", "zohor", "asar", "maghrib", "isyak"];
// Where an after-prayer item sorts among clock times (the TV re-sorts with
// the real times).
const NOMINAL = { subuh: "06:00", zohor: "13:15", asar: "16:30", maghrib: "19:15", isyak: "20:30" };
const FIELDS = new Set([
	"title",
	"speaker",
	"note",
	"repeat",
	"date",
	"weekday",
	"at",
	"from",
	"until",
	"skip",
]);
const WEEKLY_ONLY = ["weekday", "from", "until", "skip"];
const MAX_PROGRAMMES = 50;
const MAX_SKIP = 20;
const WINDOW_DAYS = 7;

export const PHOTO = {
	maxBytes: 200 * 1024,
	minSide: 64,
	maxSide: 1200,
	maxTotalBytes: 1024 * 1024 * 1024,
};
// Replaceable by tests.
export const photoLimits = { perIp: new RateLimiter(30, 60 * 60 * 1000) };

// ---- dates (Malaysia, UTC+8, no DST) ----

const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;
export const mytToday = (now = Date.now()) =>
	new Date(now + MYT_OFFSET_MS).toISOString().slice(0, 10);

function parseDate(value) {
	if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
	const [y, m, d] = value.split("-").map(Number);
	const t = Date.UTC(y, m - 1, d);
	return new Date(t).toISOString().slice(0, 10) === value ? t : null;
}
const weekdayOf = (date) => new Date(parseDate(date)).getUTCDay();
const addDays = (date, n) =>
	new Date(parseDate(date) + n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

// ---- validation ----

// biome-ignore lint/suspicious/noControlCharactersInRegex: rejecting them is the point
const CONTROL = /[\u0000-\u001f\u007f]/;

function text(input, field, max, required) {
	const raw = input[field];
	if (raw === undefined || raw === null || (typeof raw === "string" && !raw.trim())) {
		return required ? { error: `${field} is required` } : { value: null };
	}
	if (typeof raw !== "string") return { error: `${field} must be text` };
	const value = raw.trim();
	if (value.length > max || CONTROL.test(value)) {
		return { error: `${field} must be at most ${max} characters, one line` };
	}
	return { value };
}

function parseAt(at) {
	if (at === null || typeof at !== "object" || Array.isArray(at)) return null;
	const keys = Object.keys(at);
	if (keys.length !== 1) return null;
	if (keys[0] === "time") {
		const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(at.time ?? "");
		return m ? at.time : null;
	}
	if (keys[0] === "after") return PRAYERS.includes(at.after) ? `after:${at.after}` : null;
	return null;
}

// A full programme (create, or an edit merged onto the stored one). Returns
// { value } in storage shape, or { error: { field, message } }.
export function validateProgramme(input) {
	const bad = (field, message) => ({ error: { field, message } });
	if (input === null || typeof input !== "object" || Array.isArray(input)) {
		return bad(null, "Body must be a JSON object");
	}
	for (const key of Object.keys(input)) {
		if (!FIELDS.has(key)) return bad(key, `Unknown field "${key}"`);
	}
	const value = {};
	for (const [field, max, required] of [
		["title", 80, true],
		["speaker", 60, false],
		["note", 80, false],
	]) {
		const r = text(input, field, max, required);
		if (r.error) return bad(field, r.error);
		value[field] = r.value;
	}

	const at = parseAt(input.at);
	if (!at)
		return bad("at", 'at must be {"time":"HH:MM"} or {"after":"subuh|zohor|asar|maghrib|isyak"}');
	value.at = at;

	const given = (k) => input[k] !== undefined && input[k] !== null;
	if (input.repeat === "once") {
		if (!parseDate(input.date)) return bad("date", "date must be a real date, YYYY-MM-DD");
		for (const k of WEEKLY_ONLY) {
			const empty = k === "skip" && Array.isArray(input.skip) && input.skip.length === 0;
			if (given(k) && !empty) return bad(k, `${k} is only for weekly programmes`);
		}
		Object.assign(value, { repeat: "once", date: input.date, weekday: null });
		Object.assign(value, { from: null, until: null, skip: [] });
		return { value };
	}
	if (input.repeat !== "weekly") return bad("repeat", 'repeat must be "once" or "weekly"');

	if (given("date")) return bad("date", "date is only for one-off programmes");
	if (!Number.isInteger(input.weekday) || input.weekday < 0 || input.weekday > 6) {
		return bad("weekday", "weekday must be 0 (Ahad) to 6 (Sabtu)");
	}
	for (const k of ["from", "until"]) {
		if (given(k) && !parseDate(input[k])) return bad(k, `${k} must be a real date, YYYY-MM-DD`);
	}
	const from = input.from ?? null;
	const until = input.until ?? null;
	if (from && until && from > until) return bad("until", "until must not be before from");

	const skip = input.skip ?? [];
	if (!Array.isArray(skip) || skip.length > MAX_SKIP) {
		return bad("skip", `skip must be a list of at most ${MAX_SKIP} dates`);
	}
	for (const d of skip) {
		if (!parseDate(d)) return bad("skip", "every skip date must be a real date, YYYY-MM-DD");
		if (weekdayOf(d) !== input.weekday) return bad("skip", `${d} is not on this programme's day`);
		if ((from && d < from) || (until && d > until))
			return bad("skip", `${d} is outside from/until`);
	}
	if (new Set(skip).size !== skip.length) return bad("skip", "skip dates must not repeat");

	Object.assign(value, { repeat: "weekly", date: null, weekday: input.weekday });
	Object.assign(value, { from, until, skip: [...skip].sort() });
	return { value };
}

// ---- rows <-> JSON ----

const photoPath = (row) =>
	`/api/v1/mosques/${row.mosque_id}/programmes/${row.id}/photo?v=${row.photo_at}`;

function toPublic(row) {
	const at = row.at.startsWith("after:") ? { after: row.at.slice(6) } : { time: row.at };
	const base = {
		id: row.id,
		title: row.title,
		speaker: row.speaker,
		note: row.note,
		repeat: row.repeat,
	};
	const when =
		row.repeat === "once"
			? { date: row.date }
			: {
					weekday: row.weekday,
					from: row.from_date,
					until: row.until_date,
					skip: JSON.parse(row.skip_dates),
				};
	return {
		...base,
		...when,
		at,
		photo: row.photo_at ? photoPath(row) : null,
		updatedAt: row.updated_at,
	};
}

// Stored row -> the input shape validateProgramme takes (for merging edits).
function toInput(row) {
	const { id, photo, updatedAt, ...input } = toPublic(row);
	return input;
}

const SELECT = `SELECT p.*, ph.updated_at AS photo_at FROM programmes p
	LEFT JOIN programme_photos ph ON ph.programme_id = p.id`;
const getProgramme = (mosqueId, id) =>
	db.prepare(`${SELECT} WHERE p.mosque_id = ? AND p.id = ?`).get(mosqueId, id);
const listRows = (mosqueId) => db.prepare(`${SELECT} WHERE p.mosque_id = ?`).all(mosqueId);

const sortKey = (at) => (at.startsWith("after:") ? NOMINAL[at.slice(6)] : at);

function sortProgrammes(list) {
	const key = (p) => (p.repeat === "once" ? `1 ${p.date}` : `0 ${p.weekday}`);
	return list.sort(
		(a, b) => key(a).localeCompare(key(b)) || sortKey(a.at).localeCompare(sortKey(b.at)),
	);
}

// ---- occurrences ----

// Every occurrence in [today, today + 6], in date then time order.
export function upcoming(rows, today) {
	const items = [];
	for (let i = 0; i < WINDOW_DAYS; i++) {
		const date = addDays(today, i);
		const weekday = weekdayOf(date);
		for (const row of rows) {
			const on =
				row.repeat === "once"
					? row.date === date
					: row.weekday === weekday &&
						(!row.from_date || date >= row.from_date) &&
						(!row.until_date || date <= row.until_date) &&
						!JSON.parse(row.skip_dates).includes(date);
			if (on) items.push({ date, row });
		}
	}
	items.sort(
		(a, b) => a.date.localeCompare(b.date) || sortKey(a.row.at).localeCompare(sortKey(b.row.at)),
	);
	const programmes = items.map(({ date, row }) => {
		const programme = toPublic(row);
		return { date, at: programme.at, programme };
	});
	return { from: today, until: addDays(today, WINDOW_DAYS - 1), items: programmes };
}

// ---- JPEG cleaning (no image library: walk the segments) ----

const ICC = [..."ICC_PROFILE\0"].map((c) => c.charCodeAt(0));
const isIcc = (buf, i) => ICC.every((c, k) => buf[i + 4 + k] === c);

// Returns { bytes, width, height } or { error }. Keeps what draws the image
// (and its ICC colour profile); drops metadata: APP1-APP15 (EXIF, GPS, XMP,
// MPF), except Adobe's APP14 and an ICC APP2, and comments. Stops at the
// FIRST end-of-image, so anything appended (a phone's second Multi-Picture
// image with its own EXIF, or a polyglot payload) is cut off.
export function cleanJpeg(input) {
	const buf = new Uint8Array(input);
	const error = { error: "Not a valid JPEG" };
	if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return error;
	const parts = [buf.subarray(0, 2)];
	let width = 0;
	let height = 0;
	let scanned = false;
	let i = 2;
	while (i + 2 <= buf.length) {
		if (buf[i] !== 0xff) return error;
		const marker = buf[i + 1];
		if (marker === 0xff) {
			i++; // fill byte
			continue;
		}
		if (marker === 0xd9) {
			if (!scanned) return error;
			parts.push(buf.subarray(i, i + 2));
			const bytes = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
			let at = 0;
			for (const p of parts) {
				bytes.set(p, at);
				at += p.length;
			}
			return { bytes, width, height };
		}
		if (i + 4 > buf.length) return error;
		const length = (buf[i + 2] << 8) | buf[i + 3];
		if (length < 2 || i + 2 + length > buf.length) return error;
		const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
		if (isSof && length >= 7) {
			height = (buf[i + 5] << 8) | buf[i + 6];
			width = (buf[i + 7] << 8) | buf[i + 8];
		}
		const keepApp = marker === 0xee || (marker === 0xe2 && isIcc(buf, i));
		const metadata = (marker >= 0xe1 && marker <= 0xef && !keepApp) || marker === 0xfe;
		if (!metadata) parts.push(buf.subarray(i, i + 2 + length));
		i += 2 + length;
		if (marker === 0xda) {
			// Entropy-coded data runs to the next marker: FF 00 is an escaped
			// byte and FF D0-D7 are restart markers, both part of the data.
			if (!width || !height) return error;
			scanned = true;
			const start = i;
			while (
				i + 1 < buf.length &&
				!(buf[i] === 0xff && buf[i + 1] !== 0x00 && (buf[i + 1] < 0xd0 || buf[i + 1] > 0xd7))
			) {
				i++;
			}
			if (i + 1 >= buf.length) return error;
			parts.push(buf.subarray(start, i));
		}
	}
	return error;
}

// ---- handlers ----

export function listProgrammes({ params, set }) {
	if (!db.prepare("SELECT 1 FROM mosques WHERE id = ?").get(params.id)) {
		return fail(set, 404, "Not found");
	}
	return sortProgrammes(listRows(params.id).map(toPublic));
}

export function upcomingProgrammes({ params, request, set }) {
	const mosque = db.prepare("SELECT updated_at FROM mosques WHERE id = ?").get(params.id);
	if (!mosque) return fail(set, 404, "Not found");
	const today = mytToday();
	// The feed changes when the day turns, even with no edit.
	const etag = `W/"${mosque.updated_at}-${today}"`;
	set.headers["cache-control"] = "no-cache";
	set.headers.etag = etag;
	if (request.headers.get("if-none-match") === etag) {
		set.status = 304;
		return "";
	}
	return upcoming(listRows(params.id), today);
}

export async function createProgramme({ params, request, set }) {
	const { row: mosque, error: denied } = authorised(params, request, set);
	if (denied) return denied;
	const { value, error } = validateProgramme(await readJson(request));
	if (error) return fail(set, 400, error.message, error.field);
	const count = db
		.prepare("SELECT count(*) AS n FROM programmes WHERE mosque_id = ?")
		.get(mosque.id).n;
	if (count >= MAX_PROGRAMMES) {
		return fail(set, 400, `A mosque can have at most ${MAX_PROGRAMMES} programmes`);
	}
	const now = Date.now();
	const insert = db.prepare(
		`INSERT INTO programmes (id, mosque_id, title, speaker, note, repeat, date, weekday, at,
		 from_date, until_date, skip_dates, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	for (let attempt = 0; ; attempt++) {
		const id = newId(8);
		try {
			insert.run(
				id,
				mosque.id,
				value.title,
				value.speaker,
				value.note,
				value.repeat,
				value.date,
				value.weekday,
				value.at,
				value.from,
				value.until,
				JSON.stringify(value.skip),
				now,
				now,
			);
			touch(mosque.id);
			set.status = 201;
			return toPublic(getProgramme(mosque.id, id));
		} catch (err) {
			if (attempt >= 3 || !String(err?.message).includes("UNIQUE")) throw err;
		}
	}
}

// Loads the mosque (token checked) and one of its programmes.
function ownProgramme(params, request, set) {
	const { row: mosque, error } = authorised(params, request, set);
	if (error) return { error };
	const row = getProgramme(mosque.id, params.pid);
	if (!row) return { error: fail(set, 404, "Not found") };
	return { mosque, row };
}

export async function updateProgramme({ params, request, set }) {
	const { row, error: denied } = ownProgramme(params, request, set);
	if (denied) return denied;
	const patch = await readJson(request);
	if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
		return fail(set, 400, "Body must be a JSON object", null);
	}
	const base = toInput(row);
	// Switching between once and weekly drops the old kind's fields.
	if (patch.repeat === "once") for (const k of WEEKLY_ONLY) delete base[k];
	if (patch.repeat === "weekly") delete base.date;
	const { value, error } = validateProgramme({ ...base, ...patch });
	if (error) return fail(set, 400, error.message, error.field);
	db.prepare(
		`UPDATE programmes SET title = ?, speaker = ?, note = ?, repeat = ?, date = ?, weekday = ?,
		 at = ?, from_date = ?, until_date = ?, skip_dates = ?, updated_at = ? WHERE id = ?`,
	).run(
		value.title,
		value.speaker,
		value.note,
		value.repeat,
		value.date,
		value.weekday,
		value.at,
		value.from,
		value.until,
		JSON.stringify(value.skip),
		nextVersion(row.updated_at),
		row.id,
	);
	touch(row.mosque_id);
	return toPublic(getProgramme(row.mosque_id, row.id));
}

export function deleteProgramme({ params, request, set }) {
	const { row, error } = ownProgramme(params, request, set);
	if (error) return error;
	db.transaction(() => {
		db.prepare("DELETE FROM programme_photos WHERE programme_id = ?").run(row.id);
		db.prepare("DELETE FROM programmes WHERE id = ?").run(row.id);
	})();
	touch(row.mosque_id);
	set.status = 204;
	return "";
}

export async function putPhoto({ params, request, set }) {
	const { row, error: denied } = ownProgramme(params, request, set);
	if (denied) return denied;
	const ip = request.headers.get(CLIENT_IP_HEADER) || "unknown";
	if (!photoLimits.perIp.allow(ip)) return fail(set, 429, "Too many uploads; try again later");

	const raw = new Uint8Array(await request.arrayBuffer());
	if (raw.length > PHOTO.maxBytes) {
		return fail(set, 400, `Photo must be at most ${PHOTO.maxBytes / 1024} KB`, "photo");
	}
	const jpeg = cleanJpeg(raw);
	if (jpeg.error) return fail(set, 400, "Photo must be a JPEG image", "photo");
	const { minSide, maxSide } = PHOTO;
	if ([jpeg.width, jpeg.height].some((side) => side < minSide || side > maxSide)) {
		return fail(set, 400, `Photo must be ${minSide}-${maxSide} px on each side`, "photo");
	}
	const stored = db
		.prepare("SELECT total(length(bytes)) AS n FROM programme_photos WHERE programme_id != ?")
		.get(row.id).n;
	if (stored + jpeg.bytes.length > PHOTO.maxTotalBytes) {
		return fail(set, 507, "Photo storage is full; please tell the site owner");
	}
	const previous = row.photo_at ?? 0;
	db.prepare(
		`INSERT INTO programme_photos (programme_id, mosque_id, bytes, updated_at) VALUES (?, ?, ?, ?)
		 ON CONFLICT (programme_id) DO UPDATE SET bytes = excluded.bytes, updated_at = excluded.updated_at`,
	).run(row.id, row.mosque_id, jpeg.bytes, nextVersion(previous));
	touch(row.mosque_id);
	return toPublic(getProgramme(row.mosque_id, row.id));
}

export function deletePhoto({ params, request, set }) {
	const { row, error } = ownProgramme(params, request, set);
	if (error) return error;
	db.prepare("DELETE FROM programme_photos WHERE programme_id = ?").run(row.id);
	touch(row.mosque_id);
	return toPublic(getProgramme(row.mosque_id, row.id));
}

export function getPhoto({ params, query, set }) {
	const photo = db
		.prepare(
			"SELECT bytes, updated_at FROM programme_photos WHERE mosque_id = ? AND programme_id = ?",
		)
		.get(params.id, params.pid);
	if (!photo) return fail(set, 404, "Not found");
	const current = query?.v === String(photo.updated_at);
	return new Response(photo.bytes, {
		headers: {
			"content-type": "image/jpeg",
			"x-content-type-options": "nosniff",
			"content-security-policy": "default-src 'none'",
			// A new upload changes ?v=, so the current URL never goes stale.
			"cache-control": current ? "public, max-age=31536000, immutable" : "no-cache",
			etag: `"${photo.updated_at}"`,
		},
	});
}
