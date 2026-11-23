// ZoneAlmanak.jsx — /times/:zone in Takwim or Papan (S5b). The same data and
// the same schedule logic as the sky page, printed instead of painted: a
// masthead, one answer set in a serif beside its countdown, the seven times as
// dotted leaders, then the week or month.
//
// It reads the tema it was given and nothing else; every colour is a token, so
// Takwim renders paper and Papan renders the green board from one component.
import { Link } from "react-router";
import { temaById } from "../../../shared/temas.js";
import { areaName, formatCountdown, formatDate, formatTime } from "../lib/waktu/format.js";
import { mytIsoDate } from "../lib/waktu/mytime.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../lib/waktu/names.js";
import { useZoneSchedule } from "../web/useZoneSchedule.js";
import DayDial from "./DayDial.jsx";
import DayRibbon from "./DayRibbon.jsx";
import TimesTable from "./TimesTable.jsx";

const LEAD = {
	countdown: (label) => label,
	"after-isyak": (label) => `${label} esok`,
};

function NotFound({ zone }) {
	return (
		<main className="mx-auto max-w-6xl px-4 py-16 md:px-6">
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

export default function ZoneAlmanak({ zone, changeZone, tema = "takwim", temaButton }) {
	// The day comes from the same hook every printed page uses.
	const { info, now, error, today, estimate, state, shown, rows: list } = useZoneSchedule(zone);
	if (!info) return <NotFound zone={zone} />;

	const name = temaById(tema).name;

	const header = (
		<header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
			<div className="min-w-0">
				<p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-faint">
					{name} · {zone.toUpperCase()}
				</p>
				<h1 className="almanak-title mt-1.5 text-[clamp(1.9rem,5vw,3.1rem)] leading-[1.05]">
					{info.negeri}
				</h1>
				<p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted md:text-[16px]">
					{areaName(info.name)}
				</p>
			</div>
			<div className="flex items-end gap-4">
				<p className="text-right text-[14px] leading-relaxed text-muted">
					{formatDate(now)}
					{today?.hijri && (
						<>
							<br />
							<span className="text-faint">{today.hijri}</span>
						</>
					)}
				</p>
				{temaButton}
				{changeZone}
			</div>
		</header>
	);

	if (!today) {
		return (
			<main className="almanak mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-14">
				{header}
				<hr className="almanak-rule-double mt-5" />
				<p className="mt-12 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	const { rows, times } = list;

	return (
		<main className="almanak mx-auto max-w-5xl px-4 pt-4 pb-16 md:px-8 md:pt-10">
			{header}
			<hr className="almanak-rule-double mt-5" />

			{/* Jalur's signature: the whole day as one band, before the answer. */}
			{tema === "jalur" && <DayRibbon times={times} now={now} variant="web" />}

			{/* The answer: on Dail the ring carries it; elsewhere the prayer sits
			    on the left with its countdown on the right. */}
			{tema === "dail" ? (
				<DayDial times={times} now={now} state={shown} variant="web" />
			) : (
				<section
					aria-labelledby="almanak-lead"
					className="grid gap-x-6 gap-y-2 py-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-9"
				>
				<div>
					<p
						id="almanak-lead"
						className="text-[12px] font-semibold uppercase tracking-[0.24em] text-muted"
					>
						Seterusnya
					</p>
					<p className="almanak-lead mt-2 text-[clamp(2.4rem,8vw,4.4rem)] leading-[0.95]">
						{(LEAD[state.kind] ?? LEAD.countdown)(state.label)}
					</p>
					<p className="mt-2 text-[15px] text-muted md:text-[16px]">
						<span lang="ar" dir="rtl" className="font-jawi text-[1.05em]">
							{prayerJawi(state.prayer, state.azan)}
						</span>
						{" · Azan "}
						<span className="tabular-nums">
							{state.estimate ? "~" : ""}
							{formatTime(state.azan)}
						</span>
					</p>
				</div>
				<div className="md:text-right">
					<p className="almanak-count text-[clamp(2.6rem,9vw,5.2rem)] leading-none tabular-nums">
						{formatCountdown(state.target - now)}
					</p>
					{/* What the big number is: it sits beside "Seterusnya", not a clock. */}
					<p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.24em] text-muted">
						lagi
					</p>
				</div>
				</section>
			)}

			<hr className="almanak-rule" />

			<section aria-labelledby="almanak-today" className="pt-6">
				<h2
					id="almanak-today"
					className="text-[12px] font-semibold uppercase tracking-[0.24em] text-faint"
				>
					Hari ini
				</h2>
				<ol className="mt-2">
					{ORDER.map((key) => (
						<li
							key={key}
							className="leader-row"
							data-state={rows[key]}
							data-advisory={ADVISORY.includes(key) || undefined}
						>
							<span className="leader-name">{prayerLabel(key, times[key])}</span>
							<span className="leader-jawi" lang="ar" dir="rtl">
								{prayerJawi(key, now)}
							</span>
							<span className="leader-dots" aria-hidden="true" />
							<span className="leader-time">
								{estimate ? "~" : ""}
								{formatTime(times[key])}
							</span>
						</li>
					))}
				</ol>
			</section>

			<TimesTable zone={zone} todayIso={mytIsoDate(now)} className="mt-12" />

			<footer className="mt-12 border-t border-line pt-5 text-[15px] text-muted">
				<p>
					Tema {name} · waktu JAKIM untuk {zone.toUpperCase()}.{" "}
					<Link
						to={`/times/${zone}?tema=langit`}
						className="font-semibold text-ink underline underline-offset-2"
					>
						Lihat versi langit
					</Link>
					{" · "}
					<Link
						to={`/tv/${zone}?tema=${tema}`}
						className="font-semibold text-ink underline underline-offset-2"
					>
						Buka di TV
					</Link>
					{" · "}
					<Link to="/m/baru" className="font-semibold text-ink underline underline-offset-2">
						Daftar masjid
					</Link>
				</p>
			</footer>
		</main>
	);
}
