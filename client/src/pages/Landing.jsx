// `/` — a returning visitor sees their zone's times with zero taps; a first
// visit (or "Tukar zon", /?pilih) leads with the zone search.
import { useMemo } from "react";
import { useSearchParams } from "react-router";
import tvDisplay from "../assets/tv-display.webp";
import ZoneSearch from "../components/ZoneSearch.jsx";
import ZoneTimes from "../components/ZoneTimes.jsx";
import { safeStorage } from "../lib/storage.js";
import { loadZone } from "../lib/zoneMemory.js";
import { zoneIndex, zoneInfo } from "../lib/zones.js";
import { changeZoneLink } from "./ZonePrayerTimes.jsx";

export default function Landing() {
	const [params] = useSearchParams();
	const remembered = useMemo(() => loadZone(safeStorage()), []);
	const picking = params.has("pilih") || !remembered || !zoneInfo(remembered);

	if (!picking) return <ZoneTimes zone={remembered} changeZone={changeZoneLink} />;

	return (
		<main className="mx-auto grid max-w-6xl gap-14 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_30rem]">
			<title>Waktu Solat Malaysia</title>
			<div>
				<h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-[32px]">
					Waktu solat di zon anda
				</h1>
				<p className="mt-3 text-lg text-muted">
					Terus dari JAKIM e-Solat, untuk {zoneIndex.length} zon di seluruh Malaysia.
				</p>
				<div className="mt-10">
					<ZoneSearch autoFocus={!remembered} />
				</div>
			</div>
			<TvPromo />
		</main>
	);
}

// For mosques: the free TV display, shown as it really looks.
function TvPromo() {
	return (
		<section aria-labelledby="tv-title" className="self-start rounded-2xl bg-surface p-6">
			<h2 id="tv-title" className="text-xl font-semibold">
				Paparan TV untuk masjid
			</h2>
			<p className="mt-2 text-[17px] text-muted">
				Waktu solat, kiraan ke azan dan iqamah, serta ayat dan hadis bergilir di TV masjid atau
				surau anda. Percuma, tanpa daftar.
			</p>
			<img
				src={tvDisplay}
				width="1200"
				height="675"
				alt="Paparan TV: kiraan ke Zohor, waktu solat hari ini dan ayat Al-Quran"
				className="mt-5 w-full rounded-lg"
				loading="lazy"
			/>
			<p className="mt-4 text-[15px] text-faint">
				Buka <span className="font-semibold text-ink">waktusolat.me/tv/kod-zon</span> pada pelayar
				TV, contohnya /tv/wly01.
			</p>
		</section>
	);
}
