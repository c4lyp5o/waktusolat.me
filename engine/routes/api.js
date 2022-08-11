// calling all things
import { Router } from 'express';
const router = Router();
import { QuranHelpers, TimeHelpers } from '../controllers/helpers.js';
import { cacheService } from '../middlewares/cache.js';

// init routes
router.get('/', (req, res) => {
  res.write('waktusolat.me API for everything.\nReach us c4lyp5o @ github\n\n');
  res.write(
    'Usage:\n\n/quran : lists all surah\n/quran/(language)/(surah number) : Get surah with specific language\n'
  );
  res.write(
    '/quran/(language)/(surah number)/(verse number) : Get specific verse of surah with specific language\n'
  );
  res.write('/quran/random : Get random verse of surah with both language\n');
  res.write('\nAvailable languages:\nmy : malay\nen : english\n');
  res.write(
    '\n/waktusolat/(period)/(location) : Get prayer times for specific location\n'
  );
  res.write('\nAvailable periods:\ntoday\nweek\nmonth\nyear\n');
  res.write('\nAvailable locations: \nPlease refer to github page.\n');
  res.status(200).end();
});

// surah routes
router.get('/quran', cacheService, QuranHelpers.getSurahName);
router.get('/quran/:lang/:id', cacheService, QuranHelpers.getFullSurah);
router.get(
  '/quran/:lang/:id/:ayat',
  cacheService,
  QuranHelpers.getAyatfromSurah
);
router.get('/quran/random', QuranHelpers.getRandomAyat);

// times routes
router.get('/waktusolat/:period/:zone', TimeHelpers.getTime);

// fallback router
router.all('*', (req, res) =>
  res.status(404).send({
    code: 404,
    status: 'Not Found.',
    message: `Resource "${req.url}" is not found.`,
  })
);

export default router;
