// /times/:zone — a zone's prayer times. Visiting a zone remembers it, so
// `/` opens straight on it next time.
import { useEffect } from "react";
import { Link, useParams } from "react-router";
import ZoneTimes from "../components/ZoneTimes.jsx";
import { safeStorage } from "../lib/storage.js";
import { saveZone } from "../lib/zoneMemory.js";
import { zoneInfo } from "../lib/zones.js";

export const changeZoneLink = (
	<Link
		to="/?pilih"
		className="shrink-0 rounded-full bg-raised px-4 py-2 text-[15px] font-semibold text-ink hover:bg-line"
	>
		Tukar zon
	</Link>
);

export default function ZonePrayerTimes() {
	const zone = useParams().zone.toLowerCase();
	useEffect(() => {
		if (zoneInfo(zone)) saveZone(safeStorage(), zone);
	}, [zone]);
	return <ZoneTimes zone={zone} changeZone={changeZoneLink} />;
}
