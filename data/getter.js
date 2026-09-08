// getter.js — pull one year of prayer times per zone from JAKIM e-Solat
// (via cpay) and write data/times/<zone>.json. Run manually via
// `bun run get-times`, or automatically as npm `prestart`.
//
// Zones that JAKIM has no record for (KTN03 as of 2026-09) are skipped with
// a warning instead of writing an error payload into the data file.
import Cpray from "cpray";
import fs from "node:fs/promises";
import { join } from "node:path";

import logger from "../utils/logger.js";

const cpray = new Cpray();

// data/times/ is gitignored (generated at container start), so it does not
// exist on a fresh checkout/image — create it before the first write.
const timesDir = join(process.cwd(), "data", "times");
await fs.mkdir(timesDir, { recursive: true });

const zones = [
	"kdh01",
	"kdh02",
	"kdh03",
	"kdh04",
	"kdh05",
	"kdh06",
	"kdh07",
	"mlk01",
	"ngs01",
	"ngs02",
	"phg01",
	"phg02",
	"phg03",
	"phg04",
	"phg05",
	"phg06",
	"prk01",
	"prk02",
	"prk03",
	"prk04",
	"prk05",
	"prk06",
	"prk07",
	"pls01",
	"png01",
	"sgr01",
	"sgr02",
	"sgr03",
	"trg01",
	"trg02",
	"trg03",
	"trg04",
	"jhr01",
	"jhr02",
	"jhr03",
	"jhr04",
	"ktn01",
	"sbh01",
	"sbh02",
	"sbh03",
	"sbh04",
	"sbh05",
	"sbh06",
	"sbh07",
	"sbh08",
	"sbh09",
	"swk01",
	"swk02",
	"swk03",
	"swk04",
	"swk05",
	"swk06",
	"swk07",
	"swk08",
	"swk09",
	"wly01",
	"wly02",
];

// e-Solat returns HTTP 200 with status "NO_RECORD!" when it has no data for
// a zone. Writing that payload as if it were real data is how sbh01..sbh09
// and ktn03 went stale — reject it here.
function validYearPayload(payload) {
	return Array.isArray(payload?.prayerTime) && payload.prayerTime.length > 100;
}

async function getTimesAndWrite(zone) {
	logger.info(`[timesGetter] Getting times for ${zone}`);
	const times = await cpray.getTimesbyYear(zone);
	if (!validYearPayload(times)) {
		logger.warn(
			`[timesGetter] ${zone}: JAKIM returned no usable data (status=${times?.status}), keeping existing file`,
		);
		return;
	}
	await fs.writeFile(join(timesDir, `${zone}.json`), JSON.stringify(times), "utf8");
	logger.info(`[timesGetter] ${zone}: wrote ${times.prayerTime.length} rows`);
}

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function getTimes() {
	for (const zone of zones) {
		await getTimesAndWrite(zone);
		await sleep(500);
	}
}

getTimes();