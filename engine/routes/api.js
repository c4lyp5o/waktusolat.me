// calling all things
import { Router } from "express";
const router = Router();
import { QuranHelpers, TimeHelpers } from "../controllers/helpers.js";
import { cacheService } from "../middlewares/cache.js";

// init routes
router.get("/", (req, res) => {
  res.write("waktusolat.me API for everything.\nReach us c4lyp5o @ github\n\n");
  res.write("Usage:\n/surah : lists all surah\n/surah/(language)/(surah number) : Get surah with specific language\n");
  res.write("/surah/(language)/(surah number)/(verse number) : Get specific verse of surah with specific language\n");
  res.write("Available languages:\nmy : malay\nen : english\n");
  res.write("\n\nwaktusolat/(period)/(location) : Get prayer times for specific location\n");
  res.write("Available periods:\nweek\nmonth\nyear\n");
  res.write("Available locations: Please refer to github page.\n");
  res.end();
});

// surah routes
router.get("/surah", cacheService, QuranHelpers.getSurahName);
router.get("/surah/:lang/:id", cacheService, QuranHelpers.getFullSurah);
router.get(
  "/surah/:lang/:id/:ayat",
  cacheService,
  QuranHelpers.getAyatfromSurah
);

// times routes
router.get("/waktusolat/week/:zone", TimeHelpers.getTimeAWeek);
router.get("/waktusolat/month/:zone", TimeHelpers.getTimeAMonth);
router.get("/waktusolat/year/:zone", TimeHelpers.getTimeAYear);

export default router;
