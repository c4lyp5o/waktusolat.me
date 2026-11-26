// useZoneSchedule.js — the one place a site page asks for a zone's day.
//
// Every printed page (almanak, siang, and whatever the next draft becomes)
// needs the same five things: the zone's info, the site clock, the week's
// days, today's window, and the rows. Fetching and deriving them here means a
// new page layout is a composition, never a second copy of the schedule logic.
import useSWR from "swr";
import { fetchDays } from "../components/useZoneSky.js";
import { dayFor, nextDay } from "../lib/waktu/rows.js";
import { listRows, screenState } from "../lib/waktu/schedule.js";
import { SITE_CONFIG, useSiteNow } from "../lib/waktu/siteClock.js";
import { zoneInfo } from "../lib/zones.js";

export function useZoneSchedule(zone) {
	const info = zoneInfo(zone);
	const now = useSiteNow();
	const { data: days, error } = useSWR(info ? `/api/v1/waktusolat/week/${zone}` : null, fetchDays);
	const found = days?.length ? dayFor(days, now) : null;
	const today = found?.day ?? null;
	const estimate = Boolean(found?.estimate);
	const state = today
		? screenState(now, today, estimate ? null : nextDay(days, today), SITE_CONFIG)
		: null;
	// The estimate flag travels with the state, so a page can print "~" and
	// "(anggaran)" without knowing where the times came from.
	const shown = state && estimate ? { ...state, estimate: true } : state;
	const rows = state ? listRows(now, today, state) : null;
	return { info, now, days, error, found, today, estimate, state, shown, rows };
}
