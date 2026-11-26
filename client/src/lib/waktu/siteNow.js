// siteNow.js — the website's clock. Outside production, ?now=YYYY-MM-DDTHH:MM
// (Malaysia time, read once at load) shifts it, so every sky can be checked
// in a browser; production ignores it, like the TV's ?now=.
import { parseConfig } from "./config.js";

const offset = (() => {
	if (typeof window === "undefined") return 0;
	const { now } = parseConfig(new URLSearchParams(window.location.search), import.meta.env.MODE);
	return now === null ? 0 : now - Date.now();
})();

export const siteNow = () => Date.now() + offset;
