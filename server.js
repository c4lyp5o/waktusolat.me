import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { apollo, gql } from "@elysiajs/apollo";
import { RateLimiter } from "./utils/rateLimit.js";
import logger from "./utils/logger.js";

import apiRoutes from "./routes/api.js";
import { SDL } from "./graphql/schema/index.js";
import { apolloResolvers } from "./graphql/apollo.js";

const PORT = process.env.PORT || 5000;
const limiter = new RateLimiter(100, 60_000);

// ---- WebSocket chat (native, replaces socket.io) ----
// ws.id -> { name, ws } — store BOTH so broadcast() can reach the live socket.
const users = new Map();

function broadcast(type, payload) {
	for (const { ws } of users.values()) {
		try {
			ws.send(JSON.stringify({ type, ...payload }));
		} catch {
			/* ignore disconnected */
		}
	}
}

const app = new Elysia()
	.use(cors())
	// global rate limit (In-Memory, per request)
	.onBeforeHandle(({ request, set }) => {
		const key = request.headers.get("x-forwarded-for")?.split(",")[0]
			?.trim() || request.headers.get("x-real-ip") || "local";
		if (!limiter.allow(key)) {
			set.status = 429;
			return { message: "Too Many Requests" };
		}
	})
	// GraphQL
	.use(
		apollo({
			path: "/graphql",
			typeDefs: gql`${SDL}`,
			resolvers: apolloResolvers,
			enablePlayground: process.env.NODE_ENV !== "production",
		}),
	)
	// REST API
	.use(apiRoutes)
	// Native WebSocket chat
	.ws("/ws", {
		open(ws) {
			logger.info(`[ws] client ${ws.id} connected.`);
		},
		message(ws, raw) {
			// Elysia delivers the WS message already JSON-parsed (an object),
			// so do not JSON.parse again. Defensively still accept a raw string.
			let msg = raw;
			if (typeof msg === "string") {
				try {
					msg = JSON.parse(msg);
				} catch {
					ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
					return;
				}
			}
			if (typeof msg !== "object" || msg === null || Array.isArray(msg)) {
				ws.send(JSON.stringify({ type: "error", message: "Invalid message format." }));
				return;
			}

			if (msg.type === "join") {
				const name = String(msg.name || "Anon").slice(0, 30);
				users.set(ws.id, { name, ws });
				logger.info(`[ws] ${name} joined. Total users: ${users.size}`);
				broadcast("user_actions", {
					username: "system",
					message: `${name} joined the chat. Total users: ${users.size}`,
				});
				broadcast("user_list", { users: [...users.values()].map((u) => u.name) });
				return;
			}

			const name = users.get(ws.id)?.name;
			if (msg.type === "chat") {
				const text = String(msg.text || "");
				if (!text.trim()) {
					ws.send(JSON.stringify({ type: "error", message: "Invalid message format." }));
					return;
				}
				broadcast("chat", { username: name, message: `${name}: ${text}` });
				return;
			}

			if (msg.type === "typing") {
				for (const { ws: ws2 } of users.values()) {
					if (ws2.id !== ws.id) ws2.send(JSON.stringify({ type: "typing", username: name }));
				}
			}
		},
		close(ws) {
			const nickname = users.get(ws.id)?.name;
			if (nickname) {
				users.delete(ws.id);
				broadcast("user_actions", {
					username: "system",
					message: `${nickname} left the chat. Total users: ${users.size}`,
				});
				broadcast("user_list", { users: [...users.values()].map((u) => u.name) });
				logger.info(`[ws] ${nickname} left. Total users: ${users.size}`);
			}
		},
	})
	// Static files + SPA fallback, served manually.
	// (In this Elysia build the `.get("*")` catch-all shadows @elysiajs/static
	// routes, so a plugin would serve nothing. We resolve files ourselves and
	// only fall back to index.html for actual client-side routes.)
	.get("*", async ({ request, set }) => {
		const publicDir = `${import.meta.dir}/public`;
		const url = new URL(request.url);
		const pathname = url.pathname;

		// Serve a real file when one exists under public/ (JS/CSS/fonts,
		// favicon, robots.txt, …). Guards against path traversal.
		if (pathname !== "/") {
			const candidate = `${publicDir}${pathname}`;
			if (candidate.startsWith(`${publicDir}/`)) {
				const file = Bun.file(candidate);
				if (await file.exists()) return file;
			}
		}

		// Otherwise it's a client-side route → index.html.
		const index = Bun.file(`${publicDir}/index.html`);
		if (await index.exists()) return index;

		set.status = 404;
		return { error: "Not found" };
	})
	.listen(PORT);

logger.info(
	`[app] waktusolat.me is running on port ${PORT}. Running in ${process.env.NODE_ENV ? process.env.NODE_ENV : "production"} mode.`,
);
logger.info(`[graphql] GraphQL API is running on http://localhost:${PORT}/graphql`);
logger.info(`[ws] WebSocket chat is running on ws://localhost:${PORT}/ws`);

export default app;