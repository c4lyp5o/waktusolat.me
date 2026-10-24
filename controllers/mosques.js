// mosques.js — the mosque registry (SPEC-mosque-registry.md): a mosque's TV
// settings saved under a random id, editable only with a secret token.
//
// The token is returned once (on creation or rotation) and stored only as
// its sha256. It travels in the edit link's #fragment and comes back as
// `Authorization: Bearer <token>`, so it never reaches a log or a Referer.
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import initializeDatabase from "../db/db.js";
import { isAdmin } from "../middlewares/auth.js";
import { CLIENT_IP_HEADER } from "../utils/clientIp.js";
import logger from "../utils/logger.js";
import { RateLimiter } from "../utils/rateLimit.js";
import { ZONES } from "./zones.js";

const db = await initializeDatabase();

// Bounds match tv-display's URL parameters (client/src/lib/waktu/config.js).
const PRAYERS = ["subuh", "zohor", "asar", "maghrib", "isyak"];
const MAX_NAME = 60;
const DEFAULTS = { jumaat: 30, solat: 10, iqamah: 10, tema: "langit" };
const FIELDS = new Set(["name", "zone", "iqamah", "jumaat", "solat", "tema"]);
// The TV's themes (client/src/lib/waktu/config.js TEMAS; SPEC-redesign.md).
const TEMAS = ["langit", "takwim", "songket"];

// Creation limits: per client IP, and a daily backstop across all IPs.
// Replaceable by tests.
export const creationLimits = {
	perIp: new RateLimiter(5, 60 * 60 * 1000),
	global: new RateLimiter(500, 24 * 60 * 60 * 1000),
};

// Lower-case Crockford base32: no i, l, o or u. 10 chars = 50 random bits.
const ID_ALPHABET = "0123456789abcdefghjkmnpqrstvwxyz";
export const newId = (length = 10) =>
	[...randomBytes(length)].map((b) => ID_ALPHABET[b & 31]).join("");
const newToken = () => randomBytes(32).toString("base64url");
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

const isWhole = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

// Checks a create (all fields, defaults filled) or a patch (only the given
// fields). Returns { value } or { error: { field, message } }.
export function validateSettings(input, { partial = false } = {}) {
	const bad = (field, message) => ({ error: { field, message } });
	if (input === null || typeof input !== "object" || Array.isArray(input)) {
		return bad(null, "Body must be a JSON object");
	}
	for (const key of Object.keys(input)) {
		if (!FIELDS.has(key)) return bad(key, `Unknown field "${key}"`);
	}
	const value = {};
	if ("name" in input || !partial) {
		const name = typeof input.name === "string" ? input.name.trim() : "";
		// Control characters never belong in a name shown on a TV.
		// biome-ignore lint/suspicious/noControlCharactersInRegex: that is the point
		if (!name || name.length > MAX_NAME || /[\u0000-\u001f\u007f]/.test(name)) {
			return bad("name", `Name must be 1-${MAX_NAME} characters`);
		}
		value.name = name;
	}
	if ("zone" in input || !partial) {
		const zone = typeof input.zone === "string" ? input.zone.trim().toLowerCase() : "";
		if (!Object.hasOwn(ZONES, zone)) return bad("zone", "Unknown zone code");
		value.zone = zone;
	}
	if ("iqamah" in input) {
		const q = input.iqamah;
		const ok =
			q !== null &&
			typeof q === "object" &&
			!Array.isArray(q) &&
			Object.keys(q).length === PRAYERS.length &&
			PRAYERS.every((p) => isWhole(q[p], 0, 60));
		if (!ok) return bad("iqamah", `iqamah needs ${PRAYERS.join(", ")}, each 0-60 minutes`);
		value.iqamah = Object.fromEntries(PRAYERS.map((p) => [p, q[p]]));
	} else if (!partial) {
		value.iqamah = Object.fromEntries(PRAYERS.map((p) => [p, DEFAULTS.iqamah]));
	}
	for (const [field, min, max] of [
		["jumaat", 0, 90],
		["solat", 1, 60],
	]) {
		if (field in input) {
			if (!isWhole(input[field], min, max)) {
				return bad(field, `${field} must be a whole number ${min}-${max}`);
			}
			value[field] = input[field];
		} else if (!partial) {
			value[field] = DEFAULTS[field];
		}
	}
	if ("tema" in input) {
		if (!TEMAS.includes(input.tema)) return bad("tema", `tema must be one of ${TEMAS.join(", ")}`);
		value.tema = input.tema;
	} else if (!partial) {
		value.tema = DEFAULTS.tema;
	}
	return { value };
}

// Strictly increasing, so the ETag changes even for two edits in one ms.
export const nextVersion = (previous) => Math.max(Date.now(), previous + 1);

// A programme changed: move the mosque's version, so a polling TV sees it.
export function touch(id) {
	const row = db.prepare("SELECT updated_at FROM mosques WHERE id = ?").get(id);
	if (row)
		db.prepare("UPDATE mosques SET updated_at = ? WHERE id = ?").run(
			nextVersion(row.updated_at),
			id,
		);
}

const getRow = (id) => db.prepare("SELECT * FROM mosques WHERE id = ?").get(id);

const toPublic = (row) => ({
	id: row.id,
	name: row.name,
	zone: row.zone,
	iqamah: JSON.parse(row.iqamah),
	jumaat: row.jumaat,
	solat: row.solat,
	tema: row.tema,
	updatedAt: row.updated_at,
});

const paths = (id, token) => ({ tvPath: `/m/${id}`, editPath: `/m/${id}/edit#k=${token}` });

function tokenMatches(row, request) {
	const m = /^Bearer\s+(\S+)$/.exec(request.headers.get("authorization") ?? "");
	if (!m) return false;
	return timingSafeEqual(Buffer.from(hashToken(m[1]), "hex"), Buffer.from(row.token_hash, "hex"));
}

// The body as JSON, or undefined when it is not (bodies are parsed here, not
// by Elysia, so a malformed one gets this module's 400 shape).
export async function readJson(request) {
	try {
		return JSON.parse(await request.text());
	} catch {
		return undefined;
	}
}

export const fail = (set, status, message, field) => {
	set.status = status;
	return field === undefined ? { message } : { message, field };
};

// Loads the mosque and checks the edit token; returns the row, or an error body.
export function authorised(params, request, set) {
	const row = getRow(params.id);
	if (!row) return { error: fail(set, 404, "Not found") };
	if (!tokenMatches(row, request)) return { error: fail(set, 401, "Unauthorized") };
	return { row };
}

export async function createMosque({ request, set }) {
	const { value, error } = validateSettings(await readJson(request));
	if (error) return fail(set, 400, error.message, error.field);

	const ip = request.headers.get(CLIENT_IP_HEADER) || "unknown";
	if (!creationLimits.perIp.allow(ip) || !creationLimits.global.allow("all")) {
		return fail(set, 429, "Too many mosques created; try again later");
	}

	const token = newToken();
	const now = Date.now();
	const insert = db.prepare(
		`INSERT INTO mosques (id, name, zone, iqamah, jumaat, solat, tema, token_hash, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	);
	for (let attempt = 0; ; attempt++) {
		const id = newId();
		try {
			insert.run(
				id,
				value.name,
				value.zone,
				JSON.stringify(value.iqamah),
				value.jumaat,
				value.solat,
				value.tema,
				hashToken(token),
				now,
				now,
			);
			logger.info(`[mosques] created ${id} (${value.zone})`);
			set.status = 201;
			return { mosque: toPublic(getRow(id)), token, ...paths(id, token) };
		} catch (err) {
			// A primary-key collision (2^-50 odds): draw another id.
			if (attempt >= 3 || !String(err?.message).includes("UNIQUE")) throw err;
		}
	}
}

// Public read. A polling TV sends If-None-Match and gets a 304 until an edit.
export function getMosque({ params, request, set }) {
	const row = getRow(params.id);
	if (!row) return fail(set, 404, "Not found");
	const etag = `W/"${row.updated_at}"`;
	set.headers["cache-control"] = "no-cache";
	set.headers.etag = etag;
	if (request.headers.get("if-none-match") === etag) {
		set.status = 304;
		return "";
	}
	return toPublic(row);
}

export async function updateMosque({ params, request, set }) {
	const { row, error: denied } = authorised(params, request, set);
	if (denied) return denied;
	const { value, error } = validateSettings(await readJson(request), { partial: true });
	if (error) return fail(set, 400, error.message, error.field);
	// An empty edit changes nothing (the editor uses it to check a token), so
	// it must not move the version a polling TV watches.
	if (Object.keys(value).length === 0) return toPublic(row);

	const next = { ...toPublic(row), ...value };
	const updatedAt = nextVersion(row.updated_at);
	db.prepare(
		"UPDATE mosques SET name = ?, zone = ?, iqamah = ?, jumaat = ?, solat = ?, tema = ?, updated_at = ? WHERE id = ?",
	).run(
		next.name,
		next.zone,
		JSON.stringify(next.iqamah),
		next.jumaat,
		next.solat,
		next.tema,
		updatedAt,
		row.id,
	);
	return toPublic(getRow(row.id));
}

// "The link leaked": a new token; the old one stops working at once.
export function rotateToken({ params, request, set }) {
	const { row, error } = authorised(params, request, set);
	if (error) return error;
	const token = newToken();
	db.prepare("UPDATE mosques SET token_hash = ? WHERE id = ?").run(hashToken(token), row.id);
	logger.info(`[mosques] token rotated for ${row.id}`);
	return { token, editPath: paths(row.id, token).editPath };
}

// The mosque itself (edit token) or the site owner (ADMIN_API_KEY).
export function deleteMosque({ params, request, set }) {
	const row = getRow(params.id);
	if (!row) return fail(set, 404, "Not found");
	const admin = isAdmin(request);
	if (!admin && !tokenMatches(row, request)) return fail(set, 401, "Unauthorized");
	// Its programmes and their photos go with it (programmes.js).
	db.transaction(() => {
		db.prepare("DELETE FROM programme_photos WHERE mosque_id = ?").run(row.id);
		db.prepare("DELETE FROM programmes WHERE mosque_id = ?").run(row.id);
		db.prepare("DELETE FROM mosques WHERE id = ?").run(row.id);
	})();
	logger.info(`[mosques] deleted ${row.id} by ${admin ? "admin" : "owner token"}`);
	set.status = 204;
	return "";
}
