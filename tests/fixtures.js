// fixtures.js — synthetic JAKIM e-Solat rows for tests.
//
// Rows mirror the live payload shape: date "01-Mac-2026" (Malay month
// abbreviations), hijri "1447-09-12", English day names.

const MALAY_MONTHS = [
	"Jan",
	"Feb",
	"Mac",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Ogos",
	"Sep",
	"Okt",
	"Nov",
	"Dis",
];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const jakimDate = (d) =>
	`${String(d.getDate()).padStart(2, "0")}-${MALAY_MONTHS[d.getMonth()]}-${d.getFullYear()}`;

// `count` consecutive days starting at local date (year, monthIndex, day).
export function makeRows(year, monthIndex, day, count) {
	return Array.from({ length: count }, (_, i) => {
		const d = new Date(year, monthIndex, day + i);
		return {
			hijri: "1447-09-12",
			date: jakimDate(d),
			day: DAYS[d.getDay()],
			imsak: "05:50:00",
			fajr: "06:00:00",
			syuruk: "07:10:00",
			dhuhr: "13:15:00",
			asr: "16:30:00",
			maghrib: "19:20:00",
			isha: "20:30:00",
		};
	});
}

// A whole calendar year, as JAKIM's getTimesbyYear returns it.
export const makeYearPayload = (year) => {
	const days = (new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / 86_400_000;
	return { status: "OK!", prayerTime: makeRows(year, 0, 1, days) };
};
