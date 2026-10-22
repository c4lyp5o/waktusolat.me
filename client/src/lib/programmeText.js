// programmeText.js — a programme's "when" in plain Malay, and the dates the
// editor acts on. Dates are Malaysia calendar dates ("YYYY-MM-DD").

import { DAYS, MONTHS } from "./waktu/format.js";
import { mytEpoch, mytParts } from "./waktu/mytime.js";

export const PRAYER_NAMES = {
	subuh: "Subuh",
	zohor: "Zohor",
	asar: "Asar",
	maghrib: "Maghrib",
	isyak: "Isyak",
};

const parse = (iso) => iso.split("-").map(Number);
const utcDay = (iso) => {
	const [y, m, d] = parse(iso);
	return new Date(Date.UTC(y, m - 1, d));
};
export const weekdayOf = (iso) => utcDay(iso).getUTCDay();
export const addDays = (iso, n) =>
	new Date(utcDay(iso).getTime() + n * 86_400_000).toISOString().slice(0, 10);

// "Sabtu, 31 Oktober"; the year only when it is not this year's.
export function dateText(iso, today) {
	const [y, m, d] = parse(iso);
	const year = today && today.slice(0, 4) === String(y) ? "" : ` ${y}`;
	return `${DAYS[weekdayOf(iso)]}, ${d} ${MONTHS[m - 1]}${year}`;
}

// "Hari ini", "Esok", or the date.
export function dayLabel(iso, today) {
	if (iso === today) return "Hari ini";
	if (iso === addDays(today, 1)) return "Esok";
	return dateText(iso, today);
}

// 21:00 -> "9:00 malam"; the Malay parts of the day.
export function clockText(hhmm) {
	const [h, m] = hhmm.split(":").map(Number);
	const part = h < 12 ? "pagi" : h < 14 ? "tengah hari" : h < 19 ? "petang" : "malam";
	const h12 = h % 12 === 0 ? 12 : h % 12;
	return `${h12}:${String(m).padStart(2, "0")} ${part}`;
}

// The epoch of an occurrence: a clock time, or the prayer's time that day
// (from a parsed day row, lib/waktu/rows.js). null when it can't be known.
export function resolveAt(at, iso, day) {
	if (at.time) {
		const [y, mo, d] = parse(iso);
		const [h, mi] = at.time.split(":").map(Number);
		return mytEpoch(y, mo, d, h, mi);
	}
	return day?.isoDate === iso ? (day.times[at.after] ?? null) : null;
}

// "9:00 malam", "selepas Maghrib", "selepas Maghrib (7:01 malam)"; on a
// Friday, after Zohor is after Jumaat.
export function atText(at, iso, day) {
	if (at.time) return clockText(at.time);
	const friday = iso && weekdayOf(iso) === 5;
	const name = at.after === "zohor" && friday ? "Jumaat" : PRAYER_NAMES[at.after];
	const t = iso ? resolveAt(at, iso, day) : null;
	if (t == null) return `selepas ${name}`;
	const { hour, minute } = mytParts(t);
	return `selepas ${name} (${clockText(`${hour}:${String(minute).padStart(2, "0")}`)})`;
}

// "Setiap Isnin" (with its range), or the one-off's date.
export function whenText(p, today) {
	if (p.repeat === "once") return dateText(p.date, today);
	let text = `Setiap ${DAYS[p.weekday]}`;
	if (p.from && p.from > today) text += `, mula ${dateText(p.from, today)}`;
	if (p.until) text += `, hingga ${dateText(p.until, today)}`;
	return text;
}

// The weekly programme's next date on or after today within its range,
// skipped or not (what "Cuti minggu ini" acts on), or null.
export function nextDate(p, today) {
	if (p.repeat !== "weekly") return null;
	let date = p.from && p.from > today ? p.from : today;
	date = addDays(date, (p.weekday - weekdayOf(date) + 7) % 7);
	return p.until && date > p.until ? null : date;
}
