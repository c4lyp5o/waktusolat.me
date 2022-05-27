import { createRequire } from "module";
const require = createRequire(import.meta.url);
const Cpray = require("cpray");
const cpray = new Cpray();
import fs from "fs";
import { join } from "path";

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
  var Times = await cpray.getTimesbyYear(zone);
  var jsonContent = JSON.stringify(Times);
  fs.writeFile(
    join(process.cwd(), "engine", "data", "times", `${zone}.json`),
    jsonContent,
    "utf8",
    function (err) {
      if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
      }
      console.log(`${zone} time file has been saved.`);
    }
  );
  sleep({ delay: 20000 });
}

async function sleep({ delay = 2000, throwReject = false }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (throwReject) reject({ timeout: true });
      else resolve();
    }, delay);
  });
}

function getTimes() {
  zones.forEach(async (zone) => {
    await getTimesAndWrite(zone);
  });
}

getTimes();
