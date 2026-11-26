// kiosk.js — the unattended-screen rules of the TV display: the burn-in drift
// and the daily reload decision. Pure; the browser side is in tv/kiosk.js.
import { mytIsoDate, mytParts } from "./mytime.js";

export const DRIFT_PX = 6;
export const DRIFT_CYCLE_MS = 20 * 60 * 1000;
// Fresh-page grace: a reload can never repeat sooner than this, even when
// storage is blocked and cannot remember that today's reload already ran.
export const MIN_UPTIME_MS = 5 * 60 * 1000;
export const RELOAD_HOUR = 3;

// Whole-pixel offset of the screen from centre, a slow Lissajous loop of
// ±DRIFT_PX over one cycle. Whole pixels so text never sits on a half pixel.
export function drift(now) {
	const phase = ((now % DRIFT_CYCLE_MS) / DRIFT_CYCLE_MS) * 2 * Math.PI;
	return {
		x: Math.round(DRIFT_PX * Math.sin(phase)),
		y: Math.round(DRIFT_PX * Math.sin(phase * 2 + Math.PI / 3)),
	};
}

// Reload once a day, during the 03:00 hour Malaysia time, when the page has
// been up a while and today's reload has not run. `lastReload` is the date
// key stored by the last one. (The caller also checks the server answers.)
export function reloadDue(now, { uptimeMs, lastReload }) {
	if (mytParts(now).hour !== RELOAD_HOUR) return false;
	if (uptimeMs < MIN_UPTIME_MS) return false;
	return lastReload !== mytIsoDate(now);
}
