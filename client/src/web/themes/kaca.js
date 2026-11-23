// kaca.js — the Kaca site tema needs the photograph as a CSS var, and Vite
// only rewrites imports. One asset, hashed, so it caches like the rest.
import photo from "../../assets/kaca.webp";
import "./kaca.css";

try {
	document.documentElement.style.setProperty("--kaca-photo", `url("${photo}")`);
} catch {
	// Tests and SSR: the veil alone still reads.
}
