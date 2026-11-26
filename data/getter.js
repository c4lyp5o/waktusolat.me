// getter.js — pull one year of prayer times for every zone from JAKIM
// e-Solat and write data/times/<zone>.json. Run manually via
// `bun run get-times`. At runtime, missing/stale zones are filled in the
// background by utils/timesRefresh.js, so server start never waits on JAKIM.
//
// Fetch, validation (NO_RECORD / not-yet-published year) and the atomic
// write are shared with the runtime refresher via refreshZone.
import { ZONE_IDS } from "../controllers/zones.js";
import logger from "../utils/logger.js";
import { refreshZone } from "../utils/timesRefresh.js";

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

let failed = 0;
for (const zone of ZONE_IDS) {
	if (!(await refreshZone(zone))) failed += 1;
	await sleep(500);
}
logger.info(`[timesGetter] done: ${ZONE_IDS.length - failed}/${ZONE_IDS.length} zones written`);
