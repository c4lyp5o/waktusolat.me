// expressLike — compatibility shim so existing request/response handlers
// written for Express (req, res, next) can run on Elysia.

/**
 * Wrap an Express-style middleware/handler `(req, res, next)` into an
 * Elysia handler `(ctx)`.
 *
 * The generated `req` exposes the pieces our codebase actually uses:
 *   method, url, params, query, body, headers (plain object),
 *   ip, socket.remoteAddress, connection.remoteAddress
 * The generated `res` supports: status, json, send, sendResponse,
 *   write, end, setHeader, getHeaders, redirect.
 */
import path from "node:path";

function headersToObject(headers) {
	if (headers instanceof Headers) {
		const out = {};
		for (const [key, value] of headers.entries()) out[key] = value;
		return out;
	}
	return { ...headers };
}

export function adaptElysia(fn) {
	return async function expressHandler(ctx) {
		const { params = {}, request, set, query = {}, body } = ctx;

		const headersObj = headersToObject(request?.headers);
		const method = (request?.method || "GET").toUpperCase();

		// Elysia does not populate ctx.ip; derive it from headers, falling back
		// to the real socket IP via ctx.server.requestIP() when no proxy headers
		// are present (e.g. direct localhost / non-reverse-proxied requests).
		let ip =
			// biome-ignore lint/style/noNonNullAssertion: guarded below
			String(headersObj["x-forwarded-for"] || "").split(",")[0]?.trim() ||
			String(headersObj["x-real-ip"] || "").trim() ||
			String(headersObj["cf-connecting-ip"] || "").trim();

		if (!ip) {
			const reqIp =
				ctx.server?.requestIP?.(request)?.address ||
				ctx.requestIP?.(request)?.address;
			if (reqIp && typeof reqIp === "string") ip = reqIp;
		}

		const req = {
			method,
			url: request?.url || "/",
			params,
			query,
			body,
			headers: headersObj,
			getHeader(name) {
				return headersObj[name.toLowerCase()];
			},
			ip,
			socket: { remoteAddress: ip },
			connection: { remoteAddress: ip },
		};

		let statusCode = 200;
		let responseBody;
		const responseHeaders = {};

		const res = {
			status(code) {
				statusCode = code;
				return this;
			},
			send(body) {
				responseBody = body;
				return this;
			},
			sendResponse(body) {
				// Alias — the cache middleware swaps `send` for `sendResponse`
				responseBody = body;
				return this;
			},
			json(obj) {
				responseBody = obj;
				return this;
			},
			write(str) {
				if (typeof responseBody === "string") responseBody += str;
				else responseBody = str;
				return this;
			},
			end() {
				return this;
			},
			setHeader(name, value) {
				responseHeaders[name] = String(value);
				return this;
			},
			getHeaders() {
				return { ...responseHeaders };
			},
			redirect(url) {
				responseHeaders["location"] = url;
				statusCode = 302;
				return this;
			},
		};

		let nextCalled = false;
		const next = () => {
			nextCalled = true;
		};

		await fn(req, res, next);

		if (nextCalled) return; // let a downstream handler respond
		if (responseBody === undefined) {
			set.status = statusCode;
			return null;
		}

		set.headers = { ...set.headers, ...responseHeaders };
		set.status = statusCode;
		// Stash the final body on set so onAfterHandle (cache middleware) can
		// read it — Elysia does not populate set.response until after the
		// onAfterHandle phase.
		set.__cacheBody = responseBody;
		return responseBody;
	};
}

/** Serve the SPA's index.html for any non-API, non-static route. */
export function sendIndexHtml(set) {
	return (ctx) => {
		set.headers["content-type"] = "text/html; charset=utf-8";
		return Bun.file(path.join(process.cwd(), "public", "index.html"));
	};
}