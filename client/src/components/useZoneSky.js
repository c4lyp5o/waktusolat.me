// useZoneSky.js — the sky over a zone right now (lib/waktu/sky.js), for the
// navbar band. The zone is the page's (/times/:zone), else the remembered
// one, else WLY01. The week's times come through SWR under the same key as
// ZoneTimes, so the zone page makes no second request.
import { useEffect, useState } from "react";
import useSWR from "swr";
import { safeStorage } from "../lib/storage.js";
import { dayFor, parseYear } from "../lib/waktu/rows.js";
import { siteNow } from "../lib/waktu/siteNow.js";
import { skyPhase } from "../lib/waktu/sky.js";
import { loadZone } from "../lib/zoneMemory.js";
import { zoneInfo } from "../lib/zones.js";

export async function fetchDays(url) {
	const res = await fetch(url);
	if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
	return parseYear(await res.json());
}

export function skyZone(pathname) {
	const m = pathname.match(/^\/times\/([a-z]{3}\d{2})\b/i);
	const zone = m?.[1].toLowerCase() ?? loadZone(safeStorage());
	return zone && zoneInfo(zone) ? zone : "wly01";
}

// Prayer times are whole minutes, so the sky can only change on a minute:
// tick just after each one, in step with the zone page's own clock.
function useMinute() {
	const [now, setNow] = useState(siteNow);
	useEffect(() => {
		let timer;
		const tick = () => {
			const t = siteNow();
			setNow(t);
			timer = setTimeout(tick, 60_000 - (t % 60_000) + 5);
		};
		timer = setTimeout(tick, 60_000 - (siteNow() % 60_000) + 5);
		return () => clearTimeout(timer);
	}, []);
	return now;
}

// The phase, or null until the times are in (the band stays plain).
export default function useZoneSky(zone) {
	const now = useMinute();
	const { data: days } = useSWR(`/api/v1/waktusolat/week/${zone}`, fetchDays);
	const found = days?.length ? dayFor(days, now) : null;
	return found ? skyPhase(now, found.day) : null;
}
