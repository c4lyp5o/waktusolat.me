// readBody.js — buffer a node:http request body with a hard size cap, for
// the node:http -> Elysia bridge in server.js. Without a cap, one large POST
// (e.g. to /graphql) is buffered in full and can exhaust memory.

export const MAX_BODY_BYTES = 1024 * 1024; // 1 MiB — the API only takes small JSON

export class BodyTooLargeError extends Error {
	constructor(limit) {
		super(`Request body exceeds ${limit} bytes`);
		this.status = 413;
	}
}

// Resolves to the body Buffer; rejects with BodyTooLargeError as soon as the
// declared Content-Length or the bytes received exceed `limit`. On overflow
// the rest of the stream is drained (not buffered) so the 413 can be sent.
export function readBody(req, limit = MAX_BODY_BYTES) {
	return new Promise((resolve, reject) => {
		const declared = Number(req.headers?.["content-length"]);
		if (Number.isFinite(declared) && declared > limit) {
			req.resume();
			reject(new BodyTooLargeError(limit));
			return;
		}
		const chunks = [];
		let size = 0;
		let overflowed = false;
		req.on("data", (chunk) => {
			if (overflowed) return;
			size += chunk.length;
			if (size > limit) {
				overflowed = true;
				chunks.length = 0;
				reject(new BodyTooLargeError(limit));
				return;
			}
			chunks.push(chunk);
		});
		req.on("end", () => {
			if (!overflowed) resolve(Buffer.concat(chunks));
		});
		req.on("error", reject);
	});
}
