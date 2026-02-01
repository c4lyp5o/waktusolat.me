import { useEffect, useRef, useState, useCallback } from "react";
import socketIOClient from "socket.io-client";

// Remove old CSS file
// import "../styles/chat.css";

const NEW_CHAT_MESSAGE_EVENT = "chat message";
const USER_ACTION_EVENT = "user actions";
const SOCKET_SERVER_URL =
	import.meta.env.VITE_PUBLIC_BUILD === "development"
		? "ws://localhost:5000"
		: `wss://${window.location.host}`;

export default function Chat() {
	const [username, setUsername] = useState("");
	const [messages, setMessages] = useState([]);
	const [messageInput, setMessageInput] = useState("");

	const socketRef = useRef();
	const messagesEndRef = useRef(null);

	useEffect(() => {
		// Generate a simpler, shorter username for display
		const generatedUsername = `Anon${Math.floor(Math.random() * 1000)}`;
		setUsername(generatedUsername);

		socketRef.current = socketIOClient(SOCKET_SERVER_URL);

		socketRef.current.emit("joining chat", generatedUsername);

		socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
			setMessages((prevMessages) => [...prevMessages, message]);
		});

		socketRef.current.on(USER_ACTION_EVENT, (action) => {
			setMessages((prevMessages) => [...prevMessages, action]);
		});

		return () => socketRef.current.disconnect();
	}, []);

	// Auto-scroll to bottom
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	const sendMessage = useCallback(() => {
		if (messageInput.trim().length === 0) return;

		socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, messageInput.trim());
		setMessageInput("");
	}, [messageInput]);

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
						<p className="text-xs text-emerald-600 flex items-center gap-1">
							<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
							Online sebagai {username}
						</p>
					</div>
				</div>

				{/* Messages Area */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.map((singleMessage, index) => {
						const isSystem = singleMessage.username === "system";
						const isMe = singleMessage.username === username;

						// Logic to clean up message text based on your server's format
						const messageText =
							!isSystem && singleMessage.message.startsWith(username)
								? singleMessage.message.replace(`${username}:`, "")
								: singleMessage.message;

						if (isSystem) {
							return (
								// biome-ignore lint/suspicious/noArrayIndexKey: no id
								<div key={index} className="flex justify-center my-4">
									<span className="bg-gray-200 text-slate-800 text-xs px-3 py-1 rounded-full uppercase tracking-wider font-medium">
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
												? "bg-emerald-600 text-white rounded-2xl rounded-tr-sm" // My Bubble
												: "bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl rounded-tl-sm" // Their Bubble
										}
                  `}
								>
									{/* Optional: Show sender name for others if needed */}
									{!isMe && (
										<p className="text-[10px] text-emerald-600 font-bold mb-1 opacity-80 uppercase">
											{singleMessage.username}
										</p>
									)}

									{messageText}
								</div>
							</div>
						);
					})}
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
							onChange={(e) => setMessageInput(e.target.value)}
							placeholder="Taip mesej anda..."
							className="flex-1 bg-slate-800 text-white border-slate-700 focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-2xl px-4 py-3 transition-all outline-none"
							autoComplete="off"
						/>

						<button
							type="submit"
							disabled={messageInput.trim().length === 0}
							className={`
                p-3 rounded-full transition-all duration-200 shadow-md flex-shrink-0
                ${
									messageInput.trim().length > 0
										? "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105"
										: "bg-gray-200 text-gray-400 cursor-not-allowed"
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
