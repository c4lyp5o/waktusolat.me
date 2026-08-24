// Minimal in-memory sliding-window rate limiter (replaces express-rate-limit).
export class RateLimiter {
	constructor(max = 100, windowMs = 60_000) {
		this.max = max;
		this.windowMs = windowMs;
		this.hits = new Map(); // key -> [timestamps]
	}

	allow(key) {
		const now = Date.now();
		const cutoff = now - this.windowMs;
		const arr = (this.hits.get(key) || []).filter((t) => t > cutoff);
		if (arr.length >= this.max) {
			this.hits.set(key, arr);
			return false;
		}
		arr.push(now);
		this.hits.set(key, arr);
		return true;
	}
}