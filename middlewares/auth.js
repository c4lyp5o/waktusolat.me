// auth.js — admin guard for operational routes (/visitors, /cache/invalidate).
//
// Callers send `x-api-key: <ADMIN_API_KEY>`. Fails closed: when
// ADMIN_API_KEY is unset or empty, every request is rejected. Both sides are
// hashed first so timingSafeEqual compares equal-length buffers and the
// comparison time does not leak the key length.
import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value) => createHash("sha256").update(String(value)).digest();

export function apiKeyAuth({ request, set }) {
	const expected = process.env.ADMIN_API_KEY;
	const given = request.headers.get("x-api-key");
	if (expected && given && timingSafeEqual(digest(given), digest(expected))) return;
	set.status = 401;
	return { message: "Unauthorized" };
}
