import { createServer } from "node:http";
import { Server } from "socket.io";
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
	});

// ---- socket.io chat (attached to a node:http host server) ----
// Elysia's app object is a Web-Standards fetch handler, so we host it on a
// node:http server and attach socket.io to the SAME server. socket.io owns
// anything under /socket.io; everything else is bridged to Elysia.
// This transports chat over HTTP long-polling by default (resilient to
// proxies/CSPs that block the WebSocket upgrade) with an automatic upgrade
// to WebSocket when it's available.
const users = new Map(); // socket.id -> name

const httpServer = createServer((req, res) => {
	// Let socket.io handle its own transport endpoints.
	if (req.url?.startsWith("/socket.io")) return;

	const body = [];
	req.on("data", (chunk) => body.push(chunk));
	req.on("end", async () => {
		try {
			const method = req.method || "GET";
			const url = `http://${req.headers.host || "localhost"}${req.url}`;
			const headers = new Headers();
			for (const [k, v] of Object.entries(req.headers)) {
				if (v) headers.set(k, v);
			}
			const request = new Request(url, {
				method,
				headers,
				body:
					method === "GET" || method === "HEAD"
						? undefined
						: Buffer.concat(body),
			});
			const response = await app.fetch(request);
			const responseHeaders = {};
			response.headers.forEach((value, key) => {
				responseHeaders[key] = value;
			});
			res.writeHead(response.status, responseHeaders);
			const data = response.body
				? Buffer.from(await response.arrayBuffer())
				: Buffer.alloc(0);
			res.end(data);
		} catch (error) {
			logger.error("[http] bridge error:", error);
			if (!res.headersSent) {
				res.writeHead(500, { "content-type": "text/plain" });
			}
			res.end("Internal Server Error");
		}
	});
});

const io = new Server(httpServer, {
	path: "/socket.io",
	cors: { origin: "*" },
});

io.on("connection", (socket) => {
	socket.on("join", (payload) => {
		const name = String(payload?.name || "Anon").slice(0, 30);
		socket.data.name = name;
		users.set(socket.id, name);
		logger.info(`[ws] ${name} joined. Total users: ${users.size}`);
		io.emit("system", {
			username: "system",
			message: `${name} joined the chat. Total users: ${users.size}`,
		});
		io.emit("users", { list: [...users.values()] });
	});

	socket.on("chat", (text) => {
		const str = String(text ?? "").trim();
		if (!str) {
			socket.emit("error", { message: "Invalid message format." });
			return;
		}
		// Message body carries no name — the client renders the author in the
		// bubble header. Prepending "Name: " here would double it up.
		io.emit("chat", { username: socket.data.name || "Anon", message: str });
	});

	socket.on("typing", () => {
		// broadcast to everyone except the sender
		socket.broadcast.emit("typing", { username: socket.data.name || "Anon" });
	});

	socket.on("disconnect", () => {
		const nickname = users.get(socket.id);
		if (nickname) {
			users.delete(socket.id);
			io.emit("system", {
				username: "system",
				message: `${nickname} left the chat. Total users: ${users.size}`,
			});
			io.emit("users", { list: [...users.values()] });
			logger.info(`[ws] ${nickname} left. Total users: ${users.size}`);
		}
	});
});

httpServer.listen(PORT, () => {
	logger.info(`[app] waktusolat.me is running on port ${PORT}. Running in ${process.env.NODE_ENV ? process.env.NODE_ENV : "production"} mode.`);
	logger.info(`[graphql] GraphQL API is running on http://localhost:${PORT}/graphql`);
	logger.info(`[ws] Chat is running on http://localhost:${PORT}/socket.io`);
});

export default app;