// Minimal in-memory sliding-window rate limiter (replaces express-rate-limit).

// Only the API and GraphQL count against the limit. Static assets and SPA
// routes do not: one page load fetches a dozen files, and a mosque's TV and
// its jemaah's phones on the mosque Wi-Fi all share one public IP.
export const isRateLimited = (pathname) =>
	pathname.startsWith("/api/") || /^\/graphql(?:[/?]|$)/.test(pathname);

// Keys whose hits have all aged out are swept once per window, and the map is
// capped at maxKeys (oldest-inserted evicted first), so a flood of distinct
// keys cannot grow memory without bound.
export class RateLimiter {
	constructor(max = 100, windowMs = 60_000, maxKeys = 10_000) {
		this.max = max;
		this.windowMs = windowMs;
		this.maxKeys = maxKeys;
		this.hits = new Map(); // key -> [timestamps]
		this.lastSweep = Date.now();
	}

	sweep(now) {
		const cutoff = now - this.windowMs;
		for (const [key, arr] of this.hits) {
			if (arr[arr.length - 1] <= cutoff) this.hits.delete(key);
		}
		this.lastSweep = now;
	}

	allow(key) {
		const now = Date.now();
		if (now - this.lastSweep >= this.windowMs) this.sweep(now);
		const cutoff = now - this.windowMs;
		const arr = (this.hits.get(key) || []).filter((t) => t > cutoff);
		if (arr.length >= this.max) {
			this.hits.set(key, arr);
			return false;
		}
		arr.push(now);
		if (!this.hits.has(key) && this.hits.size >= this.maxKeys) {
			this.hits.delete(this.hits.keys().next().value);
		}
		this.hits.set(key, arr);
		return true;
	}
}
