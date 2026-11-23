// ZoneMihrab.jsx — /times/:zone in Mihrab (web draft 05): the answer set in an
// arch. Deep green ground, ivory ink, one gold. The arch holds the jawi name,
// the prayer, the countdown and the azan; a ruled label divides it from the
// day, which is listed in Newsreader with its jawi beside each name.
import { Link } from "react-router";
import { formatCountdown, formatDate, formatTime } from "../../lib/waktu/format.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../../lib/waktu/names.js";
import { useZoneSchedule } from "../useZoneSchedule.js";

export default function ZoneMihrab({ zone, changeZone, temaButton }) {
	const { info, now, today, shown, rows: list, error } = useZoneSchedule(zone);

	if (!info) {
		return (
			<main className="mihrab mx-auto max-w-2xl px-5 py-16">
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
			<header className="mihrab-head">
				<span>
					<b>{zone.toUpperCase()}</b> · {info.negeri}
				</span>
				<span>{info.name.split(",")[0]}</span>
			</header>
			<div className="mihrab-actions">
				{temaButton}
				{changeZone}
			</div>
		</>
	);

	if (!today) {
		return (
			<main className="mihrab mx-auto max-w-2xl px-5 pt-6 pb-16 md:px-8 md:pt-10">
				{head}
				<p className="mt-10 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	return (
		<main className="mihrab mx-auto max-w-2xl px-5 pt-5 pb-12 md:px-8 md:pt-10">
			{head}

			<p className="mihrab-date">
				{formatDate(now)}
				{today.hijri && ` · ${today.hijri}`}
			</p>

			<section className="mihrab-arch" aria-label={`${shown.label} dalam`}>
				<span className="mihrab-jawi" lang="ar" dir="rtl">
					{prayerJawi(shown.prayer, now)}
				</span>
				<span className="mihrab-nm">{shown.label}</span>
				<span className="mihrab-cd">{formatCountdown(shown.target - now)}</span>
				<span className="mihrab-in">
					Azan{" "}
					<b>
						{shown.estimate ? "~" : ""}
						{formatTime(shown.azan)}
					</b>
				</span>
			</section>

			<div className="mihrab-line" aria-hidden="true">
				<i />
				<span>Waktu hari ini</span>
				<i />
			</div>

			<ol className="mihrab-times">
				{ORDER.map((key) => (
					<li
						key={key}
						data-state={list.rows[key]}
						data-advisory={ADVISORY.includes(key) || undefined}
					>
						<span className="mihrab-n">
							{prayerLabel(key, list.times[key])}
							<span className="mihrab-ar" lang="ar" dir="rtl">
								{prayerJawi(key, now)}
							</span>
						</span>
						<span className="mihrab-t">
							{shown.estimate ? "~" : ""}
							{formatTime(list.times[key])}
						</span>
					</li>
				))}
			</ol>

			<footer className="mihrab-foot">JAKIM · Waktu Malaysia · {formatTime(now).slice(0, 5)}</footer>
		</main>
	);
}
