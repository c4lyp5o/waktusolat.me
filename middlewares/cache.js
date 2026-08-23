// Elysia-native in-memory cache + dev-auth helpers for waktusolat.me.
//
// NOTE: Rather than exporting Elysia plugin instances (whose hooks are
// unreliable when .use()'d into a sub-app), we export plain hook functions
// that routes apply inline. Similarly the localhost auth guard.

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

class CacheItem {
	constructor(data, headers) {
		this.data = data;
		this.headers = headers;
		this.timestamp = Date.now();
		this.lastAccessed = Date.now();
	}
	isExpired() {
		return Date.now() - this.timestamp > CACHE_DURATION;
	}
	touch() {
		this.lastAccessed = Date.now();
	}
}

class CacheStore {
	constructor() {
		this.cache = new Map();
		this.hits = 0;
		this.misses = 0;
		setInterval(() => this.cleanup(), 60 * 1000);
	}
	generateKey(method, url) {
		return `${method}:${url}`;
	}
	get(key) {
		const item = this.cache.get(key);
		if (item && !item.isExpired()) {
			item.touch();
			this.hits++;
			return item;
		}
		if (item) this.cache.delete(key);
		this.misses++;
		return null;
	}
	set(key, data, headers = {}) {
		this.cleanup();
		const cleanHeaders = {};
		for (const [name, value] of Object.entries(headers)) {
			cleanHeaders[name.toLowerCase()] = String(value);
		}
		this.cache.set(key, new CacheItem(data, cleanHeaders));
	}
	cleanup() {
		for (const [key, item] of this.cache.entries()) {
			if (item.isExpired()) this.cache.delete(key);
		}
		if (this.cache.size > MAX_CACHE_SIZE) {
			const sorted = [...this.cache.entries()].sort(
				(a, b) => a[1].lastAccessed - b[1].lastAccessed,
			);
			for (let i = 0; i < sorted.length - MAX_CACHE_SIZE; i++) {
				this.cache.delete(sorted[i][0]);
			}
		}
	}
	invalidate(pattern) {
		const regex = new RegExp(pattern);
		for (const key of this.cache.keys()) {
			if (regex.test(key)) this.cache.delete(key);
		}
	}
	stats() {
		const total = this.hits + this.misses;
		return {
			hits: this.hits,
			misses: this.misses,
			size: this.cache.size,
			hitRate: total ? this.hits / total : 0,
		};
	}
}

const cacheStore = new CacheStore();

// onBeforeHandle hook for GET/HEAD caching. On a hit, returns cached data.
// On a miss, tags set.__cacheKey so onAfterHandle can store the response.
export function cacheBeforeHandle({ request, set }) {
	const method = (request?.method || "GET").toUpperCase();
	if (!["GET", "HEAD"].includes(method)) return;
	const key = cacheStore.generateKey(method, request.url);
	const item = cacheStore.get(key);
	if (item) {
		set.status = 200;
		for (const [name, value] of Object.entries(item.headers)) {
			set.headers[name] = value;
		}
		return item.data;
	}
	set.__cacheKey = key;
}

// onAfterHandle hook — store a successful JSON GET response.
// NOTE: Elysia does not populate set.response at afterHandle time, so the
// adapter stashes the real body on set.__cacheBody; we store from that.
export function cacheAfterHandle({ request, set }) {
	const key = set && set.__cacheKey;
	const body = set && set.__cacheBody;
	if (!key) return;
	delete set.__cacheKey;
	delete set.__cacheBody;
	const method = (request?.method || "GET").toUpperCase();
	if (set.status !== 200) return;
	if (body === undefined) return;
	// Only cache JSON responses (skip HTML/text passthrough).
	const isJson =
		set.headers?.["content-type"]?.includes("json") ||
		typeof body === "object" ||
		(typeof body === "string" && String(body).startsWith("{"));
	if (!isJson) return;
	cacheStore.set(key, body, set.headers || {});
}

export const getCacheStats = () => cacheStore.stats();
export const invalidateCache = (pattern) => {
	cacheStore.invalidate(pattern || ".*");
	return { message: "Cache invalidated", pattern: pattern || ".*" };
};

// Localhost-only auth guard (onBeforeHandle). Allows loopback; rejects all else.
export function localAuthBefore({ request, set }) {
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
		request.headers.get("x-real-ip")?.trim() ||
		"";
	if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") return;
	set.status = 403;
	return { message: "Forbidden" };
}