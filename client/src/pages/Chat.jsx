import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL =
	import.meta.env.VITE_PUBLIC_BUILD === "development"
		? "http://localhost:5000"
		: // Same origin by default: socket.io negotiates over HTTP (long-polling
			// fallback) and upgrades to websocket when it's available — so it
			// keeps working even behind proxies/CSPs that block the raw upgrade.
			window.location.origin;

// Cap retained messages so a long-running session doesn't grow unboundedly.
const MAX_MESSAGES = 300;

// A stable hue per name, so each person reads apart at a glance (main.css
// .chat-name sets lightness per theme for contrast).
function nameHue(name) {
	let h = 0;
	for (const ch of String(name)) h = (h * 31 + ch.codePointAt(0)) % 360;
	return h;
}

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
			setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), { username: u, message }]);
		});
		socket.on("system", ({ username: u, message }) => {
			setMessages((prev) => [...prev.slice(-(MAX_MESSAGES - 1)), { username: u, message }]);
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: messages is the scroll trigger — effect body only touches the ref
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = useCallback(() => {
		const text = messageInput.trim();
		if (!text) return;
		const socket = socketRef.current;
		if (!socket?.connected) {
			setNotice("Sambungan hilang. Mencuba menyambung semula…");
			return;
		}
		socket.emit("chat", text);
		setMessageInput("");
	}, [messageInput]);

	// Debounced "user is typing" notify (server relays it to others, throttled).
	const notifyTyping = () => {
		const socket = socketRef.current;
		if (!socket?.connected) return;
		const now = Date.now();
		if (now - lastTypingSentRef.current > 2000) {
			lastTypingSentRef.current = now;
			socket.emit("typing");
		}
	};

	const connected = connection === "connected";

	return (
		<>
			<title>Chat | Waktu Solat</title>
			{/* Fills the screen between the top bar and (on phones) the bottom
			    bar, so the composer is always visible. */}
			<div className="flex h-[calc(100dvh-3rem-3.5rem-env(safe-area-inset-bottom))] flex-col md:h-[calc(100dvh-4rem)]">
				<header className="border-b border-line">
					<div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 md:px-6">
						<div className="min-w-0">
							<h1 className="text-xl font-semibold">Chat</h1>
							<p className="flex items-center gap-2 text-[15px] text-faint">
								<span
									className={`inline-block h-2 w-2 rounded-full ${connected ? "bg-accent-fill" : "bg-faint"}`}
									aria-hidden="true"
								/>
								{connected ? `Anda ${username}` : "Menyambung semula…"}
							</p>
						</div>
						{onlineCount !== null && (
							<p className="shrink-0 text-[15px] text-muted tabular-nums">
								{onlineCount} dalam talian
							</p>
						)}
					</div>
				</header>

				{notice && (
					<p
						className="border-b border-line bg-raised px-4 py-2 text-center text-[15px] text-ink"
						role="status"
					>
						{notice}
					</p>
				)}

				<div
					className="flex-1 overflow-y-auto"
					role="log"
					aria-live="polite"
					aria-relevant="additions"
				>
					<div className="mx-auto flex min-h-full max-w-3xl flex-col justify-end gap-3 px-4 py-4 md:px-6">
						{!messages.some((m) => m.username !== "system") && (
							// Empty log: the sentence sits in the middle of the space, so the
							// room reads as waiting rather than broken.
							<p className="my-auto text-center text-[17px] text-faint">
								Belum ada mesej. Mulakan perbualan dengan sopan.
							</p>
						)}
						{messages.map((m, index) => {
							if (m.username === "system") {
								return (
									// biome-ignore lint/suspicious/noArrayIndexKey: messages have no id
									<p key={index} className="text-center text-[14px] text-faint">
										{m.message}
									</p>
								);
							}
							const isMe = m.username === username;
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: messages have no id
								<div key={index} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
									<div
										className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 text-base md:max-w-[70%] ${
											isMe
												? "rounded-br-md bg-ink text-ground"
												: "rounded-bl-md bg-surface text-ink"
										}`}
									>
										{!isMe && (
											<p
												className="chat-name mb-0.5 text-[14px] font-semibold"
												style={{ "--hue": nameHue(m.username) }}
											>
												{m.username}
											</p>
										)}
										{m.message}
									</div>
								</div>
							);
						})}
						{typingUser && typingUser !== username && (
							<p className="text-[14px] text-faint">{typingUser} sedang menaip…</p>
						)}
						<div ref={messagesEndRef} />
					</div>
				</div>

				<div className="border-t border-line">
					<form
						className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 md:px-6"
						onSubmit={(event) => {
							event.preventDefault();
							sendMessage();
						}}
					>
						<label htmlFor="chat-input" className="sr-only">
							Mesej
						</label>
						<input
							id="chat-input"
							type="text"
							value={messageInput}
							onChange={(e) => {
								setMessageInput(e.target.value);
								notifyTyping();
							}}
							placeholder="Tulis mesej…"
							className="h-12 flex-1 rounded-full px-4 text-base"
							autoComplete="off"
							maxLength={1000}
						/>
						<button
							type="submit"
							disabled={messageInput.trim().length === 0}
							className="h-12 shrink-0 rounded-full bg-ink px-5 text-base font-semibold text-ground disabled:bg-raised disabled:text-faint"
						>
							Hantar
						</button>
					</form>
				</div>
			</div>
		</>
	);
}
