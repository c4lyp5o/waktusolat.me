import { Server } from "socket.io";

import logger from "../utils/logger.js";

export default function websocket(server) {
	const io = new Server(server, {
		cors: {
			origin: "*",
		},
	});

	// Use a Map to manage users for better performance and clarity
	const users = new Map();

	logger.info("[ws] WebSocket server is running.");

	io.on("connection", (socket) => {
		// logger.info(`[ws] Client ${socket.id} connected.`);

		// Handle user joining
		socket.on("joining chat", (username) => {
			if (!username) {
				socket.emit("error", "Username is required to join the chat.");
				return;
			}

			socket.nickname = username;
			users.set(socket.id, username);

			logger.info(
				`[ws] ${username} joined the chat. Total users: ${users.size}`,
			);

			io.emit("user actions", {
				username: "system",
				message: `${username} joined the chat. Total users: ${users.size}`,
			});
			io.emit("user list", Array.from(users.values()));
		});

		// Handle user disconnecting
		socket.on("disconnect", () => {
			const nickname = users.get(socket.id);
			if (nickname) {
				users.delete(socket.id);
				io.emit("user actions", {
					username: "system",
					message: `${nickname} left the chat. Total users: ${users.size}`,
				});
				io.emit("user list", Array.from(users.values()));
				logger.info(
					`[ws] ${socket.nickname} left the chat. Total users: ${users.size}`,
				);
			}
		});

		// Handle chat messages
		socket.on("chat message", (msg) => {
			if (!msg || typeof msg !== "string") {
				socket.emit("error", "Invalid message format.");
				return;
			}
			io.emit("chat message", {
				username: socket.nickname,
				message: `${socket.nickname}: ${msg}`,
			});
		});

		// Handle typing notifications
		socket.on("typing", () => {
			if (socket.nickname) {
				socket.broadcast.emit("typing", `${socket.nickname} is typing...`);
			}
		});

		// Handle errors
		socket.on("error", (err) => {
			console.error(`Error from client ${socket.id}:`, err);
		});
	});
}
