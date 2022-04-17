import { Zones, Months, Quranen, Quranmy } from "./library.js";

class QuranHelpers {
  static getSurahName(req, res) {
    const data = Quranen.map((item) => {
      const surah = { ...item };
      return surah.transliteration;
    });
    return res.status(200).json({
      code: 200,
      status: "Mantap.",
      message: "Berhasil.",
      data,
    });
  }

  static getFullSurah(req, res) {
    const Quran = req.params.lang == "en" ? Quranen : Quranmy;
    const data = Quran.find((item) => item.id === parseInt(req.params.id));
    if (!data) {
      return res.status(404).json({
        code: 404,
        status: "Not Found.",
        message: "Surah not found.",
      });
    }
    const surah = { ...data };
    return res.status(200).json({
      code: 200,
      status: "Mantap.",
      message: "Berhasil.",
      data: surah,
    });
  }

  static getAyatfromSurah(req, res) {
    const Quran = req.params.lang == "en" ? Quranen : Quranmy;
    const data = Quran.find((item) => item.id === parseInt(req.params.id));
    if (!data) {
      return res.status(404).json({
        code: 404,
        status: "Not Found.",
        message: "Surah not found.",
      });
    }
    const ayat = data.verses.find(
      (item) => item.id === parseInt(req.params.ayat)
    );
    if (!ayat) {
      return res.status(404).json({
        code: 404,
        status: "Not Found.",
        message: "Ayat not found.",
      });
    }
    return res.status(200).json({
      code: 200,
      status: "Mantap.",
      message: "Berhasil.",
      data: ayat,
    });
  }
}

class TimeHelpers {
  static getTimeAWeek(req, res) {
    const zone = Zones[req.params.zone];
    function getDayOfYear() {
      return Math.floor(
        (new Date() - new Date(new Date().getFullYear(), 0, 0)) /
          (1000 * 60 * 60 * 24) -
          1
      );
    }
    let timeArray = [];
    var numberDay = getDayOfYear();
    for (let i = 0; i < 7; i++) {
      timeArray = [...timeArray, zone.db[numberDay]];
      numberDay++;
    }
    if (!timeArray) {
      return res.status(404).json({
        code: 404,
        status: "Not Found.",
        message: "Time not found.",
      });
    }
    return res.status(200).json({
      code: 200,
      status: "Mantap.",
      message: "Berhasil.",
      zone: zone.name,
      data: timeArray,
    });
  }

  static getTimeAMonth(req, res) {
    function getMonthName() {
      let numberOfDays = 0;
      const date = new Date().getMonth();
      for (let i = 0; i < date; i++) {
        numberOfDays += Months[i].count;
      }
      return numberOfDays;
    }
    const zone = Zones[req.params.zone];
    let timeArray = [];
    var pastCount = getMonthName();
    var currentCount = pastCount + Months[new Date().getMonth()].count;
    console.log(pastCount, currentCount);
    for (let i = pastCount; i < currentCount; i++) {
      timeArray = [...timeArray, zone.db[i]];
    }
    if (!timeArray) {
      return res.status(404).json({
        code: 404,
        status: "Not Found.",
        message: "Time not found.",
      });
    }
    return res.status(200).json({
      code: 200,
      status: "Mantap.",
      message: "Berhasil.",
      zone: zone.name,
      data: timeArray,
    });
  }

  static getTimeAYear(req, res) {
    const zone = Zones[req.params.zone];
    let timeArray = [];
    for (let i = 0; i < zone.db.length; i++) {
      timeArray = [...timeArray, zone.db[i]];
    }
    if (!timeArray) {
      return res.status(404).json({
        code: 404,
        status: "Not Found.",
        message: "Time not found.",
      });
    }
    return res.status(200).json({
      code: 200,
      status: "Mantap.",
      message: "Berhasil.",
      zone: zone.name,
      timeArray,
    });
  }
}

export { QuranHelpers, TimeHelpers };
