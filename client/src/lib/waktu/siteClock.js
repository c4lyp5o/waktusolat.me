// siteClock.js — the website's clock and its "no iqamah" settings.
//
// The site shows the azan, never the mosque's iqamah (that is a mosque
// setting), so both zone pages run the same schedule logic with these values.
// Ticks on each whole second, like the TV.
import { useEffect, useState } from "react";
import { DEFAULTS } from "./config.js";
import { siteNow } from "./siteNow.js";

export const SITE_CONFIG = {
	...DEFAULTS,
	iqamah: { subuh: 0, zohor: 0, asar: 0, maghrib: 0, isyak: 0 },
	jumaat: 0,
	solat: 0,
};

export function useSiteNow() {
	const [now, setNow] = useState(siteNow);
	useEffect(() => {
		let timer;
		const tick = () => {
			const t = siteNow();
			setNow(t);
			timer = setTimeout(tick, 1000 - (t % 1000) + 5);
		};
		tick();
		return () => clearTimeout(timer);
	}, []);
	return now;
}
