// rows.js — turn /api/v1/waktusolat/year rows into Malaysia-time epochs.
//
// API rows are display-formatted by the server, e.g.
//   { date: "22/10/2026 / 22/Oktober/2026", hijri: "12/9/1447 / 12/Ramadhan/1447",
//     imsak: "05:50:00", fajr: "06:00:00", ... }
// This is the only place that reads those strings; everything downstream
// works on { isoDate, hijri, times: { imsak, subuh, ... } } with epoch ms.
import { DAY_MS, mytEpoch, mytIsoDate } from "./mytime.js";
import { API_FIELD, ORDER } from "./names.js";

const isoOf = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function parseTime(value) {
	const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(String(value ?? "").trim());
	if (!m) return null;
	const [h, mi, s] = m.slice(1).map((v) => Number(v ?? 0));
	return h < 24 && mi < 60 && s < 60 ? [h, mi, s] : null;
}

// "12/9/1447 / 12/Ramadhan/1447" -> "12 Ramadhan 1447". Shown exactly as
// JAKIM gives it; never computed or adjusted here.
function parseHijri(value) {
	const named = String(value ?? "").split(" / ")[1];
	const parts = named?.split("/");
	return parts?.length === 3 && parts.every(Boolean) ? parts.join(" ") : null;
}

export function parseRow(row) {
	const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(row?.date ?? ""));
	if (!m) return null;
	const [day, month, year] = m.slice(1).map(Number);
	const times = {};
	for (const key of ORDER) {
		const t = parseTime(row[API_FIELD[key]]);
		if (!t) return null;
		times[key] = mytEpoch(year, month, day, ...t);
	}
	return { isoDate: isoOf(year, month, day), hijri: parseHijri(row.hijri), times };
}

// The year endpoint's body (or its `data` array) -> days sorted by date.
export function parseYear(body) {
	const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
	return rows
		.map(parseRow)
		.filter(Boolean)
		.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

// Shift a day to another date by whole days (stale-data fallback). Hijri is
// dropped: it is only ever shown as JAKIM publishes it.
function reanchor(day, isoDate) {
	const shift = Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${day.isoDate}T00:00:00Z`);
	const times = Object.fromEntries(Object.entries(day.times).map(([k, t]) => [k, t + shift]));
	return { isoDate, hijri: null, times };
}

// The day containing epochMs. When the data does not cover it (e.g. 1 Jan
// before JAKIM publishes the new year), the nearest day is re-anchored to
// today and flagged as an estimate: times drift ~1 min/day, fine for a day
// or two. null only when there is no data at all.
export function dayFor(days, epochMs) {
	if (!days?.length) return null;
	const iso = mytIsoDate(epochMs);
	const exact = days.find((d) => d.isoDate === iso);
	if (exact) return { day: exact, estimate: false };
	const nearest = iso > days.at(-1).isoDate ? days.at(-1) : days[0];
	return { day: reanchor(nearest, iso), estimate: true };
}

// The calendar day after `day` in the data, or null.
export function nextDay(days, day) {
	const iso = mytIsoDate(day.times.subuh + DAY_MS);
	return days.find((d) => d.isoDate === iso) ?? null;
}
