// kaca.js — the Kaca TV tema: its font, its glass, and the photograph behind
// it. The photo is imported so Vite hashes it into /assets/, which is exactly
// what the TV's service worker caches: a mosque whose screen is offline still
// has its photograph.
import photo from "../../assets/kaca.webp";
import "./kaca.css";

try {
	document.documentElement.style.setProperty("--kaca-photo", `url("${photo}")`);
} catch {
	// No DOM (a test, SSR): the CSS falls back to the veil alone.
}
