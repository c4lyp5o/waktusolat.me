// mosqueKeys.js — the edit tokens of the mosques this phone manages.
//
// The edit link carries the token in its #fragment (never sent to a
// server). On first open the editor keeps it here and strips the fragment
// from the address bar, so the AJK can come back without the link and a
// screenshot of the page shows no key. With storage blocked the token lives
// only for the page's life, and the editor says so.
const KEY = "waktu:mosques";
const MAX = 20;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const ID = /^[0-9a-hjkmnp-tv-z]{10}$/;

// "#k=<token>" -> token, or null.
export function fragmentToken(hash) {
	const m = /^#k=([A-Za-z0-9_-]+)$/.exec(String(hash ?? ""));
	return m && TOKEN.test(m[1]) ? m[1] : null;
}

const valid = (m) => m && ID.test(m.id) && TOKEN.test(m.token) && typeof m.name === "string";

export function loadMosques(storage) {
	try {
		const list = JSON.parse(storage?.getItem(KEY) ?? "[]");
		return Array.isArray(list) ? list.filter(valid) : [];
	} catch {
		return [];
	}
}

function save(storage, list) {
	try {
		storage?.setItem(KEY, JSON.stringify(list));
		return Boolean(storage);
	} catch {
		return false;
	}
}

// Newest first; the same id replaces its old entry. Returns whether it was
// actually stored.
export function rememberMosque(storage, { id, name, token }) {
	const entry = { id, name, token };
	if (!valid(entry)) return false;
	const rest = loadMosques(storage).filter((m) => m.id !== id);
	return save(storage, [entry, ...rest].slice(0, MAX));
}

export function forgetMosque(storage, id) {
	save(
		storage,
		loadMosques(storage).filter((m) => m.id !== id),
	);
}

export const tokenFor = (storage, id) =>
	loadMosques(storage).find((m) => m.id === id)?.token ?? null;
