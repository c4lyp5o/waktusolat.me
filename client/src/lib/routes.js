// routes.js — which paths are a TV screen (no site chrome, kiosk features):
// /tv/:zone and a mosque's /m/:id, but not the mosque pages /m/baru and
// /m/:id/edit.
export const isTvPath = (p) =>
	p.startsWith("/tv/") || (/^\/m\/[^/]+\/?$/.test(p) && !/^\/m\/baru\/?$/.test(p));
