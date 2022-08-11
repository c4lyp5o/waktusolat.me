import { Zones, Months, Quranen, Quranmy } from './library.js';

class QuranHelpers {
  static getSurahName(req, res) {
    const data = Quranen.map((item) => {
      const surah = { ...item };
      return {
        number: surah.id,
        name: surah.name,
        transliteration: surah.transliteration,
        translation: surah.translation,
      };
    });
    return res.status(200).json({
      data,
    });
  }

  static getFullSurah(req, res) {
    const { lang, id } = req.params;
    if (lang !== 'en' && lang !== 'my') {
      return res.status(400).json({
        code: 400,
        status: 'Bad Request.',
        message: 'Invalid language.',
      });
    }
    const Quran = lang == 'en' ? Quranen : Quranmy;
    const data = Quran.find((item) => item.id === parseInt(id));
    if (!data) {
      console.log('fullsurah');
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Surah not found.',
      });
    }
    const surah = { ...data };
    return res.status(200).json({
      data: surah,
    });
  }

  static getAyatfromSurah(req, res) {
    const { lang, id, ayat } = req.params;
    if (lang !== 'en' && lang !== 'my') {
      return res.status(400).json({
        code: 400,
        status: 'Bad Request.',
        message: 'Invalid language.',
      });
    }
    const Quran = lang == 'en' ? Quranen : Quranmy;
    const surah = Quran.find((item) => item.id === parseInt(id));
    if (!surah) {
      console.log('ayatfromsurah');
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Surah not found.',
      });
    }
    const data = surah.verses.find((item) => item.id === parseInt(ayat));
    if (!data) {
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Ayat not found.',
      });
    }
    return res.status(200).json({
      data,
    });
  }

  static getRandomAyat(req, res) {
    let data = {};
    const eng = Quranen;
    const mys = Quranmy;
    const numberOfSurah = eng.length;
    const randomSurah = Math.floor(Math.random() * numberOfSurah);
    data = {
      ...data,
      fromSurah:
        eng[randomSurah].name + ' / ' + eng[randomSurah].transliteration,
    };
    const randomSurahAyats = eng[randomSurah].verses.length;
    const randomAyat = Math.floor(Math.random() * randomSurahAyats);
    const engdata = eng[randomSurah].verses[randomAyat];
    const mysdata = mys[randomSurah].verses[randomAyat];
    data = {
      ...data,
      ayatNumber: engdata.id,
      arabic: engdata.text,
      englishTranslation: engdata.translation,
      malayTranslation: mysdata.translation,
    };
    if (!engdata && !mysdata) {
      return res.status(404).json({
        code: 404,
        status: 'Not Found.',
        message: 'Surah not found.',
      });
    }
    return res.status(200).json({ data });
  }
}
class TimeHelpers {
  static getTime(req, res) {
    // functions
    const getDateFromHours = (time) => {
      time = time.split(':');
      let now = new Date();
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        ...time
      );
    };
    const getDateFromHoursAndAdd1Day = async (time) => {
      time = time.split(':');
      let tomorrow = new Date(Date.now() + 3600 * 1000 * 24);
      return new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        ...time
      );
    };
    const getMonthName = () => {
      let numberOfDays = 0;
      const date = new Date().getMonth();
      for (let i = 0; i < date; i++) {
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
      const stringDate = today.toLocaleDateString('en-GB');
      var day = stringDate.substring(0, 2);
      var month = stringDate.substring(3, 5);
      if (month.includes('0', 0)) {
        month = month.substring(1, 2);
      }
      var year = stringDate.substring(6, 11);
      var fixedDate = day + '/' + month + '/' + year;
      const dateToday = {
        numberedDate: fixedDate,
        withMonthName: intepretNormalChristDate(
          today.toLocaleDateString('en-GB')
        ),
      };
      const timeNow = today.toLocaleTimeString();
      return {
        date: dateToday.numberedDate + ' / ' + dateToday.withMonthName,
        time: timeNow,
      };
    };
    const intepretHijriMonth = (month) => {
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
    const intepretChristMonth = (month) => {
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
    const invertedIntepretChristMonth = (month) => {
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
    const intepretNumberedChristMonth = (month) => {
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
    const intepretDay = (day) => {
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
    const intepretHijriDate = (date) => {
      var day = date.substring(8, 10);
      var month = date.substring(5, 7);
      if (month.includes('0', 0)) {
        month = month.substring(1, 2);
      }
      var year = date.substring(0, 4);
      var hijriMonth = intepretHijriMonth(month);
      if (day.includes('0', 0) && !day.includes('0', 1)) {
        day = day.slice(1, 2);
      }
      return {
        withName: `${day}/${hijriMonth}/${year}`,
        withMonthCount: `${day}/${month}/${year}`,
      };
    };
    const intepretChristDate = (date) => {
      var day = date.substring(0, 2);
      var month = date.substring(3, 6);
      var year = date.substring(7, 11);
      var christMonth = intepretChristMonth(month);
      var numberedMonth = invertedIntepretChristMonth(month);
      if (day.includes('0', 0) && !day.includes('0', 1)) {
        day = day.slice(1, 2);
      }
      return {
        withName: `${day}/${christMonth}/${year}`,
        withNumber: `${day}/${numberedMonth}/${year}`,
      };
    };
    const intepretNormalChristDate = (date) => {
      var day = date.substring(0, 2);
      var month = date.substring(3, 5);
      var year = date.substring(6, 11);
      var christMonth = intepretNumberedChristMonth(month);
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
      timeDifference.timeNow = timeNow.toLocaleTimeString();
      if (timeNow >= fajrTime) {
        timeDifference.status = 'fajr has started';
      } else {
        timeDifference.fajr = fajrTime - timeNow;
      }
      if (timeNow >= sunriseTime) {
        timeDifference.status = 'sunrise has started';
      } else {
        timeDifference.sunrise = sunriseTime - timeNow;
      }
      if (timeNow >= dhuhrTime) {
        timeDifference.status = 'dhuhr has started';
      } else {
        timeDifference.dhuhr = dhuhrTime - timeNow;
      }
      if (timeNow >= asrTime) {
        timeDifference.status = 'asr has started';
      } else {
        timeDifference.asr = asrTime - timeNow;
      }
      if (timeNow >= maghribTime) {
        timeDifference.status = 'maghrib has started';
      } else {
        timeDifference.maghrib = maghribTime - timeNow;
      }
      if (timeNow >= ishaTime) {
        timeDifference.status = 'isha has started';
        if (fajrTime - timeNow > 0) {
          timeDifference.fajr = fajrTime - timeNow;
        } else {
          timeDifference.tomorrowsFajrTime = tomorrowsFajrTime - timeNow;
        }
      } else {
        timeDifference.status = 'time for tahajjud';
      }
      timeDifference = {
        timeNowStandardForm: timeNow,
        fajrTimeStandardForm: fajrTime,
        ...timeDifference,
      };
      console.log(timeDifference);
      return timeDifference;
    };
    const timeReminder = async (times) => {
      const timeDifference = await getTimeDifference(times);
      const timeReminder = {};
      switch (timeDifference.status) {
        case 'fajr has started':
          timeReminder.nextSolah = await convertMstoHours(
            timeDifference.sunrise
          );
          timeReminder.nextSolah = { ...timeReminder.nextSolah, name: 'dhuhr' };
          break;
        case 'dhuhr has started':
          timeReminder.nextSolah = await convertMstoHours(timeDifference.asr);
          timeReminder.nextSolah = { ...timeReminder.nextSolah, name: 'asr' };
          break;
        case 'asr has started':
          timeReminder.nextSolah = await convertMstoHours(
            timeDifference.maghrib
          );
          timeReminder.nextSolah = {
            ...timeReminder.nextSolah,
            name: 'maghrib',
          };
          break;
        case 'maghrib has started':
          timeReminder.nextSolah = await convertMstoHours(timeDifference.isha);
          timeReminder.nextSolah = { ...timeReminder.nextSolah, name: 'isha' };
          break;
        case 'isha has started':
          if (
            timeDifference.fajrTimeStandardForm -
              timeDifference.timeNowStandardForm >
            0
          ) {
            timeReminder.nextSolah = await convertMstoHours(
              timeDifference.fajr
            );
            timeReminder.nextSolah = {
              ...timeReminder.nextSolah,
              name: 'fajr',
            };
          } else {
            timeReminder.nextSolah = await convertMstoHours(
              timeDifference.tomorrowsFajrTime
            );
            timeReminder.nextSolah = {
              ...timeReminder.nextSolah,
              name: 'fajr',
            };
          }
          break;
        case 'time for tahajjud':
          timeReminder.nextSolah = await convertMstoHours(timeDifference.fajr);
          timeReminder.nextSolah = { ...timeReminder.nextSolah, name: 'fajr' };
          break;
        default:
          timeReminder.status = 'is it judgment day?';
          break;
      }
      console.log(timeReminder);
      return timeReminder;
    };
    const convertMstoHours = async (milliseconds) => {
      let seconds = Math.floor(milliseconds / 1000);
      let minutes = Math.floor(seconds / 60);
      let hours = Math.floor(minutes / 60);
      seconds = seconds % 60;
      minutes = minutes % 60;
      hours = hours % 24;
      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: milliseconds,
      };
    };
    const timeCruncher = (period, zone) => {
      let timeArray = [];
      switch (period) {
        case 'today':
          var dayNumber = getDayNumberInYear();
          for (let j = 0; j < 2; j++) {
            let fixedDate = intepretChristDate(zone.db[dayNumber].date);
            let fixedHijri = intepretHijriDate(zone.db[dayNumber].hijri);
            let fixedDay = intepretDay(zone.db[dayNumber].day);
            timeArray = [
              ...timeArray,
              {
                day: fixedDay + ' / ' + zone.db[dayNumber].day,
                date: fixedDate.withNumber + ' / ' + fixedDate.withName,
                hijri: fixedHijri.withMonthCount + ' / ' + fixedHijri.withName,
                fajr: zone.db[dayNumber].fajr,
                syuruk: zone.db[dayNumber].syuruk,
                dhuhr: zone.db[dayNumber].dhuhr,
                asr: zone.db[dayNumber].asr,
                maghrib: zone.db[dayNumber].maghrib,
                isha: zone.db[dayNumber].isha,
              },
            ];
            dayNumber++;
          }
          return timeArray;
        case 'week':
          var dayNumber = getDayNumberInYear();
          for (let j = 0; j < 7; j++) {
            let fixedDate = intepretChristDate(zone.db[dayNumber].date);
            let fixedHijri = intepretHijriDate(zone.db[dayNumber].hijri);
            let fixedDay = intepretDay(zone.db[dayNumber].day);
            timeArray = [
              ...timeArray,
              {
                day: fixedDay + ' / ' + zone.db[dayNumber].day,
                date: fixedDate.withNumber + ' / ' + fixedDate.withName,
                hijri: fixedHijri.withMonthCount + ' / ' + fixedHijri.withName,
                fajr: zone.db[dayNumber].fajr,
                syuruk: zone.db[dayNumber].syuruk,
                dhuhr: zone.db[dayNumber].dhuhr,
                asr: zone.db[dayNumber].asr,
                maghrib: zone.db[dayNumber].maghrib,
                isha: zone.db[dayNumber].isha,
              },
            ];
            dayNumber++;
          }
          return timeArray;
        case 'month':
          console.log('came here');
          var pastCount = getMonthName();
          var currentCount = pastCount + Months[new Date().getMonth()].count;
          for (let j = pastCount; j < currentCount; j++) {
            let fixedDate = intepretChristDate(zone.db[j].date);
            let fixedHijri = intepretHijriDate(zone.db[j].hijri);
            let fixedDay = intepretDay(zone.db[j].day);
            timeArray = [
              ...timeArray,
              {
                day: fixedDay + ' / ' + zone.db[j].day,
                date: fixedDate.withNumber + ' / ' + fixedDate.withName,
                hijri: fixedHijri.withMonthCount + ' / ' + fixedHijri.withName,
                fajr: zone.db[j].fajr,
                syuruk: zone.db[j].syuruk,
                dhuhr: zone.db[j].dhuhr,
                asr: zone.db[j].asr,
                maghrib: zone.db[j].maghrib,
                isha: zone.db[j].isha,
              },
            ];
          }
          return timeArray;
        case 'year':
          for (let j = 0; j < zone.db.length; j++) {
            let fixedDate = intepretChristDate(zone.db[j].date);
            let fixedHijri = intepretHijriDate(zone.db[j].hijri);
            let fixedDay = intepretDay(zone.db[j].day);
            timeArray = [
              ...timeArray,
              {
                day: fixedDay + ' / ' + zone.db[j].day,
                date: fixedDate.withNumber + ' / ' + fixedDate.withName,
                hijri: fixedHijri.withMonthCount + ' / ' + fixedHijri.withName,
                fajr: zone.db[j].fajr,
                syuruk: zone.db[j].syuruk,
                dhuhr: zone.db[j].dhuhr,
                asr: zone.db[j].asr,
                maghrib: zone.db[j].maghrib,
                isha: zone.db[j].isha,
              },
            ];
          }
          return timeArray;
        default:
          return 'error';
      }
    };
    // get zones and period
    const { period, zone } = req.params;
    // check if period is valid
    if (
      period === 'today' ||
      period === 'week' ||
      period === 'month' ||
      period === 'year'
    ) {
      // check if zone is valid
      if (Zones[zone]) {
        // get zone
        const currentZone = Zones[zone];
        // get time
        const data = timeCruncher(period, currentZone);
        // get time difference
        const today = timeCruncher('today', currentZone);
        // get today's info
        const todayData = getTimeNow();
        // pack em
        let combinedData = {
          day: today[0].day,
          hijri: today[0].hijri,
          ...todayData,
        };
        timeReminder(today).then((timeDifference) => {
          res.status(200).json({
            today: combinedData,
            nextSolat: timeDifference.nextSolah,
            negeri: currentZone.negeri,
            zone: currentZone.name,
            data,
          });
        });
      } else {
        res.status(400).json({
          message: 'Invalid zone',
        });
      }
    } else {
      res.status(400).json({
        message: 'Invalid period',
      });
    }
  }
}

export { QuranHelpers, TimeHelpers };
