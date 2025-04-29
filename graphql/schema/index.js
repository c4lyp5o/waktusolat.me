import { buildSchema } from 'graphql';

const WSAPIschema = buildSchema(`
    type Query {
        hello: String
        waktuSolat(period: String, zone: String): dataWaktuSolat
        getSurahNames: [surahNames]
        getOneSurah(id: Int): surah
        getOneAyat(id: Int, ayat: Int): ayat
        randomAyatOfQuran: ayatFromQuran
    }
    type surahNames {
        number: Int
        name: String
        transliteration: String
        translation: String
    }
    type surah {
        id: Int
        name: String
        transliteration: String
        translation: String
        verses: [ayat]
    }
    type ayat {
        id: Int
        text: String
        translation: String
        english: String
        malay: String
    }
    type ayatFromQuran {
        fromSurah: String
        ayatNumber: Int
        arabic: String
        englishTranslation: String
        malayTranslation: String
    }
    type today {
        day: String
        hijri: String
        date: String
        time: String
    }
    type nextSolat {
        name: String
        hours: String
        minutes: String
        seconds: String
        milliseconds: String
    }
    type waktuSolatArray {
        day: String
        hijri: String
        date: String
        imsak: String
        fajr: String
        syuruk: String
        dhuhr: String
        asr: String
        maghrib: String
        isha: String
    }
    type dataWaktuSolat {
        today: today
        nextSolat: nextSolat
        negeri: String
        zone: String
        queriedTimes: [waktuSolatArray]
    }
`);

export { WSAPIschema };

// Language: javascript
// Path: engine/graphql/resolvers/index.js
