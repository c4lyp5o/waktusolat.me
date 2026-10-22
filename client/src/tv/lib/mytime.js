// mytime.js — Malaysia wall-clock maths, independent of the device timezone.
//
// A mosque TV can have both its clock and its timezone set wrong. The clock
// is corrected by the server offset (clock.js); the timezone is sidestepped
// here: Malaysia is UTC+8 with no daylight saving, so wall time is just
// epoch + 8h read through the UTC getters. Never use getHours() and friends.

export const MYT_OFFSET_MS = 8 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

// epoch ms -> { year, month (1-12), day, hour, minute, second, weekday (0 = Sunday) }
export function mytParts(epochMs) {
	const d = new Date(epochMs + MYT_OFFSET_MS);
	return {
		year: d.getUTCFullYear(),
		month: d.getUTCMonth() + 1,
		day: d.getUTCDate(),
		hour: d.getUTCHours(),
		minute: d.getUTCMinutes(),
		second: d.getUTCSeconds(),
		weekday: d.getUTCDay(),
	};
}

// Malaysia wall time -> epoch ms.
export function mytEpoch(year, month, day, hour = 0, minute = 0, second = 0) {
	return Date.UTC(year, month - 1, day, hour, minute, second) - MYT_OFFSET_MS;
}

// "YYYY-MM-DD" of the Malaysian calendar day containing epochMs.
export function mytIsoDate(epochMs) {
	const { year, month, day } = mytParts(epochMs);
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
