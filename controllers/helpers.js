// JAKIM month abbreviations (Malay since 2026, English in older seeds) and
// date helpers, shared with utils/timesRefresh.js.
import {
	CHRIST_MONTH_NAME,
	jakimDateToIso,
	MONTH_ABBREV_NUM,
	todayIso,
} from "../utils/jakimDates.js";
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
	// No tomorrow row on the last day of data (31 Dec, or stale data):
	// today's fajr is within a minute or two of tomorrow's.
	const tomorrowsFajrTime = await getDateFromHoursAndAdd1Day((times[1] ?? times[0]).fajr);
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

// Build { isoDate -> index } for a zone's rows. Exported for tests.
export const buildDateIndex = (rows) => {
	const index = new Map();
	for (let i = 0; i < rows.length; i++) {
		const iso = jakimDateToIso(rows[i]?.date);
		if (iso && !index.has(iso)) index.set(iso, i);
	}
	return index;
};

// library.js returns the same rows array until the file's mtime changes, so
// the index is built once per data refresh instead of once per request.
const dateIndexCache = new WeakMap();
const dateIndexFor = (rows) => {
	let index = dateIndexCache.get(rows);
	if (!index) {
		index = buildDateIndex(rows);
		dateIndexCache.set(rows, index);
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
	const index = dateIndexFor(rows);
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
		case "today":
			// Today + tomorrow when present (only today on the last row).
			return rows.slice(todayIdx, todayIdx + 2).map(formatRow);
		case "week":
			return rows.slice(todayIdx, todayIdx + 7).map(formatRow);
		case "month": {
			// All rows sharing the served day's month + year (date-anchored, so
			// it is correct across a rollover or leap year, and matches "today"
			// when data is stale).
			const prefix = jakimDateToIso(rows[todayIdx].date)?.slice(0, 7); // "YYYY-MM"
			if (!prefix) return [];
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
// ?max=<chars> on the random ayat/hadith routes (the TV banner needs items
// that fit without shrinking). The indexes of items that fit are computed
// once per (source, max) and kept in a small capped cache.
const MAX_CHARS_LIMIT = 5000;
const FIT_CACHE_SIZE = 16;
const fitCache = new Map();

// undefined -> null (no filter); a whole number 1..5000 -> it; else NaN.
const parseMax = (value) => {
	if (value === undefined) return null;
	if (!/^\d+$/.test(String(value))) return Number.NaN;
	const n = Number(value);
	return n >= 1 && n <= MAX_CHARS_LIMIT ? n : Number.NaN;
};

function fittingIndexes(key, items, textOf, max) {
	const cacheKey = `${key}:${max}`;
	let fits = fitCache.get(cacheKey);
	if (!fits) {
		fits = [];
		for (let i = 0; i < items.length; i++) if ((textOf(items[i]) ?? "").length <= max) fits.push(i);
		if (fitCache.size >= FIT_CACHE_SIZE) fitCache.delete(fitCache.keys().next().value);
		fitCache.set(cacheKey, fits);
	}
	return fits;
}

const pickIndex = (length) => Math.floor(Math.random() * length);

// Every verse as [surahIndex, verseIndex], for picks filtered by length.
const ALL_AYAT = Quranmy.flatMap((surah, s) => surah.verses.map((_, v) => [s, v]));

// biome-ignore lint/complexity/noStaticOnlyClass: i dont even
class QuranHelpers {
	static getSurahNames = (_req, res) => {
		// meaning (Malay), verses and type are additive: the old fields stay.
		const data = Quranen.map(
			({ id, name, transliteration, translation, total_verses, type }, i) => ({
				number: id,
				name,
				transliteration,
				translation,
				meaning: Quranmy[i].translation,
				verses: total_verses,
				type,
			}),
		);
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

	static getRandomAyat = (req, res) => {
		const eng = Quranen;
		const mys = Quranmy;
		const max = parseMax(req.query?.max);
		if (Number.isNaN(max)) return res.status(400).json({ message: "Invalid max" });
		let randomSurahIndex;
		let randomAyatIndex;
		if (max === null) {
			randomSurahIndex = pickIndex(eng.length);
			randomAyatIndex = pickIndex(eng[randomSurahIndex].verses.length);
		} else {
			const fits = fittingIndexes("ayat", ALL_AYAT, ([s, v]) => mys[s].verses[v].translation, max);
			if (fits.length === 0) return res.status(404).json({ message: "No ayat that short" });
			[randomSurahIndex, randomAyatIndex] = ALL_AYAT[fits[pickIndex(fits.length)]];
		}
		const { name, transliteration, verses } = eng[randomSurahIndex];
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
		const max = parseMax(req.query?.max);
		if (Number.isNaN(max)) return res.status(400).json({ message: "Invalid max" });
		let index = pickIndex(bookData.length);
		if (max !== null) {
			const fits = fittingIndexes(`hadis:${book}`, bookData, (h) => h.hadis, max);
			if (fits.length === 0) return res.status(404).json({ message: "No hadith that short" });
			index = fits[pickIndex(fits.length)];
		}
		const { hadis, kitab, id } = bookData[index];

		return res.status(200).json({ hadis, kitab, id });
	}
}
// biome-ignore lint/complexity/noStaticOnlyClass: i dont even
class TimeHelpers {
	static async getTime(req, res) {
		const { period, zone } = req.params;
		const validPeriods = ["today", "week", "month", "year"];

		if (!validPeriods.includes(period)) {
			return res.status(400).json({ message: "Invalid period" });
		}

		if (!Object.hasOwn(Zones, zone)) {
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
			const today = period === "today" ? data : timeCruncher("today", currentZone);
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
