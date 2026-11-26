// web/layouts/index.js — the site's page pool, the mirror of tv/layouts.
//
// A tema names a page in shared/temas.js (`webLayout`); this file is the only
// place that turns that name into a component. Adding a printed page (Poster,
// Editorial, Jadual…) is one component and one line here — no page ever
// branches on a tema id again.
import ZoneAlmanak from "../../components/ZoneAlmanak.jsx";
import ZoneTimes from "../../components/ZoneTimes.jsx";
import ZoneEditorial from "./ZoneEditorial.jsx";
import ZoneKad from "./ZoneKad.jsx";
import ZoneMihrab from "./ZoneMihrab.jsx";
import ZonePoster from "./ZonePoster.jsx";
import ZoneSiang from "./ZoneSiang.jsx";

export const WEB_PAGES = Object.freeze({
	sky: ZoneTimes,
	almanak: ZoneAlmanak,
	siang: ZoneSiang,
	poster: ZonePoster,
	editorial: ZoneEditorial,
	mihrab: ZoneMihrab,
	kad: ZoneKad,
});

export function webPageFor(layout) {
	return WEB_PAGES[layout] ?? ZoneAlmanak;
}
