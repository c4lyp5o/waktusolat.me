import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
	import.meta.env.VITE_PUBLIC_BUILD === "development"
		? "http://localhost:5000"
		// Same origin by default: socket.io negotiates over HTTP (long-polling
		// fallback) and upgrades to websocket when it's available — so it
		// keeps working even behind proxies/CSPs that block the raw upgrade.
		: window.location.origin;

// Cap retained messages so a long-running session doesn't grow unboundedly.
const MAX_MESSAGES = 300;

export default function Chat() {
	const [username, setUsername] = useState("");
	const [messages, setMessages] = useState([]);
	const [messageInput, setMessageInput] = useState("");
	const [connection, setConnection] = useState("connecting"); // connecting | connected | reconnecting
	const [onlineCount, setOnlineCount] = useState(null);
	const [typingUser, setTypingUser] = useState("");
	const [notice, setNotice] = useState("");

	const socketRef = useRef(null);
	const usernameRef = useRef("");
	const messagesEndRef = useRef(null);
	const typingTimerRef = useRef(null);
	const noticeTimerRef = useRef(null);
	const lastTypingSentRef = useRef(0);

	// Stable random username for this session.
	useEffect(() => {
		const name = `Anon${Math.floor(Math.random() * 1000)}`;
		setUsername(name);
		usernameRef.current = name;
	}, []);

	// Connect. socket.io manages reconnection with exponential backoff itself
	// (enabled by default), so we don't hand-roll retries here.
	useEffect(() => {
		const socket = io(SOCKET_SERVER_URL, { path: "/socket.io" });
		socketRef.current = socket;

		socket.on("connect", () => {
			setConnection("connected");
			socket.emit("join", { name: usernameRef.current });
		});
		socket.on("disconnect", () => {
			setConnection("reconnecting");
		});

		socket.on("chat", ({ username: u, message }) => {
			setMessages((prev) => [
				...prev.slice(-(MAX_MESSAGES - 1)),
				{ username: u, message },
			]);
		});
		socket.on("system", ({ username: u, message }) => {
			setMessages((prev) => [
				...prev.slice(-(MAX_MESSAGES - 1)),
				{ username: u, message },
			]);
		});
		socket.on("users", ({ list }) => {
			setOnlineCount(Array.isArray(list) ? list.length : null);
		});
		socket.on("typing", ({ username: u }) => {
			setTypingUser(u);
			clearTimeout(typingTimerRef.current);
			typingTimerRef.current = setTimeout(() => setTypingUser(""), 2500);
		});
		socket.on("error", ({ message }) => {
			setNotice(message || "Something went wrong.");
			clearTimeout(noticeTimerRef.current);
			noticeTimerRef.current = setTimeout(() => setNotice(""), 3500);
		});

		return () => socket.disconnect();
	}, []);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = useCallback(() => {
		const text = messageInput.trim();
		if (!text) return;
		const socket = socketRef.current;
		if (!socket || !socket.connected) {
			setNotice("Sambungan hilang. Mencuba menyambung semula…");
			return;
		}
		socket.emit("chat", text);
		setMessageInput("");
	}, [messageInput]);

	// Debounced "user is typing" notify (server relays it to others, throttled).
	const notifyTyping = () => {
		const socket = socketRef.current;
		if (!socket || !socket.connected) return;
		const now = Date.now();
		if (now - lastTypingSentRef.current > 2000) {
			lastTypingSentRef.current = now;
			socket.emit("typing");
		}
	};

	const connected = connection === "connected";

	return (
		<>
			<title>Chat Room</title>
			<meta
				name="description"
				content="Chat dengan orang awam tanpa diketahui nama"
			/>
			<link rel="icon" href="/favicon.ico" />

			{/* Main Container: Calculates height to fill screen minus Navbar (approx 64px/4rem) */}
			<div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-950 font-sans">
				{/* Header / Disclaimer */}
				<div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center shadow-sm z-10">
					<div>
						<h1 className="font-bold text-slate-100">Chat Room</h1>
						<p className="text-xs text-acre-600 flex items-center gap-1">
							<span
								className={`w-2 h-2 rounded-full animate-pulse ${
									connected ? "bg-acre-500" : "bg-amber-500"
								}`}
							></span>
							{connected
								? `Online sebagai ${username}`
								: "Menyambung semula…"}
						</p>
					</div>
					{onlineCount !== null && (
						<span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
							{onlineCount} online
						</span>
					)}
				</div>

				{/* Transient notice (errors / disconnected) */}
				{notice && (
					<div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-sm text-amber-200">
						{notice}
					</div>
				)}

				{/* Messages Area */}
				<div
					className="flex-1 overflow-y-auto p-4 space-y-4"
					role="log"
					aria-live="polite"
					aria-relevant="additions"
				>
					{messages.map((singleMessage, index) => {
						const isSystem = singleMessage.username === "system";
						const isMe = singleMessage.username === username;

						// The server sends the raw message body; the bubble header
						// already shows the author's name, so no prefix to strip.
						const messageText = singleMessage.message;

						if (isSystem) {
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: no id
								<div key={index} className="flex justify-center my-4">
									<span className="bg-slate-200 text-slate-800 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-medium">
										{singleMessage.message}
									</span>
								</div>
							);
						}

						return (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: no id
								key={index}
								className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`
                    max-w-[80%] md:max-w-[60%] px-4 py-3 shadow-sm relative text-sm md:text-base wrap-break-word
                    ${
											isMe
												? "bg-acre-600 text-white rounded-2xl rounded-tr-sm" // My Bubble
												: "bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl rounded-tl-sm" // Their Bubble
										}
                  `}
								>
									{/* Optional: Show sender name for others if needed */}
									{!isMe && (
										<p className="text-[10px] text-acre-600 font-bold mb-1 opacity-80 uppercase">
											{singleMessage.username}
										</p>
									)}

									{messageText}
								</div>
							</div>
						);
					})}

					{/* "Somebody is typing…" — only ever shown when not the sender */}
					{typingUser && typingUser !== username && (
						<div className="flex justify-start pl-1">
							<span className="text-xs text-slate-500 italic">
								{typingUser} sedang menaip…
							</span>
						</div>
					)}

					{/* Invisible element to scroll to */}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="bg-slate-900 p-3 md:p-4 border-t border-slate-800">
					<form
						className="flex items-end gap-2 max-w-4xl mx-auto"
						onSubmit={(event) => {
							event.preventDefault();
							sendMessage();
						}}
					>
						<input
							type="text"
							value={messageInput}
							onChange={(e) => {
								setMessageInput(e.target.value);
								notifyTyping();
							}}
							placeholder="Taip mesej anda..."
							className="flex-1 bg-slate-800 text-white border-slate-700 focus:bg-slate-900 focus:border-acre-500 focus:ring-2 focus:ring-acre-200 rounded-2xl px-4 py-3 transition-all outline-none"
							autoComplete="off"
							maxLength={1000}
						/>

						<button
							type="submit"
							disabled={messageInput.trim().length === 0}
							className={`
                p-3 rounded-full transition-all duration-200 shadow-md flex-shrink-0
                ${
									messageInput.trim().length > 0
										? "bg-acre-600 text-white hover:bg-acre-700 hover:scale-105"
										: "bg-slate-200 text-slate-400 cursor-not-allowed"
								}
              `}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="w-6 h-6 transform rotate-0 md:-rotate-45 translate-x-0.5"
							>
								<title>Send</title>
								<path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
							</svg>
						</button>
					</form>
				</div>
			</div>
		</>
	);
}