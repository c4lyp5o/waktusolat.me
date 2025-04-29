import Cpray from "cpray";
import fs from "node:fs/promises";
import { join } from "node:path";

import logger from "../utils/logger.js";

const cpray = new Cpray();

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
	"ktn03",
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

async function getTimesAndWrite(zone) {
	logger.info(`[timesGetter] Getting times for ${zone}`);
	const Times = await cpray.getTimesbyYear(zone);
	const jsonContent = JSON.stringify(Times);
	await fs.writeFile(
		join(process.cwd(), "data", "times", `${zone}.json`),
		jsonContent,
		"utf8",
	);
	await sleep(500);
}

function sleep(delay) {
	logger.info(`[timesGetter] Sleeping for ${delay}ms`);
	return new Promise((resolve) => setTimeout(resolve, delay));
}

async function getTimes() {
	for (const zone of zones) {
		await getTimesAndWrite(zone);
	}
}

getTimes();
