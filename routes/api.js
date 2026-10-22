// Elysia routes for waktusolat.me — replaces the Express Router.
import { Elysia } from "elysia";
import { HadithsHelpers, QuranHelpers, TimeHelpers } from "../controllers/helpers.js";
import { apiKeyAuth } from "../middlewares/auth.js";
import {
	cacheAfterHandle,
	cacheBeforeHandle,
	getCacheStats,
	invalidateCache,
} from "../middlewares/cache.js";
import { getVisitorStats, getVisitors, insertVisitor } from "../middlewares/visitors.js";
import { adaptElysia } from "../utils/expressLike.js";

const wrap = (fn) => adaptElysia(fn);

// Routes that are response-cached (GET /quran*, GET /hadis).
// Only content with a deterministic value is cached. /quran/random and
// /hadis/:book are intentionally NOT cached here — they return a RANDOM
// item, and caching would serve everyone the same one for the full TTL.
const cachedRoutes = new Elysia()
	.onBeforeHandle(cacheBeforeHandle)
	.onAfterHandle(cacheAfterHandle)
	.get("/quran", wrap(QuranHelpers.getSurahNames))
	.get("/quran/:lang/:id", wrap(QuranHelpers.getFullSurah))
	.get("/quran/:lang/:id/:ayat", wrap(QuranHelpers.getAyatFromSurah))
	.get("/hadis", wrap(HadithsHelpers.getHadithBook));

// Admin-only routes: require `x-api-key: <ADMIN_API_KEY>` (see auth.js).
const adminRoutes = new Elysia()
	.onBeforeHandle(apiKeyAuth)
	.get("/visitors", wrap(getVisitors))
	.post("/cache/invalidate", () => invalidateCache());

export const apiRoutes = new Elysia({ prefix: "/api/v1" })
	// root usage text
	.get(
		"/",
		wrap((_req, res) => {
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
			res.write("\n/waktusolat/(period)/(location) : Get prayer times for specific location\n");
			res.write("\nAvailable periods:\ntoday\nweek\nmonth\nyear\n");
			res.write("\nAvailable locations: \nPlease refer to github page.\n");
			res.status(200).end();
		}),
	)
	// record visitor
	.get("/thanks", wrap(insertVisitor))
	// raw visitor log + cache invalidation (x-api-key)
	.use(adminRoutes)
	// aggregated, anonymized usage stats (safe for public display)
	.get("/visitors/stats", wrap(getVisitorStats))
	// cached surah routes
	.use(cachedRoutes)
	// random verse — uncached (see cachedRoutes note)
	.get("/quran/random", wrap(QuranHelpers.getRandomAyat))
	// hadith routes — NOTE: /hadis (book list) is served via cachedRoutes;
	// /hadis/:book is here and intentionally UNCACHED (it returns a random
	// hadith — caching it would serve everyone the same one for the TTL).
	.get("/hadis/:book", wrap(HadithsHelpers.getHadith))
	// prayer time routes
	.get("/waktusolat/:period/:zone", wrap(TimeHelpers.getTime))
	// cache stats (invalidation is admin-only, above)
	.get("/cache", () => getCacheStats())
	// real healthcheck for the Docker HEALTHCHECK (JSON, not the SPA shell)
	.get("/healthcheck", () => ({ ok: true }));

export default apiRoutes;
