// ZoneEditorial.jsx — /times/:zone in Editorial (web draft 10): a magazine
// spread. Left page: the moment — kind, the prayer in Newsreader with the date
// set as an italic standfirst, the azan time enormous, the countdown in words
// ("dalam 2j 08m 14s · asar telah masuk"), the week as a strip. Right page: a
// dark panel with the seven times in four columns — time, name, jawi, state.
//
// On a phone it is one column and the week strip steps out (as in the draft).
import { Link } from "react-router";
import { formatTime } from "../../lib/waktu/format.js";
import { mytParts } from "../../lib/waktu/mytime.js";
import { ORDER, prayerJawi, prayerLabel } from "../../lib/waktu/names.js";
import { useZoneSchedule } from "../useZoneSchedule.js";
import { posterCountdown } from "./ZonePoster.jsx";

const WEEKDAY = ["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"];

const KIND = {
	countdown: "Seterusnya",
	iqamah: "Iqamah",
	"after-isyak": "Esok",
};

const STATUS = { past: "Lepas", next: "Seterusnya", current: "Sekarang" };

export default function ZoneEditorial({ zone, changeZone, temaButton }) {
	const { info, now, days, today, shown, rows: list, error } = useZoneSchedule(zone);

	if (!info) {
		return (
			<main className="editorial mx-auto max-w-6xl px-5 py-16">
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
			<header className="editorial-head">
				<span>
					<b>Waktu Solat</b> · {info.name.split(",")[0]}
				</span>
				<span>
					{zone.toUpperCase()} · {info.negeri}
				</span>
			</header>
			<div className="editorial-actions">
				{temaButton}
				{changeZone}
			</div>
		</>
	);

	if (!today) {
		return (
			<main className="editorial mx-auto max-w-6xl px-5 pt-6 pb-16">
				{head}
				<p className="mt-10 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	// The week, in the order the API gives it, with today marked.
	const week = (days ?? []).slice(0, 7).map((d) => ({
		iso: d.isoDate,
		day: WEEKDAY[mytParts(d.times.subuh).weekday],
		maghrib: d.times.maghrib,
	}));

	return (
		<main className="editorial mx-auto max-w-6xl px-5 pt-5 pb-14 md:px-12 md:pt-9">
			{head}

			<div className="editorial-spread">
				<section className="editorial-stage" aria-labelledby="editorial-lead">
					<p className="editorial-kind">{KIND[shown.kind] ?? "Seterusnya"}</p>
					<h1 id="editorial-lead" className="editorial-title">
						{shown.label}
						<em>
							{new Intl.DateTimeFormat("ms-MY", {
								weekday: "long",
								day: "numeric",
								month: "long",
								year: "numeric",
								timeZone: "Asia/Kuala_Lumpur",
							}).format(new Date(now))}
						</em>
					</h1>
					<p className="editorial-time">
						{shown.estimate ? "~" : ""}
						{formatTime(shown.azan)}
					</p>
					<p className="editorial-cd">
						dalam <b>{posterCountdown(shown.target - now)}</b>
						{/* What just happened: the window we are sitting in. */}
						{shown.kind === "countdown" && <span> · azan belum masuk</span>}
						{shown.kind === "iqamah" && <span> · solat sedang didirikan</span>}
					</p>
					<div className="editorial-meta">
						<span>
							{info.name.split(",")[0]} · {info.negeri}
						</span>
						<span>{today.hijri}</span>
					</div>

					<section className="editorial-week" aria-label="Maghrib minggu ini">
						<div className="editorial-week-head">
							<span>Minggu ini</span>
							<span>Maghrib</span>
						</div>
						<ol>
							{week.map((d) => (
								<li key={d.iso} data-on={d.iso === today.isoDate || undefined}>
									<b>{d.day}</b>
									<span>{formatTime(d.maghrib)}</span>
								</li>
							))}
						</ol>
					</section>
				</section>

				<section className="editorial-panel" aria-labelledby="editorial-today">
					<div className="editorial-panel-head">
						<span id="editorial-today">Waktu hari ini</span>
						<span>JAKIM · Waktu Malaysia</span>
					</div>
					<ol className="editorial-times">
						{ORDER.map((key) => (
							<li
								key={key}
								data-state={list.rows[key]}
								data-advisory={["imsak", "syuruk"].includes(key) || undefined}
							>
								<span className="editorial-w">
									{shown.estimate ? "~" : ""}
									{formatTime(list.times[key])}
								</span>
								<span className="editorial-n">{prayerLabel(key, list.times[key])}</span>
								<span className="editorial-ar" lang="ar" dir="rtl">
									{prayerJawi(key, now)}
								</span>
								<span className="editorial-s">{STATUS[list.rows[key]] ?? ""}</span>
							</li>
						))}
					</ol>
				</section>
			</div>

			<footer className="editorial-foot">
				<span>E-Solat JAKIM · Dikemas kini</span>
				<span>{formatTime(now)}</span>
			</footer>
		</main>
	);
}
