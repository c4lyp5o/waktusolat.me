// tema.js — which tema paints the website.
//
// Precedence, in one place: the URL wins (a shared link should look the way it
// was shared), then the visitor's remembered choice, then Langit. A tema with
// no site palette yet is not eligible, so `?tema=takwim` falls back cleanly
// instead of painting an unstyled page.
import { DEFAULT_TEMA, isWebTema } from "../../../shared/temas.js";

export const TEMA_KEY = "waktu:tema";
// Fired on <html> whenever the tema changes, so a page can swap its layout
// without a reload.
export const TEMA_EVENT = "waktu:tema";

export const currentTema = () =>
	typeof document === "undefined"
		? DEFAULT_TEMA
		: document.documentElement.dataset.tema || DEFAULT_TEMA;

// Pure, so the rule is unit-tested without a DOM.
export function resolveTema({ url = null, saved = null, fallback = DEFAULT_TEMA } = {}) {
	if (isWebTema(url)) return url;
	if (isWebTema(saved)) return saved;
	return isWebTema(fallback) ? fallback : DEFAULT_TEMA;
}

function storage() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

export function readSavedTema(store = storage()) {
	try {
		return store?.getItem(TEMA_KEY) ?? null;
	} catch {
		return null;
	}
}

// Paint it on <html>; the CSS keys off [data-tema].
export function applyTema(id) {
	const next = isWebTema(id) ? id : DEFAULT_TEMA;
	document.documentElement.dataset.tema = next;
	document.dispatchEvent(new CustomEvent(TEMA_EVENT, { detail: { id: next }, bubbles: true }));
	return next;
}

// Before first paint React-wise: the inline script in index.html already ran;
// this repeats it so a blocked localStorage or a missing script still lands on
// a valid tema.
export function initTema(search = window.location.search) {
	const url = new URLSearchParams(search).get("tema");
	const id = resolveTema({ url, saved: readSavedTema() });
	applyTema(id);
	return id;
}

export function saveTema(id, store = storage()) {
	if (!isWebTema(id)) return false;
	try {
		store?.setItem(TEMA_KEY, id);
	} catch {
		// Not remembered; still applied for this visit.
	}
	applyTema(id);
	return true;
}
