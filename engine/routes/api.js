// calling all things
import { Router } from "express";
const router = Router();
import { Helpers, TimeHelpers } from "../controllers/helpers.js";
import { cacheService } from "../middlewares/cache.js";

// init routes
router.get("/", (req, res) => {
  res.write("waktusolat.me API for everything.\nReach us c4lyp5o @ github");
  res.end();
});

// surah routes
router.get("/surah", cacheService, Helpers.getSurahName);
router.get("/surah/:lang/:id", cacheService, Helpers.getFullSurah);
router.get("/surah/:lang/:id/:ayat", cacheService, Helpers.getAyatfromSurah);

// times routes
router.get("/waktusolat/week/:zone", cacheService, TimeHelpers.getTimeAWeek);
// router.get("/waktusolat/:zone/:year", cacheService, TimeHelpers.getTimeAYear);
router.get("/waktusolat/year/:zone", cacheService, TimeHelpers.getTimeAMonth);

export default router;
