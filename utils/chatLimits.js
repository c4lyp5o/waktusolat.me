// chatLimits.js — abuse limits for the socket.io chat (server.js).
//
// Every chat message is broadcast to every connected user, so size and rate
// are capped per socket. MAX_MESSAGE_LENGTH matches the client's
// <input maxLength={1000}> in client/src/pages/Chat.jsx.

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_NAME_LENGTH = 30;
// socket.io frame cap (default is 1 MB). A 1000-char message in the worst
// UTF-8 case plus framing fits comfortably.
export const MAX_SOCKET_PAYLOAD_BYTES = 16 * 1024;
// Chat: burst of 5, then 1 message/second sustained.
export const CHAT_BURST = 5;
export const CHAT_REFILL_PER_SEC = 1;
// Typing notices: the client sends at most one per 2s; drop anything faster.
export const TYPING_MIN_INTERVAL_MS = 1000;

export class TokenBucket {
	constructor(capacity, refillPerSec, now = Date.now()) {
		this.capacity = capacity;
		this.refillPerMs = refillPerSec / 1000;
		this.tokens = capacity;
		this.updated = now;
	}

	take(now = Date.now()) {
		this.tokens = Math.min(this.capacity, this.tokens + (now - this.updated) * this.refillPerMs);
		this.updated = now;
		if (this.tokens < 1) return false;
		this.tokens -= 1;
		return true;
	}
}

// Returns { ok: true, message } with the trimmed text, or { ok: false, error }.
export function validateChatMessage(text) {
	const message = String(text ?? "").trim();
	if (!message) return { ok: false, error: "Invalid message format." };
	if (message.length > MAX_MESSAGE_LENGTH) {
		return { ok: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` };
	}
	return { ok: true, message };
}
