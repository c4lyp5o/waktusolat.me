// tv-shots.mjs — screenshots of every /tv screen state at 1080p and 4K.
//
//   node scripts/tv-shots.mjs [outDir] [baseUrl]
//
// Needs a dev server (`bun dev`: ?now= is ignored in production builds) and
// `playwright-core` with a Chromium; point CHROME at its executable if
// Playwright's own browser is not installed. Times are WLY01's for 22 and
// 23 Oct 2026 (Zohor 13:01, Isyak 20:10; the 23rd is a Friday).
//
// A registered mosque's screen (/m/:id) is added when MOSQUE=<id> names a
// mosque in the server's database (create one in /m/baru, with a few
// programmes; WLY01 zone for the times above).
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const out = process.argv[2] ?? ".shots/tv";
const base = process.argv[3] ?? "http://localhost:3000";

const THU = "2026-10-22";
const FRI = "2026-10-23";
const STATES = [
	["pre-dawn-countdown", `/tv/wly01?now=${THU}T04:30:00`],
	["morning-countdown", `/tv/wly01?now=${THU}T06:00:00`],
	["midday-countdown", `/tv/wly01?now=${THU}T11:20:00`],
	["azan-in-seconds", `/tv/wly01?now=${THU}T13:00:40`],
	["iqamah-countdown", `/tv/wly01?now=${THU}T13:05:00`],
	["solat-in-progress", `/tv/wly01?now=${THU}T13:15:00`],
	["afternoon", `/tv/wly01?now=${THU}T17:30:00`],
	["maghrib-iqamah", `/tv/wly01?now=${THU}T19:04:00`],
	["after-isyak", `/tv/wly01?now=${THU}T22:00:00`],
	["jumaat-iqamah", `/tv/wly01?now=${FRI}T13:20:00`],
	["mosque-name", `/tv/wly01?nama=Masjid%20Al-Ikhlas&now=${THU}T16:30:00`],
	["unknown-zone", "/tv/xxx99"],
];
if (process.env.MOSQUE) {
	const m = `/m/${process.env.MOSQUE}`;
	STATES.push(
		["mosque-morning", `${m}?now=${THU}T09:00:00`],
		["mosque-evening", `${m}?now=${THU}T18:30:00`],
	);
}
const SIZES = [
	["1080p", 1920, 1080],
	["4k", 3840, 2160],
];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
	executablePath: process.env.CHROME || undefined,
	args: ["--no-sandbox"],
});
for (const [sizeName, width, height] of SIZES) {
	const ctx = await browser.newContext({ viewport: { width, height } });
	for (const [name, path] of STATES) {
		const page = await ctx.newPage();
		await page.goto(base + path, { waitUntil: "networkidle" });
		// The crossfade and the day track; a mosque's first programme card
		// arrives on the banner's next turn.
		await page.waitForTimeout(path.startsWith("/m/") ? 22_000 : 1500);
		await page.screenshot({ path: `${out}/${name}-${sizeName}.png` });
		await page.close();
	}
	await ctx.close();
}
// A phone held upright gets a notice, not the TV layout.
const phone = await browser.newPage({ viewport: { width: 390, height: 844 } });
await phone.goto(`${base}/tv/wly01`, { waitUntil: "networkidle" });
await phone.screenshot({ path: `${out}/portrait-notice.png` });
await browser.close();
console.log(`${STATES.length * SIZES.length + 1} screenshots in ${out}`);
