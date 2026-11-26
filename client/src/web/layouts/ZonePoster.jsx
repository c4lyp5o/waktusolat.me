// ZonePoster.jsx — /times/:zone in Poster (web draft 08): the day as a printed
// poster. A kraft sheet, a heavy masthead rule, one word in full, the azan
// time set enormous, and the seven times as a tight ruled list with the next
// one knocked out in reverse. Red is the printer's ink: the dot, the kicker,
// and nothing else.
//
// Same data, same schedule maths as every other printed page: useZoneSchedule.
import { Link } from "react-router";
import { formatDate, formatTime } from "../../lib/waktu/format.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../../lib/waktu/names.js";
import { useZoneSchedule } from "../useZoneSchedule.js";

// "2j 08m 14s" — the poster's countdown keeps the seconds.
export function posterCountdown(ms) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n) => String(n).padStart(2, "0");
	return `${h}j ${pad(m)}m ${pad(s)}s`;
}

// The kicker names the moment, never the prayer: the name is the headline
// right under it, and printing "Seterusnya · Zohor · …" said it twice.
const KICK = {
	countdown: "Seterusnya",
	iqamah: "Iqamah",
	"after-isyak": "Esok",
};

export default function ZonePoster({ zone, changeZone, temaButton }) {
	const { info, now, today, shown, rows: list, error } = useZoneSchedule(zone);

	if (!info) {
		return (
			<main className="poster mx-auto max-w-[860px] px-5 py-16">
				<h1 className="text-3xl font-semibold">Zon tidak dijumpai</h1>
				<p className="mt-3 text-lg text-muted">
					Kod zon "{zone.toUpperCase()}" tiada dalam senarai JAKIM.
				</p>
				<Link to="/?pilih" className="mt-6 inline-block text-lg font-semibold text-accent">
					Pilih zon anda
				</Link>
			</main>
		);
	}

	const mast = (
		<>
			<div className="poster-mast">
				<span>
					<b>Waktu Solat</b> · Malaysia
				</span>
				<span>
					{zone.toUpperCase()} / {info.negeri}
				</span>
			</div>
			<div className="poster-rule" />
			<div className="poster-rule poster-rule-thin" />
			<div className="poster-actions">
				{temaButton}
				{changeZone}
			</div>
		</>
	);

	if (!today) {
		return (
			<main className="poster mx-auto max-w-[860px] px-5 pt-6 pb-16 md:px-8 md:pt-10">
				{mast}
				<p className="mt-10 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	const place = info.name.split(",")[0];

	return (
		<main className="poster mx-auto max-w-[860px] px-5 pt-5 pb-12 md:px-10 md:pt-10">
			{mast}

			<section className="poster-hero">
				<p className="poster-kicker">
					<i aria-hidden="true" />
					{KICK[shown.kind] ?? KICK.countdown} · {formatDate(now)}
				</p>
				<div className="poster-name">
					<h1>{shown.label}</h1>
					<span className="poster-jawi" lang="ar" dir="rtl">
						{prayerJawi(shown.prayer, now)}
					</span>
				</div>
				<p className="poster-big">
					{shown.estimate ? "~" : ""}
					{formatTime(shown.azan)}
				</p>
				<div className="poster-sub">
					<span className="poster-place">{place}</span>
					<span className="poster-cd">
						{posterCountdown(shown.target - now)} <span>lagi</span>
					</span>
				</div>
			</section>

			<ol className="poster-list">
				{ORDER.map((key) => (
					<li
						key={key}
						data-state={list.rows[key]}
						data-advisory={ADVISORY.includes(key) || undefined}
					>
						<span className="poster-n">{prayerLabel(key, list.times[key])}</span>
						<span className="poster-t">
							{shown.estimate ? "~" : ""}
							{formatTime(list.times[key])}
						</span>
					</li>
				))}
				<li className="poster-fill">
					<span>{today.hijri}</span>
					<span>Waktu Malaysia</span>
				</li>
			</ol>

			<footer className="poster-foot">
				<span>
					<b>JAKIM</b> e-Solat
				</span>
				<span>Waktu Malaysia · {formatTime(now).slice(0, 5)}</span>
			</footer>
		</main>
	);
}
