// Elysia routes for waktusolat.me — replaces the Express Router.
import { Elysia } from "elysia";
import { insertVisitor, getVisitors, getVisitorStats } from "../middlewares/visitors.js";
import {
	QuranHelpers,
	HadithsHelpers,
	TimeHelpers,
} from "../controllers/helpers.js";
import {
	cacheBeforeHandle,
	cacheAfterHandle,
	getCacheStats,
	invalidateCache,
	localAuthBefore,
} from "../middlewares/cache.js";
import { adaptElysia } from "../utils/expressLike.js";

const wrap = (fn) => adaptElysia(fn);

// Routes that are response-cached (GET /quran*, GET /hadis).
// Only content with a deterministic value is cached. /hadis/:book is
// intentionally NOT cached here — it returns a RANDOM hadith, and caching
// it would serve the same hadith to everyone for the full TTL.
const cachedRoutes = new Elysia()
	.onBeforeHandle(cacheBeforeHandle)
	.onAfterHandle(cacheAfterHandle)
	.get("/quran", wrap(QuranHelpers.getSurahNames))
	.get("/quran/:lang/:id", wrap(QuranHelpers.getFullSurah))
	.get("/quran/:lang/:id/:ayat", wrap(QuranHelpers.getAyatFromSurah))
	.get("/quran/random", wrap(QuranHelpers.getRandomAyat))
	.get("/hadis", wrap(HadithsHelpers.getHadithBook));

// Dev-only raw visitor log, protected by localhost auth
const protectedRoutes = new Elysia()
	.onBeforeHandle(localAuthBefore)
	.get("/visitors", wrap(getVisitors));

export const apiRoutes = new Elysia({ prefix: "/api/v1" })
	// root usage text
	.get("/", wrap((_req, res) => {
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
	}))
	// record visitor
	.get("/thanks", wrap(insertVisitor))
	// raw visitors (dev only, localhost auth)
	.use(protectedRoutes)
	// aggregated, anonymized usage stats (safe for public display)
	.get("/visitors/stats", wrap(getVisitorStats))
	// cached surah routes
	.use(cachedRoutes)
	// hadith routes — NOTE: /hadis (book list) is served via cachedRoutes;
	// /hadis/:book is here and intentionally UNCACHED (it returns a random
	// hadith — caching it would serve everyone the same one for the TTL).
	.get("/hadis/:book", wrap(HadithsHelpers.getHadith))
	// prayer time routes
	.get("/waktusolat/:period/:zone", wrap(TimeHelpers.getTime))
	// cache management
	.get("/cache", () => getCacheStats())
	.get("/cache/invalidate", () => invalidateCache());

export default apiRoutes;