import { Zones, Quranen, Quranmy } from '../../controllers/library.js';
import {
  timeCruncher,
  timeReminder,
  getTimeNow,
} from '../../controllers/helpers.js';

const WSAPIresolvers = {
  hello: () => {
    return 'Hello world!';
  },
  waktuSolat: async (args) => {
    const currentZone = Zones[args.zone];
    const data = timeCruncher(args.period, currentZone);
    const today = timeCruncher('today', currentZone);
    const todayData = getTimeNow();
    const timeDifference = await timeReminder(today);
    let combinedData = {
      day: today[0].day,
      hijri: today[0].hijri,
      ...todayData,
    };
    return {
      today: combinedData,
      nextSolat: timeDifference.nextSolah,
      negeri: currentZone.negeri,
      zone: currentZone.name,
      queriedTimes: data,
    };
  },
  getSurahNames: () => {
    const data = Quranen.map((item) => {
      const surah = { ...item };
      return {
        number: surah.id,
        name: surah.name,
        transliteration: surah.transliteration,
        translation: surah.translation,
      };
    });
    return data;
  },
  getOneSurah: (args) => {
    const data = Quranen.find((item) => item.id === args.id);
    return data;
  },
  getOneAyat: (args) => {
    let ayat = {};
    const dataEN = Quranen.find((item) => item.id === args.id);
    const dataMY = Quranmy.find((item) => item.id === args.id);
    const ayatEN = dataEN.verses.find((item) => item.id === args.ayat);
    const ayatMY = dataMY.verses.find((item) => item.id === args.ayat);
    ayat = {
      ...ayat,
      id: ayatEN.id,
      text: ayatEN.text,
      english: ayatEN.translation,
      malay: ayatMY.translation,
    };
    return ayat;
  },
  randomAyatOfQuran: () => {
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
    return data;
  },
};

export { WSAPIresolvers };
