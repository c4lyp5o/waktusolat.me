import { useEffect, useRef, useState, useCallback } from "react";
import socketIOClient from "socket.io-client";

import "../styles/chat.css";

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
		const generatedUsername = `Anon${Math.floor(Math.random() * 100000)}`;
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = useCallback(() => {
		if (messageInput.trim().length === 0) return;

		socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, messageInput.trim());
		setMessageInput("");
	}, [messageInput]);

	return (
		<div className="chat-container">
			<title>Chat</title>
			<meta
				name="description"
				content="Chat dengan orang awam tanpa diketahui nama"
			/>
			<link rel="icon" href="/favicon.ico" />
			<div className="messages-container">
				<div className="messages-list">
					{messages.map((singleMessage, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							key={index}
							className={`message ${singleMessage.username === "system" ? "system" : singleMessage.username === username ? "sent" : "received"}`}
						>
							<div className="message-content">
								{singleMessage.username !== "system" &&
								singleMessage.message.startsWith(username)
									? singleMessage.message.replace(`${username}:`, "")
									: singleMessage.message}
							</div>
						</div>
					))}
					{/* Invisible div to scroll to the bottom */}
					<div ref={messagesEndRef} />
				</div>
			</div>
			<div className="chat-input-container">
				<form
					className="chat-form"
					onSubmit={(event) => {
						event.preventDefault();
						sendMessage();
					}}
				>
					<input
						type="text"
						id="message"
						name="message"
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						placeholder="Type your message..."
						className="chat-input"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								sendMessage();
							}
						}}
					/>
					<button type="submit" className="chat-send-button">
						Send
					</button>
				</form>
			</div>
		</div>
	);
}
