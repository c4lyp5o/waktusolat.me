import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { holyQuran: quranmy } = require("../data/quran/quran_id.json");
const { holyQuran: quranen } = require("../data/quran/quran_en.json");
const { prayerTime: kdh01 } = require("../data/times/kdh01.json");
import { Zones, Months } from "./monthlib.js";

class Helpers {
  static getSurahName(req, res) {
    const data = quranmy.map((item) => {
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
    const Quran = req.params.lang == "en" ? quranen : quranmy;
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
    const Quran = req.params.lang == "en" ? quranen : quranmy;
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
    let timeArray = [];
    for (let i = Months.March; i < Months.April; i++) {
      timeArray = [...timeArray, kdh01[i]];
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
      data: timeArray,
    });
  }
}

export { Helpers, TimeHelpers };
