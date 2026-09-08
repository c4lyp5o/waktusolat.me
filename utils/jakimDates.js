// jakimDates.js — JAKIM date abbreviation maps shared by the display
// parser (controllers/helpers.js) and the refresh scheduler
// (utils/timesRefresh.js).
//
// Live e-Solat payloads since 2026 use Malay abbreviations (Mac, Mei,
// Ogos, Okt, Dis); older seeds were English (Mar, May, Aug, Oct, Dec).
// Accept both so either vintage parses.

export const MONTH_ABBREV_NUM = {
	Jan: 1,
	Feb: 2,
	Mac: 3,
	Mar: 3,
	Apr: 4,
	Mei: 5,
	May: 5,
	Jun: 6,
	Jul: 7,
	Ogos: 8,
	Aug: 8,
	Sep: 9,
	Okt: 10,
	Oct: 10,
	Nov: 11,
	Dis: 12,
	Dec: 12,
};

export const CHRIST_MONTH_NAME = {
	1: "Januari",
	2: "Februari",
	3: "Mac",
	4: "April",
	5: "Mei",
	6: "Jun",
	7: "Julai",
	8: "Ogos",
	9: "September",
	10: "Oktober",
	11: "November",
	12: "Disember",
};
