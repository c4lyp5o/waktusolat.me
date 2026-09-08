// timesRefresh.js — self-healing prayer-times refresh.
//
// JAKIM publishes e-Solat data one year at a time and ignores any
// "next year" parameter, so data can only be re-pulled once JAKIM has
// published the new year (typically late in the preceding year). The
// scheduler checks every zone's latest served date daily; when today is
// missing it refetches from JAKIM, rewrites data/times/<zone>.json, and
// library.js's mtime cache picks the new file up on the next read.
//
// Graceful degradation: while a refetch is pending or failing, the stale
// data keeps serving (prayer times drift ~1 min/day — harmless for the
// day or two until JAKIM publishes and we succeed).

import fs from "node:fs/promises";
import { join } from "node:path";
import Cpray from "cpray";
import { MONTH_ABBREV_NUM } from "./jakimDates.js";
import logger from "./logger.js";

const cpray = new Cpray();

// data/times/<zone>.json lives beside this file's parent dir
const timesDir = join(import.meta.dir, "../data/times");

// "01-Mac-2026" / "01-Jan-2026" -> "2026-03-01"; null if unparseable
export const jakimDateToIso = (date) => {
	const parts = String(date ?? "").split("-");
	if (parts.length !== 3) return null;
	const [day, abbrev, year] = parts;
	const month = MONTH_ABBREV_NUM[abbrev];
	if (!month) return null;
	return `${year}-${String(month).padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const todayIso = () => {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

const validYearPayload = (payload) =>
	Array.isArray(payload?.prayerTime) && payload.prayerTime.length > 100;

export async function refreshZone(zone) {
	try {
		const payload = await cpray.getTimesbyYear(zone);
		if (!validYearPayload(payload)) {
			logger.warn(
				`[timesRefresh] ${zone}: JAKIM returned no usable data (status=${payload?.status})`,
			);
			return false;
		}
		const file = join(timesDir, `${zone}.json`);
		await fs.writeFile(file, JSON.stringify(payload), "utf8");
		logger.info(`[timesRefresh] ${zone}: wrote ${payload.prayerTime.length} rows`);
		return true;
	} catch (error) {
		logger.warn(`[timesRefresh] ${zone}: fetch failed: ${error.message}`);
		return false;
	}
}

// Returns the latest date (ISO) present in a zone's data, or null when the
// file is missing / an error payload / empty.
export function latestDataDate(rows) {
	if (!Array.isArray(rows) || rows.length === 0) return null;
	const last = rows[rows.length - 1];
	if (!last?.date) return null;
	return jakimDateToIso(last.date);
}

// Check every zone once; refetch only the stale ones. Returns a summary
// for logging. Consecutive same-day failures are throttled per zone so a
// dead JAKIM endpoint doesn't get hammered all day.
const failureStreaks = new Map(); // zone -> { day, count }

export async function checkAndRefreshZones(Zones) {
	const today = todayIso();
	const summary = { checked: 0, fresh: 0, stale: [], refreshed: 0, failed: [] };

	for (const [zone, info] of Object.entries(Zones)) {
		summary.checked += 1;
		const rows = info.db;
		const lastDate = latestDataDate(rows);
		if (!lastDate) {
			// No usable data at all (missing file or error payload).
			summary.stale.push(zone);
		} else if (lastDate >= today) {
			summary.fresh += 1;
			continue;
		} else {
			summary.stale.push(zone);
		}

		// Throttle: at most 2 attempts per zone per calendar day.
		const streak = failureStreaks.get(zone);
		if (streak?.day === today && streak.count >= 2) continue;

		const ok = await refreshZone(zone);
		if (ok) {
			failureStreaks.delete(zone);
			summary.refreshed += 1;
		} else {
			const prev = streak?.day === today ? streak.count : 0;
			failureStreaks.set(zone, { day: today, count: prev + 1 });
			summary.failed.push(zone);
		}
		// Be polite to e-Solat.
		await new Promise((resolve) => setTimeout(resolve, 500));
	}

	if (summary.stale.length > 0) {
		logger.warn(
			`[timesRefresh] ${summary.stale.length}/${summary.checked} zones stale: ${summary.stale.join(",")}`,
		);
	}
	return summary;
}

export function startTimesRefresher(Zones, intervalMs = 6 * 60 * 60 * 1000) {
	const run = async (trigger) => {
		try {
			const summary = await checkAndRefreshZones(Zones);
			if (summary.refreshed > 0 || summary.failed.length > 0) {
				logger.info(
					`[timesRefresh] ${trigger}: checked=${summary.checked} fresh=${summary.fresh} refreshed=${summary.refreshed} failed=${summary.failed.length}`,
				);
			}
		} catch (error) {
			logger.error(`[timesRefresh] ${trigger}: ${error.message}`);
		}
	};

	// Boot check — fire and forget, never block startup.
	setTimeout(() => run("boot"), 5_000);
	// Re-check every 6h so a JAKIM publish is picked up same day.
	const timer = setInterval(() => run("interval"), intervalMs);
	// Don't hold the process open just for the timer.
	timer.unref?.();
}
