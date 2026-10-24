// format.js — Malay date and time strings for the TV, in Malaysia time.
import { mytParts } from "./mytime.js";

export const DAYS = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
export const MONTHS = [
	"Januari",
	"Februari",
	"Mac",
	"April",
	"Mei",
	"Jun",
	"Julai",
	"Ogos",
	"September",
	"Oktober",
	"November",
	"Disember",
];

const two = (n) => String(n).padStart(2, "0");

// "20:30"
export function formatTime(epochMs) {
	const { hour, minute } = mytParts(epochMs);
	return `${two(hour)}:${two(minute)}`;
}

// { hm: "09:05", s: "07" } — seconds are set apart (smaller) in the header.
export function formatClock(epochMs) {
	const { hour, minute, second } = mytParts(epochMs);
	return { hm: `${two(hour)}:${two(minute)}`, s: two(second) };
}

// "Khamis, 22 Oktober 2026"
export function formatDate(epochMs) {
	const { year, month, day, weekday } = mytParts(epochMs);
	return `${DAYS[weekday]}, ${day} ${MONTHS[month - 1]} ${year}`;
}

// Remaining ms -> "1:23:45" or "42:15". Rounded up to the whole second, so
// the display reaches 00:00 exactly when the moment arrives, not before.
export function formatCountdown(ms) {
	const total = Math.max(0, Math.ceil(ms / 1000));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	return h > 0 ? `${h}:${two(m)}:${two(s)}` : `${two(m)}:${two(s)}`;
}

// JAKIM area names arrive in capitals ("KUALA LUMPUR DAN PUTRAJAYA"); a
// screen of capitals reads as shouting. Title case, joining words lower.
const LOWER_WORDS = new Set(["dan", "di"]);
export function areaName(value) {
	return String(value ?? "")
		.toLowerCase()
		.replace(/[\p{L}]+/gu, (word, offset) =>
			offset > 0 && LOWER_WORDS.has(word) ? word : word[0].toUpperCase() + word.slice(1),
		);
}
