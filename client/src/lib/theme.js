// theme.js — light/dark. Follows the system until the visitor toggles; the
// choice is then remembered. index.html applies it before first paint (same
// rule, inlined) so there is no flash; /tv is always dark.

export const THEME_KEY = "waktu:theme";

export function resolveTheme(stored, systemPrefersDark) {
	if (stored === "light" || stored === "dark") return stored;
	return systemPrefersDark ? "dark" : "light";
}

export function currentTheme() {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme) {
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		// Not remembered; still applied for this visit.
	}
}
