// calling all things
import { Router } from "express";
import { insertVisitor, getVisitors } from "../middlewares/visitors.js";
import {
	QuranHelpers,
	HadithsHelpers,
	TimeHelpers,
} from "../controllers/helpers.js";
import { cacheService } from "../middlewares/cache.js";
import localAuth from "../middlewares/localAuth.js";

const router = Router();

// init routes
router.get("/", (_req, res) => {
	res.write("waktusolat.me API for everything.\nReach us c4lyp5o @ github\n\n");
	res.write(
		"Usage:\n\n/quran : lists all surah\n/quran/(language)/(surah number) : Get surah with specific language\n",
	);
	res.write(
		"/quran/(language)/(surah number)/(verse number) : Get specific verse of surah with specific language\n",
	);
	res.write("/quran/random : Get random verse of surah with both language\n");
	res.write("\nAvailable languages:\nmy : malay\nen : english\n");
	res.write("\n/hadis/(book) : Get random hadith from specific book\n");
	res.write("\nAvailable books:\nriwayat : riwayat\n");
	res.write(
		"\n/waktusolat/(period)/(location) : Get prayer times for specific location\n",
	);
	res.write("\nAvailable periods:\ntoday\nweek\nmonth\nyear\n");
	res.write("\nAvailable locations: \nPlease refer to github page.\n");
	res.status(200).end();
});

// record visitor
router.get("/thanks", insertVisitor);

// see visitors
router.get("/visitors", getVisitors);

// surah routes
router.get("/quran", cacheService, QuranHelpers.getSurahNames);
router.get("/quran/:lang/:id", cacheService, QuranHelpers.getFullSurah);
router.get(
	"/quran/:lang/:id/:ayat",
	cacheService,
	QuranHelpers.getAyatFromSurah,
);
router.get("/quran/random", QuranHelpers.getRandomAyat);

// hadith routes
router.get("/hadis", HadithsHelpers.getHadithBook);
router.get("/hadis/:book", HadithsHelpers.getHadith);

// times routes
router.get("/waktusolat/:period/:zone", TimeHelpers.getTime);

// healthcheck
router.get("/healthcheck", localAuth, (_req, res) => {
	res.status(200).json({ msg: "ok" });
});

export default router;
