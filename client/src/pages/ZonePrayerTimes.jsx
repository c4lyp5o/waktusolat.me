// /times/:zone — a zone's prayer times. Visiting a zone remembers it, so
// `/` opens straight on it next time.
//
// Which page is not decided here: the tema names a web layout in
// shared/temas.js, and client/src/web/layouts maps that name to a component.
// Picking a tema swaps the page in place (TEMA_EVENT), no reload.
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { webLayoutOf } from "../../../shared/temas.js";
import TemaMenu from "../components/TemaMenu.jsx";
import { safeStorage } from "../lib/storage.js";
import { currentTema, TEMA_EVENT } from "../lib/tema.js";
import { saveZone } from "../lib/zoneMemory.js";
import { zoneInfo } from "../lib/zones.js";
import { webPageFor } from "../web/layouts/index.js";

export const changeZoneLink = (
	<Link
		to="/?pilih"
		className="shrink-0 rounded-full bg-raised px-3 py-1.5 text-sm font-semibold text-ink hover:bg-line md:px-4 md:py-2 md:text-[15px]"
	>
		Tukar zon
	</Link>
);

export default function ZonePrayerTimes() {
	const zone = useParams().zone.toLowerCase();
	const [tema, setTema] = useState(currentTema);

	useEffect(() => {
		if (zoneInfo(zone)) saveZone(safeStorage(), zone);
	}, [zone]);

	useEffect(() => {
		const on = (e) => setTema(e.detail?.id ?? currentTema());
		window.addEventListener(TEMA_EVENT, on);
		return () => window.removeEventListener(TEMA_EVENT, on);
	}, []);

	const menu = <TemaMenu />;

	// The tema names its page (sky, almanak, siang…); the pool owns the mapping.
	const Page = webPageFor(webLayoutOf(tema));
	return <Page zone={zone} tema={tema} changeZone={changeZoneLink} temaButton={menu} />;
}
