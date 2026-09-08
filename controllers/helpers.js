import {
	AbudaudBook,
	BukhariBook,
	IbnumajahBook,
	MuslimBook,
	NasaiBook,
	Quranen,
	Quranmy,
	TirmiziBook,
	Zones,
} from "./library.js";

// functions to use
const getDateFromHours = (time) => {
	const timeParts = time.split(":");
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...timeParts);
};
const getDateFromHoursAndAdd1Day = async (time) => {
	try {
		const [hours, minutes] = time.split(":");
		const tomorrow = new Date(Date.now() + 3600 * 1000 * 24);
		const nextDayDate = new Date(
			tomorrow.getFullYear(),
			tomorrow.getMonth(),
			tomorrow.getDate(),
			hours,
			minutes,
		);
		return nextDayDate;
	} catch (error) {
		console.error(error);
		return null;
	}
};
const getTimeNow = () => {
	const today = new Date();
	const day = today.getDate().toString().padStart(2, "0");
	const month = (today.getMonth() + 1).toString().padStart(2, "0");
	const year = today.getFullYear().toString();
	const fixedDate = `${day}/${month}/${year}`;
	const dateToday = {
		numberedDate: fixedDate,
		withMonthName: interpretNormalChristDate(today.toLocaleDateString("en-GB")),
	};
	const timeNow = today.toLocaleTimeString();
	return {
		date: `${dateToday.numberedDate} / ${dateToday.withMonthName}`,
		time: timeNow,
	};
};
const interpretHijriMonth = (month) => {
	switch (month) {
		case "01":
			return "Muharram";
		case "02":
			return "Safar";
		case "03":
			return "Rabiul Awal";
		case "04":
			return "Rabiul Akhir";
		case "05":
			return "Jumadil Awal";
		case "06":
			return "Jumadil Akhir";
		case "07":
			return "Rajab";
		case "08":
			return "Syaaban";
		case "09":
			return "Ramadhan";
		case "10":
			return "Syawal";
		case "11":
			return "Zulkaedah";
		case "12":
			return "Zulhijjah";
		default:
			return "Error";
	}
};

// JAKIM month abbreviations — live payloads since 2026 use Malay
// abbreviations (Mac, Mei, Ogos, Okt, Dis); older seeds were English.
// Accept both so either vintage parses. Maps live in utils/jakimDates.js
// (shared with utils/timesRefresh.js).
import { CHRIST_MONTH_NAME, MONTH_ABBREV_NUM } from "../utils/jakimDates.js";

const interpretChristMonth = (month) => {
	const num = MONTH_ABBREV_NUM[month];
	return num ? CHRIST_MONTH_NAME[num] : "Error";
};
const invertedInterpretChristMonth = (month) => {
	const num = MONTH_ABBREV_NUM[month];
	return num ? String(num) : "Error";
};
const interpretNumberedChristMonth = (month) => {
	switch (month) {
		case "01":
			return "Januari";
		case "02":
			return "Februari";
		case "03":
			return "Mac";
		case "04":
			return "April";
		case "05":
			return "Mei";
		case "06":
			return "Jun";
		case "07":
			return "Julai";
		case "08":
			return "Ogos";
		case "09":
			return "September";
		case "10":
			return "Oktober";
		case "11":
			return "November";
		case "12":
			return "Disember";
		default:
			return "Error";
	}
};
const interpretDay = (day) => {
	switch (day) {
		case "Sunday":
			return "Ahad";
		case "Monday":
			return "Isnin";
		case "Tuesday":
			return "Selasa";
		case "Wednesday":
			return "Rabu";
		case "Thursday":
			return "Khamis";
		case "Friday":
			return "Jumaat";
		case "Saturday":
			return "Sabtu";
		default:
			return "Error";
	}
};
const interpretHijriDate = (date) => {
	const [year, month, day] = date.split("-").map(Number);
	const hijriMonth = interpretHijriMonth(month.toString().padStart(2, "0"));
	return {
		withName: `${day}/${hijriMonth}/${year}`,
		withMonthCount: `${day}/${month}/${year}`,
	};
};
const interpretChristDate = (date) => {
	const [day, monthName, year] = date.split("-");
	const christMonth = interpretChristMonth(monthName);
	const numberedMonth = invertedInterpretChristMonth(monthName);
	const formattedDay = day.startsWith("0") ? day.substring(1) : day;
	return {
		withName: `${formattedDay}/${christMonth}/${year}`,
		withNumber: `${formattedDay}/${numberedMonth}/${year}`,
	};
};
const interpretNormalChristDate = (date) => {
	let day = date.substring(0, 2);
	const month = date.substring(3, 5);
	const year = date.substring(6, 11);
	const christMonth = interpretNumberedChristMonth(month);
	if (day.includes("0", 0) && !day.includes("0", 1)) {
		day = day.slice(1, 2);
	}
	return `${day}/${christMonth}/${year}`;
};
const getTimeDifference = async (times) => {
	const timeNow = new Date();
	const fajrTime = getDateFromHours(times[0].fajr);
	const sunriseTime = getDateFromHours(times[0].syuruk);
	const dhuhrTime = getDateFromHours(times[0].dhuhr);
	const asrTime = getDateFromHours(times[0].asr);
	const maghribTime = getDateFromHours(times[0].maghrib);
	const ishaTime = getDateFromHours(times[0].isha);
	const tomorrowsFajrTime = await getDateFromHoursAndAdd1Day(times[1].fajr);
	const timeDifference = {};

	if (timeNow >= fajrTime) {
		timeDifference.status = "fajr has started";
	} else if (timeNow < fajrTime) {
		timeDifference.solatETA = {
			timeToFajr: fajrTime - timeNow,
		};
		timeDifference.status = "time for tahajjud";
	}

	if (timeNow >= sunriseTime) {
		timeDifference.status = "sunrise has started";
	} else if (timeNow < sunriseTime) {
		timeDifference.solatETA = {
			...timeDifference.solatETA,
			timeToSunrise: sunriseTime - timeNow,
		};
	}

	if (timeNow >= dhuhrTime) {
		timeDifference.status = "dhuhr has started";
	} else if (timeNow < dhuhrTime) {
		timeDifference.solatETA = {
			...timeDifference.solatETA,
			timeToDhuhr: dhuhrTime - timeNow,
		};
	}

	if (timeNow >= asrTime) {
		timeDifference.status = "asr has started";
	} else if (timeNow < asrTime) {
		timeDifference.solatETA = {
			...timeDifference.solatETA,
			timeToAsr: asrTime - timeNow,
		};
	}

	if (timeNow >= maghribTime) {
		timeDifference.status = "maghrib has started";
	} else if (timeNow < maghribTime) {
		timeDifference.solatETA = {
			...timeDifference.solatETA,
			timeToMaghrib: maghribTime - timeNow,
		};
	}

	if (timeNow >= ishaTime) {
		timeDifference.solatETA = {
			...timeDifference.solatETA,
			timeToTomorrowsFajrTime: tomorrowsFajrTime - timeNow,
		};
		timeDifference.status = "isha has started";
	} else if (timeNow < ishaTime) {
		timeDifference.solatETA = {
			...timeDifference.solatETA,
			timeToIsha: ishaTime - timeNow,
		};
	}

	return timeDifference;
};
const timeReminder = async (times) => {
	const { status, solatETA } = await getTimeDifference(times);
	const timeReminder = {};

	switch (status) {
		case "fajr has started":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToSunrise)),
				name: "isyraq",
			};
			break;
		case "sunrise has started":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToDhuhr)),
				name: new Date().getDay() === 5 ? "jumaat" : "dhuhr",
			};
			break;
		case "dhuhr has started":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToAsr)),
				name: "asr",
			};
			break;
		case "asr has started":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToMaghrib)),
				name: "maghrib",
			};
			break;
		case "maghrib has started":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToIsha)),
				name: "isha",
			};
			break;
		case "isha has started":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToTomorrowsFajrTime)),
				name: "fajr",
			};
			break;
		case "time for tahajjud":
			timeReminder.nextSolah = {
				...(await convertMstoHours(solatETA.timeToFajr)),
				name: "fajr",
			};
			break;
		default:
			timeReminder.status = "is it judgment day?";
			break;
	}

	return timeReminder;
};
const convertMstoHours = async (milliseconds) => {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const remainingSeconds = seconds % 60;
	const remainingMinutes = minutes % 60;
	const remainingHours = hours % 24;
	return {
		hours: remainingHours,
		minutes: remainingMinutes,
		seconds: remainingSeconds,
		milliseconds: milliseconds,
	};
};
// JAKIM rows carry dates as "01-Mac-2026". Build a date-keyed map so
// serving is anchored to actual dates, not array positions — the year
// rollover (31-Dis -> 01-Jan) is seamless the moment fresh data lands.
const jakimDateToIso = (date) => {
	const parts = String(date ?? "").split("-");
	if (parts.length !== 3) return null;
	const [day, abbrev, year] = parts;
	const month = MONTH_ABBREV_NUM[abbrev];
	if (!month) return null;
	return `${year}-${String(month).padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const todayIso = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
		now.getDate(),
	).padStart(2, "0")}`;
};

// Build { isoDate -> index } for a zone's rows. Exported for tests.
export const buildDateIndex = (rows) => {
	const index = new Map();
	for (let i = 0; i < rows.length; i++) {
		const iso = jakimDateToIso(rows[i]?.date);
		if (iso && !index.has(iso)) index.set(iso, i);
	}
	return index;
};

const formatRow = (row) => {
	const fixedDate = interpretChristDate(row.date);
	const fixedHijri = interpretHijriDate(row.hijri);
	const fixedDay = interpretDay(row.day);
	return {
		day: `${fixedDay} / ${row.day}`,
		hijri: `${fixedHijri.withMonthCount} / ${fixedHijri.withName}`,
		date: `${fixedDate.withNumber} / ${fixedDate.withName}`,
		imsak: row.imsak,
		fajr: row.fajr,
		syuruk: row.syuruk,
		dhuhr: row.dhuhr,
		asr: row.asr,
		maghrib: row.maghrib,
		isha: row.isha,
	};
};

// Resolve today's position for a zone: exact date match when the data
// contains it; otherwise clamp to the last row (stale-data grace — prayer
// times drift ~1 min/day, harmless for a day or two). Returns -1 when the
// zone has no data at all.
export const resolveTodayIndex = (rows) => {
	if (!Array.isArray(rows) || rows.length === 0) return -1;
	const index = buildDateIndex(rows);
	const today = todayIso();
	if (index.has(today)) return index.get(today);
	// Stale data: serve the last known day instead of crashing or serving
	// a wrong-position row.
	return rows.length - 1;
};

const timeCruncher = (period, zone) => {
	const rows = zone.db;
	if (!Array.isArray(rows) || rows.length === 0) return [];
	const todayIdx = resolveTodayIndex(rows);

	switch (period) {
		case "today": {
			const out = [];
			// Today + tomorrow when present (timeReminder needs [0] and [1]).
			for (let j = todayIdx; j < Math.min(todayIdx + 2, rows.length); j++) {
				out.push(formatRow(rows[j]));
			}
			return out;
		}
		case "week": {
			const out = [];
			for (let j = todayIdx; j < Math.min(todayIdx + 7, rows.length); j++) {
				out.push(formatRow(rows[j]));
			}
			return out;
		}
		case "month": {
			// All rows sharing today's month + year (date-anchored, so it is
			// correct even when the array spans a rollover or leap year).
			const today = todayIso();
			const prefix = today.slice(0, 7); // "YYYY-MM"
			const out = [];
			for (const row of rows) {
				const iso = jakimDateToIso(row?.date);
				if (iso?.startsWith(prefix)) out.push(formatRow(row));
			}
			return out;
		}
		case "year": {
			return rows.map(formatRow);
		}
		default:
			return "error";
	}
};
// biome-ignore lint/complexity/noStaticOnlyClass: i dont even
class QuranHelpers {
	static getSurahNames = (_req, res) => {
		const data = Quranen.map(({ id, name, transliteration, translation }) => ({
			number: id,
			name,
			transliteration,
			translation,
		}));
		res.status(200).json({ data });
	};

	static getFullSurah = (req, res) => {
		const { lang, id } = req.params;
		const Quran = lang === "en" ? Quranen : Quranmy;
		const data = Quran.find(({ id: surahId }) => surahId === Number.parseInt(id, 10));
		if (!data) {
			return res.status(404).json({
				code: 404,
				status: "Not Found.",
				message: "Surah not found.",
			});
		}
		res.status(200).json({ data });
	};

	static getAyatFromSurah = (req, res) => {
		const { lang, id, ayat } = req.params;
		const Quran = lang === "en" ? Quranen : Quranmy;
		const surah = Quran.find(({ id: surahId }) => surahId === Number.parseInt(id, 10));
		if (!surah) {
			return res.status(404).json({
				code: 404,
				status: "Not Found.",
				message: "Surah not found.",
			});
		}
		const data = surah.verses.find(({ id: ayatId }) => ayatId === Number.parseInt(ayat, 10));
		if (!data) {
			return res.status(404).json({
				code: 404,
				status: "Not Found.",
				message: "Ayat not found.",
			});
		}
		res.status(200).json({ data });
	};

	static getRandomAyat = (_req, res) => {
		const eng = Quranen;
		const mys = Quranmy;
		const numberOfSurahs = eng.length;
		const randomSurahIndex = Math.floor(Math.random() * numberOfSurahs);
		const { name, transliteration } = eng[randomSurahIndex];
		const { verses } = eng[randomSurahIndex];
		const randomAyatIndex = Math.floor(Math.random() * verses.length);
		const { id: ayatNumber, text: arabic } = verses[randomAyatIndex];
		const { translation: englishTranslation } = verses[randomAyatIndex];
		const { translation: malayTranslation } = mys[randomSurahIndex].verses[randomAyatIndex];
		const data = {
			fromSurah: `${name} / ${transliteration}`,
			ayatNumber,
			arabic,
			englishTranslation,
			malayTranslation,
		};
		res.status(200).json({ data });
	};
}
// biome-ignore lint/complexity/noStaticOnlyClass: i dont even
class HadithsHelpers {
	static HADITH_BOOKS = ["bukhari", "muslim", "abudaud", "nasai", "tirmizi", "ibnumajah"];

	static getHadithBook(_req, res) {
		return res.status(200).json({ msg: HadithsHelpers.HADITH_BOOKS.join(", ") });
	}

	static getHadith(req, res) {
		const { book } = req.params;

		if (!HadithsHelpers.HADITH_BOOKS.includes(book)) {
			return res.status(404).json({ error: "No Hadith found." });
		}

		const booksMap = {
			bukhari: BukhariBook,
			muslim: MuslimBook,
			abudaud: AbudaudBook,
			nasai: NasaiBook,
			tirmizi: TirmiziBook,
			ibnumajah: IbnumajahBook,
		};
		const bookData = booksMap[book];
		const random = Math.floor(Math.random() * bookData.length);
		const hadis = bookData[random].hadis;

		return res.status(200).json({ hadis });
	}
}
// biome-ignore lint/complexity/noStaticOnlyClass: i dont even
class TimeHelpers {
	static async getTime(req, res) {
		const { period, zone } = req.params;
		const validPeriods = ["today", "week", "month", "year"];
		const zones = Object.keys(Zones);

		if (!validPeriods.includes(period)) {
			return res.status(400).json({ message: "Invalid period" });
		}

		if (!zones.includes(zone)) {
			return res.status(400).json({ message: "Invalid zone" });
		}

		try {
			const currentZone = Zones[zone];
			const data = timeCruncher(period, currentZone);
			// Zone with no data at all (e.g. JAKIM does not publish it) — explicit
			// empty set instead of a 500 from destructuring an empty array.
			if (data.length === 0) {
				return res.status(404).json({ message: "No data for this zone", zone });
			}
			const todayData = getTimeNow();
			const today = timeCruncher("today", currentZone);
			const timeDifference = await timeReminder(today);

			const combinedData = {
				day: today[0].day,
				hijri: today[0].hijri,
				...todayData,
			};

			res.status(200).json({
				today: combinedData,
				nextSolat: timeDifference.nextSolah,
				negeri: currentZone.negeri,
				zone: currentZone.name,
				data,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal Server Error" });
		}
	}
}

export { getTimeNow, HadithsHelpers, QuranHelpers, TimeHelpers, timeCruncher, timeReminder };
