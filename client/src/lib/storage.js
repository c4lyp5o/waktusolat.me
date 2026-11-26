// storage.js — localStorage, or null where the browser blocks it (private
// mode, TV kiosk browsers). Every caller treats null as "no memory".
export function safeStorage() {
	try {
		const storage = window.localStorage;
		storage.getItem("probe");
		return storage;
	} catch {
		return null;
	}
}
