// calling all things
import { Router } from "express";
const router = Router();
import { QuranHelpers, TimeHelpers } from "../controllers/helpers.js";
import { cacheService } from "../middlewares/cache.js";

// init routes
router.get("/", (req, res) => {
  res.write("waktusolat.me API for everything.\nReach us c4lyp5o @ github");
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
router.get("/waktusolat/week/:zone", cacheService, TimeHelpers.getTimeAWeek);
router.get("/waktusolat/month/:zone", cacheService, TimeHelpers.getTimeAMonth);
router.get("/waktusolat/year/:zone", cacheService, TimeHelpers.getTimeAYear);

export default router;
