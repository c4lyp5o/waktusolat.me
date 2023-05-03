import {
  Zones,
  Months,
  Quranen,
  Quranmy,
  BukhariBook,
  MuslimBook,
  AbudaudBook,
  NasaiBook,
  TirmiziBook,
  IbnumajahBook,
} from './library.js';

// functions to use
const getDateFromHours = (time) => {
  time = time.split(':');
  let now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), ...time);
};
const getDateFromHoursAndAdd1Day = async (time) => {
  try {
    const [hours, minutes] = time.split(':');
    const tomorrow = new Date(Date.now() + 3600 * 1000 * 24);
    const nextDayDate = new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      hours,
      minutes
    );
    return nextDayDate;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const getMonthName = () => {
  let numberOfDays = 0;
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  for (let i = 0; i < currentMonth; i++) {
    numberOfDays += Months[i].count;
  }
  return numberOfDays;
};
const getDayNumberInYear = () => {
  return Math.floor(
    (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
      (1000 * 60 * 60 * 24) -
      1
  );
};
const getTimeNow = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear().toString();
  const fixedDate = `${day}/${month}/${year}`;
  const dateToday = {
    numberedDate: fixedDate,
    withMonthName: interpretNormalChristDate(today.toLocaleDateString('en-GB')),
  };
  const timeNow = today.toLocaleTimeString();
  return {
    date: `${dateToday.numberedDate} / ${dateToday.withMonthName}`,
    time: timeNow,
  };
};
const interpretHijriMonth = (month) => {
  switch (month) {
    case '1':
      return 'Muharram';
    case '2':
      return 'Safar';
    case '3':
      return 'Rabiul Awal';
    case '4':
      return 'Rabiul Akhir';
    case '5':
      return 'Jumadil Awal';
    case '6':
      return 'Jumadil Akhir';
    case '7':
      return 'Rajab';
    case '8':
      return 'Syaban';
    case '9':
      return 'Ramadhan';
    case '10':
      return 'Syawal';
    case '11':
      return 'Zulkaedah';
    case '12':
      return 'Zulhijjah';
    default:
      return 'Error';
  }
};
const interpretChristMonth = (month) => {
  switch (month) {
    case 'Jan':
      return 'Januari';
    case 'Feb':
      return 'Februari';
    case 'Mar':
      return 'Mac';
    case 'Apr':
      return 'April';
    case 'May':
      return 'Mei';
    case 'Jun':
      return 'Jun';
    case 'Jul':
      return 'Julai';
    case 'Aug':
      return 'Ogos';
    case 'Sep':
      return 'September';
    case 'Oct':
      return 'Oktober';
    case 'Nov':
      return 'November';
    case 'Dec':
      return 'Disember';
    default:
      return 'Error';
  }
};
const invertedInterpretChristMonth = (month) => {
  switch (month) {
    case 'Jan':
      return '1';
    case 'Feb':
      return '2';
    case 'Mar':
      return '3';
    case 'Apr':
      return '4';
    case 'May':
      return '5';
    case 'Jun':
      return '6';
    case 'Jul':
      return '7';
    case 'Aug':
      return '8';
    case 'Sep':
      return '9';
    case 'Oct':
      return '10';
    case 'Nov':
      return '11';
    case 'Dec':
      return '12';
    default:
      return 'Error';
  }
};
const interpretNumberedChristMonth = (month) => {
  switch (month) {
    case '01':
      return 'Januari';
    case '02':
      return 'Februari';
    case '03':
      return 'Mac';
    case '04':
      return 'April';
    case '05':
      return 'Mei';
    case '06':
      return 'Jun';
    case '07':
      return 'Julai';
    case '08':
      return 'Ogos';
    case '09':
      return 'September';
    case '10':
      return 'Oktober';
    case '11':
      return 'November';
    case '12':
      return 'Disember';
    default:
      return 'Error';
  }
};
const interpretDay = (day) => {
  switch (day) {
    case 'Sunday':
      return 'Ahad';
    case 'Monday':
      return 'Isnin';
    case 'Tuesday':
      return 'Selasa';
    case 'Wednesday':
      return 'Rabu';
    case 'Thursday':
      return 'Khamis';
    case 'Friday':
      return 'Jumaat';
    case 'Saturday':
      return 'Sabtu';
    default:
      return 'Error';
  }
};
const interpretHijriDate = (date) => {
  const [year, month, day] = date.split('-').map(Number);
  const hijriMonth = interpretHijriMonth(month.toString().padStart(2, '0'));
  return {
    withName: `${day}/${hijriMonth}/${year}`,
    withMonthCount: `${day}/${month}/${year}`,
  };
};
const interpretChristDate = (date) => {
  const [day, monthName, year] = date.split('-');
  const christMonth = interpretChristMonth(monthName);
  const numberedMonth = invertedInterpretChristMonth(monthName);
  const formattedDay = day.startsWith('0') ? day.substring(1) : day;
  return {
    withName: `${formattedDay}/${christMonth}/${year}`,
    withNumber: `${formattedDay}/${numberedMonth}/${year}`,
  };
};
const interpretNormalChristDate = (date) => {
  let day = date.substring(0, 2);
  let month = date.substring(3, 5);
  let year = date.substring(6, 11);
  let christMonth = interpretNumberedChristMonth(month);
  if (day.includes('0', 0) && !day.includes('0', 1)) {
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
  let timeDifference = {};

  if (timeNow >= fajrTime) {
    timeDifference.status = 'fajr has started';
  } else if (timeNow < fajrTime) {
    timeDifference.solatETA = {
      timeToFajr: fajrTime - timeNow,
    };
    timeDifference.status = 'time for tahajjud';
  }

  if (timeNow >= sunriseTime) {
    timeDifference.status = 'sunrise has started';
  } else if (timeNow < sunriseTime) {
    timeDifference.solatETA = {
      ...timeDifference.solatETA,
      timeToSunrise: sunriseTime - timeNow,
    };
  }

  if (timeNow >= dhuhrTime) {
    timeDifference.status = 'dhuhr has started';
  } else if (timeNow < dhuhrTime) {
    timeDifference.solatETA = {
      ...timeDifference.solatETA,
      timeToDhuhr: dhuhrTime - timeNow,
    };
  }

  if (timeNow >= asrTime) {
    timeDifference.status = 'asr has started';
  } else if (timeNow < asrTime) {
    timeDifference.solatETA = {
      ...timeDifference.solatETA,
      timeToAsr: asrTime - timeNow,
    };
  }

  if (timeNow >= maghribTime) {
    timeDifference.status = 'maghrib has started';
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
    timeDifference.status = 'isha has started';
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
    case 'fajr has started':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToSunrise)),
        name: 'isyraq',
      };
      break;
    case 'sunrise has started':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToDhuhr)),
        name: new Date().getDay() === 5 ? 'jumaat' : 'dhuhr',
      };
      break;
    case 'dhuhr has started':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToAsr)),
        name: 'asr',
      };
      break;
    case 'asr has started':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToMaghrib)),
        name: 'maghrib',
      };
      break;
    case 'maghrib has started':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToIsha)),
        name: 'isha',
      };
      break;
    case 'isha has started':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToTomorrowsFajrTime)),
        name: 'fajr',
      };
      break;
    case 'time for tahajjud':
      timeReminder.nextSolah = {
        ...(await convertMstoHours(solatETA.timeToFajr)),
        name: 'fajr',
      };
      break;
    default:
      timeReminder.status = 'is it judgment day?';
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
const timeCruncher = (period, zone) => {
  let timeArray = [];
  switch (period) {
    case 'today':
      let dayNumber = getDayNumberInYear();
      for (let j = 0; j < 2; j++) {
        let {
          date,
          hijri,
          day,
          imsak,
          fajr,
          syuruk,
          dhuhr,
          asr,
          maghrib,
          isha,
        } = zone.db[dayNumber];
        let fixedDate = interpretChristDate(date);
        let fixedHijri = interpretHijriDate(hijri);
        let fixedDay = interpretDay(day);
        timeArray = [
          ...timeArray,
          {
            day: `${fixedDay} / ${day}`,
            hijri: `${fixedHijri.withMonthCount} / ${fixedHijri.withName}`,
            date: `${fixedDate.withNumber} / ${fixedDate.withName}`,
            imsak,
            fajr,
            syuruk,
            dhuhr,
            asr,
            maghrib,
            isha,
          },
        ];
        dayNumber++;
      }
      return timeArray;
    case 'week':
      let weekStartDayNumber = getDayNumberInYear();
      for (let j = 0; j < 7; j++) {
        let {
          date,
          hijri,
          day,
          imsak,
          fajr,
          syuruk,
          dhuhr,
          asr,
          maghrib,
          isha,
        } = zone.db[weekStartDayNumber];
        let fixedDate = interpretChristDate(date);
        let fixedHijri = interpretHijriDate(hijri);
        let fixedDay = interpretDay(day);
        timeArray = [
          ...timeArray,
          {
            day: `${fixedDay} / ${day}`,
            hijri: `${fixedHijri.withMonthCount} / ${fixedHijri.withName}`,
            date: `${fixedDate.withNumber} / ${fixedDate.withName}`,
            imsak,
            fajr,
            syuruk,
            dhuhr,
            asr,
            maghrib,
            isha,
          },
        ];
        weekStartDayNumber++;
      }
      return timeArray;
    case 'month':
      let pastCount = getMonthName();
      let currentCount = pastCount + Months[new Date().getMonth()].count;
      for (let j = pastCount; j < currentCount; j++) {
        let {
          date,
          hijri,
          day,
          imsak,
          fajr,
          syuruk,
          dhuhr,
          asr,
          maghrib,
          isha,
        } = zone.db[j];
        let fixedDate = interpretChristDate(date);
        let fixedHijri = interpretHijriDate(hijri);
        let fixedDay = interpretDay(day);
        timeArray = [
          ...timeArray,
          {
            day: `${fixedDay} / ${day}`,
            hijri: `${fixedHijri.withMonthCount} / ${fixedHijri.withName}`,
            date: `${fixedDate.withNumber} / ${fixedDate.withName}`,
            imsak,
            fajr,
            syuruk,
            dhuhr,
            asr,
            maghrib,
            isha,
          },
        ];
      }
      return timeArray;
    case 'year':
      for (let j = 0; j < zone.db.length; j++) {
        let {
          date,
          hijri,
          day,
          imsak,
          fajr,
          syuruk,
          dhuhr,
          asr,
          maghrib,
          isha,
        } = zone.db[j];
        let fixedDate = interpretChristDate(date);
        let fixedHijri = interpretHijriDate(hijri);
        let fixedDay = interpretDay(day);
        timeArray = [
          ...timeArray,
          {
            day: `${fixedDay} / ${day}`,
            hijri: `${fixedHijri.withMonthCount} / ${fixedHijri.withName}`,
            date: `${fixedDate.withNumber} / ${fixedDate.withName}`,
            imsak,
            fajr,
            syuruk,
            dhuhr,
            asr,
            maghrib,
            isha,
          },
        ];
      }
      return timeArray;
    default:
      return 'error';
  }
};
class QuranHelpers {
  static getSurahNames = (req, res) => {
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
    const Quran = lang === 'en' ? Quranen : Quranmy;
    const data = Quran.find(({ id: surahId }) => surahId === parseInt(id));
    if (!data) {
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Surah not found.',
      });
    }
    res.status(200).json({ data });
  };

  static getAyatFromSurah = (req, res) => {
    const { lang, id, ayat } = req.params;
    const Quran = lang === 'en' ? Quranen : Quranmy;
    const surah = Quran.find(({ id: surahId }) => surahId === parseInt(id));
    if (!surah) {
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Surah not found.',
      });
    }
    const data = surah.verses.find(
      ({ id: ayatId }) => ayatId === parseInt(ayat)
    );
    if (!data) {
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Ayat not found.',
      });
    }
    res.status(200).json({ data });
  };

  static getRandomAyat = (req, res) => {
    const eng = Quranen;
    const mys = Quranmy;
    const numberOfSurahs = eng.length;
    const randomSurahIndex = Math.floor(Math.random() * numberOfSurahs);
    const { name, transliteration } = eng[randomSurahIndex];
    const { verses } = eng[randomSurahIndex];
    const randomAyatIndex = Math.floor(Math.random() * verses.length);
    const { id: ayatNumber, text: arabic } = verses[randomAyatIndex];
    const { translation: englishTranslation } = verses[randomAyatIndex];
    const { translation: malayTranslation } =
      mys[randomSurahIndex].verses[randomAyatIndex];
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
class HadithsHelpers {
  static HADITH_BOOKS = [
    'bukhari',
    'muslim',
    'abudaud',
    'nasai',
    'tirmizi',
    'ibnumajah',
  ];

  static getHadithBook(req, res) {
    return res
      .status(200)
      .json({ msg: HadithsHelpers.HADITH_BOOKS.join(', ') });
  }

  static getHadith(req, res) {
    const { book } = req.params;

    if (!HadithsHelpers.HADITH_BOOKS.includes(book)) {
      return res.status(404).json({ error: 'No Hadith found.' });
    }

    const bookData = eval(
      `${book.charAt(0).toUpperCase()}${book.slice(1)}Book`
    );
    const random = Math.floor(Math.random() * bookData.length);
    const hadis = bookData[random].hadis;

    return res.status(200).json({ hadis });
  }
}
class TimeHelpers {
  static async getTime(req, res) {
    try {
      const { period, zone } = req.params;
      const validPeriods = ['today', 'week', 'month', 'year'];
      const zones = Object.keys(Zones);

      if (!validPeriods.includes(period)) {
        return res.status(400).json({ message: 'Invalid period' });
      }

      if (!zones.includes(zone)) {
        return res.status(400).json({ message: 'Invalid zone' });
      }

      const currentZone = Zones[zone];
      const data = timeCruncher(period, currentZone);
      const todayData = getTimeNow();
      const today = timeCruncher('today', currentZone);
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
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

export {
  QuranHelpers,
  HadithsHelpers,
  TimeHelpers,
  timeCruncher,
  timeReminder,
  getTimeNow,
};
