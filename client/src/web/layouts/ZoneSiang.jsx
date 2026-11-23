// ZoneSiang.jsx — /times/:zone in Siang (web draft 03): the daylit page.
// A cream sheet, the zone as a place rather than a code, the day as one band,
// one answer in words — "Maghrib · azan 19:00" — with the countdown in hours
// and minutes (2j 08m) instead of a clock, then the seven times as a plain
// list, and a quiet foot.
//
// Same data, same schedule maths as the almanak page: useZoneSchedule.
import { Link } from "react-router";
import { temaById } from "../../../../shared/temas.js";
import { formatDate, formatTime } from "../../lib/waktu/format.js";
import { mytIsoDate } from "../../lib/waktu/mytime.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../../lib/waktu/names.js";
import DayRibbon from "../../components/DayRibbon.jsx";
import TimesTable from "../../components/TimesTable.jsx";
import { useZoneSchedule } from "../useZoneSchedule.js";

// "2j 08m" — hours and minutes, the units set small. Under an hour it is
// minutes only, which is the number the congregation actually wants.
export function siangCountdown(ms) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const parts = [];
	if (h > 0) parts.push({ n: String(h), u: "j" });
	parts.push({ n: String(m).padStart(2, "0"), u: "m" });
	return parts;
}

const LEAD = {
	countdown: (label) => label,
	iqamah: (label) => `Iqamah ${label}`,
	"after-isyak": (label) => `${label} esok`,
};

export default function ZoneSiang({ zone, changeZone, temaButton, tema = "siang" }) {
	const { info, now, today, shown, rows: list, error } = useZoneSchedule(zone);

	if (!info) {
		return (
			<main className="siang mx-auto max-w-3xl px-5 py-16">
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

	const head = (
		<>
			<header className="flex items-start justify-between gap-4">
				<p className="siang-place">
					{info.negeri}
					<span className="siang-place-sub"> · {zone.toUpperCase()}</span>
				</p>
				<div className="flex shrink-0 items-center gap-2">
					{temaButton}
					{changeZone}
				</div>
			</header>
			<p className="siang-date">
				{zone.toUpperCase()} · {formatDate(now)}
				{today?.hijri && ` · ${today.hijri}`}
			</p>
		</>
	);

	if (!today) {
		return (
			<main className="siang mx-auto max-w-3xl px-5 pt-6 pb-16 md:px-8 md:pt-10">
				{head}
				<p className="mt-10 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	const parts = siangCountdown(shown.target - now);
	const name = temaById(tema).name;

	return (
		<main className="siang mx-auto max-w-3xl px-5 pt-6 pb-16 md:px-8 md:pt-10">
			{head}

			<DayRibbon times={list.times} now={now} variant="web" />

			<section aria-labelledby="siang-lead" className="siang-lead">
				<div>
					<p id="siang-lead" className="siang-k">
						Seterusnya
					</p>
					<p className="siang-v">
						{(LEAD[shown.kind] ?? LEAD.countdown)(shown.label)}
						<em> · azan {formatTime(shown.azan)}</em>
					</p>
				</div>
				<p className="siang-cd" aria-label={`${parts.map((p) => p.n + " " + (p.u === "j" ? "jam" : "minit")).join(" ")} lagi`}>
					{parts.map((p, i) => (
						<span key={p.u}>
							{p.n}
							<i>{p.u}</i>
							{i < parts.length - 1 ? " " : ""}
						</span>
					))}
				</p>
			</section>

			<ol className="siang-times">
				{ORDER.map((key) => (
					<li
						key={key}
						data-state={list.rows[key]}
						data-advisory={ADVISORY.includes(key) || undefined}
					>
						<span className="siang-name">
							{prayerLabel(key, list.times[key])}
							{(list.rows[key] === "next" || list.rows[key] === "current") && (
								<span className="siang-jawi" lang="ar" dir="rtl">
									{prayerJawi(key, now)}
								</span>
							)}
						</span>
						<span className="siang-time">
							{shown.estimate ? "~" : ""}
							{formatTime(list.times[key])}
						</span>
					</li>
				))}
			</ol>

			<TimesTable zone={zone} todayIso={mytIsoDate(now)} className="mt-10" />

			<footer className="siang-foot">
				<span>JAKIM · Waktu Malaysia</span>
				<span>
					{tema === "siang" ? name : "Siang"} · {zone.toUpperCase()}
				</span>
			</footer>
		</main>
	);
}
