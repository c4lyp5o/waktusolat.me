// sky.js — which sky the zone is under right now, from its prayer times.
// The site paints the lead in this sky's colour (main.css .sky[data-sky]),
// so the time of day reads before any number does.
//   malam  Isyak -> Imsak      subuh  Imsak -> Syuruk
//   pagi   Syuruk -> Zohor     zohor  Zohor -> Asar
//   asar   Asar -> Maghrib     senja  Maghrib -> Isyak
export function skyPhase(now, today) {
	const { imsak, syuruk, zohor, asar, maghrib, isyak } = today.times;
	if (now < imsak || now >= isyak) return "malam";
	if (now < syuruk) return "subuh";
	if (now < zohor) return "pagi";
	if (now < asar) return "zohor";
	if (now < maghrib) return "asar";
	return "senja";
}
