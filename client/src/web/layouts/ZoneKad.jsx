// ZoneKad.jsx — /times/:zone in Kad (web draft 04): the day as cards. A quiet
// grey-green page, one deep-green hero card holding the next prayer and its
// countdown, then every other prayer as a white card with its name, jawi, time
// and state. The hero is one of the seven — never repeated in the grid.
import { Link } from "react-router";
import { formatCountdown, formatDate, formatTime } from "../../lib/waktu/format.js";
import { ORDER, prayerJawi, prayerLabel } from "../../lib/waktu/names.js";
import { useZoneSchedule } from "../useZoneSchedule.js";

// "2:08 jam" while there is an hour to go, "48 minit" inside the last hour:
// the unit is small, the number is the message.
export function kadCountdown(ms) {
	const total = Math.max(0, Math.floor(ms / 1000));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	if (h > 0) return { value: `${h}:${String(m).padStart(2, "0")}`, unit: "jam" };
	return { value: String(m), unit: "minit" };
}

const KIND = { countdown: "Seterusnya", iqamah: "Iqamah", "after-isyak": "Esok" };

export default function ZoneKad({ zone, changeZone, temaButton }) {
	const { info, now, today, shown, rows: list, error } = useZoneSchedule(zone);

	if (!info) {
		return (
			<main className="kad mx-auto max-w-3xl px-4 py-16">
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
			<header className="kad-head">
				<div className="kad-zone">
					<b>{info.name.split(",")[0]}</b>
					<span>
						{info.negeri} · {zone.toUpperCase()}
					</span>
				</div>
				<div className="kad-actions">
					{temaButton}
					{changeZone}
				</div>
			</header>
			<p className="kad-date">
				{formatDate(now)}
				{today?.hijri && ` · ${today.hijri}`}
			</p>
		</>
	);

	if (!today) {
		return (
			<main className="kad mx-auto max-w-3xl px-4 pt-6 pb-16 md:px-8 md:pt-10">
				{head}
				<p className="mt-10 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	const cd = kadCountdown(shown.target - now);
	// The hero already carries the next prayer, so the grid carries the other six.
	const others = ORDER.filter((key) => key !== shown.prayer);

	return (
		<main className="kad mx-auto max-w-3xl px-4 pt-5 pb-12 md:px-8 md:pt-10">
			{head}

			<section className="kad-hero" aria-label={`${shown.label} dalam`}>
				<p className="kad-k">{KIND[shown.kind] ?? "Seterusnya"}</p>
				<div className="kad-row">
					<h2>
						{shown.label}
						<span className="kad-jawi" lang="ar" dir="rtl">
							{prayerJawi(shown.prayer, now)}
						</span>
					</h2>
					<p className="kad-cd">
						{cd.value}
						<small>{cd.unit}</small>
					</p>
				</div>
				<div className="kad-foot">
					<span>
						Azan {shown.estimate ? "~" : ""}· Iqamah {shown.estimate ? "~" : ""}
						{formatTime(shown.iqamah)}
					</span>
					<b>
						{shown.estimate ? "~" : ""}
						{formatTime(shown.azan)}
					</b>
				</div>
			</section>

			<div className="kad-grid">
				{others.map((key) => (
					<article
						key={key}
						data-state={list.rows[key]}
						data-advisory={(key === "imsak" || key === "syuruk") || undefined}
					>
						<div className="kad-n">
							{prayerLabel(key, list.times[key])}
							<span className="kad-ar" lang="ar" dir="rtl">
								{prayerJawi(key, now)}
							</span>
						</div>
						<div className="kad-t">
							{shown.estimate ? "~" : ""}
							{formatTime(list.times[key])}
						</div>
						<div className="kad-s">
							{list.rows[key] === "passed" ? "Lepas" : "Akan datang"}
						</div>
					</article>
				))}
			</div>
		</main>
	);
}
