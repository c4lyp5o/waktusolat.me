// ZoneTimes.jsx — a zone's prayer times: the site's main job.
//
// The TV's tested logic (lib/waktu) at phone and desktop size: the lead
// answers "how long until the next prayer", then today's times (next lit
// amber), the day track, and the week or month as a table. No iqamah here:
// that is a mosque setting, so the countdown always targets the azan.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import useSWR from "swr";
import { DEFAULTS } from "../lib/waktu/config.js";
import { ARC_TOP, arcPoints, dayTrack, STARS } from "../lib/waktu/daytrack.js";
import { areaName, formatCountdown, formatDate, formatTime } from "../lib/waktu/format.js";
import { mytIsoDate } from "../lib/waktu/mytime.js";
import { ADVISORY, ORDER, prayerLabel } from "../lib/waktu/names.js";
import { dayFor, nextDay, parseYear } from "../lib/waktu/rows.js";
import { rowStates, screenState } from "../lib/waktu/schedule.js";
import { zoneInfo } from "../lib/zones.js";

const SITE_CONFIG = {
	...DEFAULTS,
	iqamah: { subuh: 0, zohor: 0, asar: 0, maghrib: 0, isyak: 0 },
	jumaat: 0,
	solat: 0,
};

async function fetchDays(url) {
	const res = await fetch(url);
	if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
	return parseYear(await res.json());
}

// Ticks on each whole second.
function useNow() {
	const [now, setNow] = useState(Date.now);
	useEffect(() => {
		let timer;
		const tick = () => {
			const t = Date.now();
			setNow(t);
			timer = setTimeout(tick, 1000 - (t % 1000) + 5);
		};
		tick();
		return () => clearTimeout(timer);
	}, []);
	return now;
}

const LEAD = {
	countdown: (label) => label,
	"after-isyak": (label) => `${label} esok`,
};

function Lead({ now, state }) {
	return (
		<section aria-labelledby="lead-title">
			<p id="lead-title" className="text-2xl font-semibold md:text-3xl">
				<span className="text-accent">{(LEAD[state.kind] ?? LEAD.countdown)(state.label)}</span>{" "}
				<span className="font-medium text-muted">dalam</span>
			</p>
			<p className="mt-3 text-[clamp(4.5rem,18vw,8.5rem)] font-medium leading-none tracking-[-0.04em] tabular-nums">
				{formatCountdown(state.target - now)}
			</p>
			<p className="mt-3 text-lg text-muted tabular-nums">
				Azan {state.estimate ? "~" : ""}
				{formatTime(state.azan)}
			</p>
		</section>
	);
}

function TodayList({ today, rows }) {
	return (
		<ol className="flex flex-col gap-1" aria-label="Waktu solat hari ini">
			{ORDER.map((key) => {
				const state = rows[key];
				const lit = state === "next" || state === "current";
				const tone = lit
					? "bg-surface text-ink"
					: state === "passed"
						? "text-spent"
						: ADVISORY.includes(key)
							? "text-faint"
							: "text-muted";
				return (
					<li
						key={key}
						className={`flex items-baseline justify-between rounded-xl px-4 py-2.5 text-xl ${tone} ${
							ADVISORY.includes(key) ? "font-normal" : "font-medium"
						}`}
					>
						<span>{prayerLabel(key, today.times[key])}</span>
						<span className={`tabular-nums ${lit ? "text-accent" : ""}`}>
							{formatTime(today.times[key])}
						</span>
					</li>
				);
			})}
		</ol>
	);
}

// The TV's day track, SVG only (no three.js outside /tv).
function DayTrack({ now, today, next }) {
	const track = dayTrack(now, today);
	const starry = track.phase === "night" || track.phase === "dawn";
	return (
		<section aria-hidden="true" className="px-3">
			<div className="relative h-16 overflow-hidden md:h-20">
				{starry &&
					STARS.map((s) => (
						<span
							key={`${s.x}-${s.y}`}
							className="site-star absolute rounded-full"
							style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
						/>
					))}
				<svg
					className="absolute inset-0 h-full w-full"
					viewBox="0 0 1000 100"
					preserveAspectRatio="none"
					role="presentation"
				>
					<polyline
						points={arcPoints(track.arc.from, track.arc.to)}
						fill="none"
						stroke="var(--faint)"
						strokeOpacity="0.45"
						strokeWidth="2"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
				{track.sun && (
					<span
						className="absolute h-5 w-5 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent-fill"
						style={{ left: `${track.sun.x * 100}%`, bottom: `${track.sun.lift * ARC_TOP * 100}%` }}
					/>
				)}
				{!track.sun && track.nowX !== null && (
					<span
						className="absolute bottom-0 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-faint"
						style={{ left: `${track.nowX * 100}%` }}
					/>
				)}
			</div>
			<ol className="relative mt-2 h-5 text-[13px] md:text-sm">
				{track.ticks.map((t) => (
					<li
						key={t.key}
						className={`absolute -translate-x-1/2 whitespace-nowrap ${t.key === next ? "text-accent" : "text-faint"}`}
						style={{ left: `${t.x * 100}%` }}
					>
						{prayerLabel(t.key, today.times[t.key])}
					</li>
				))}
			</ol>
		</section>
	);
}

const TABLE_KEYS = ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"];

function TimesTable({ zone, todayIso }) {
	const [period, setPeriod] = useState("week");
	const { data: days, error } = useSWR(`/api/v1/waktusolat/${period}/${zone}`, fetchDays);
	return (
		<section aria-labelledby="table-title" className="mt-14">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 id="table-title" className="text-xl font-semibold">
					{period === "week" ? "Minggu ini" : "Bulan ini"}
				</h2>
				<fieldset className="m-0 flex rounded-full border-0 bg-raised p-1">
					<legend className="sr-only">Tempoh</legend>
					{[
						["week", "Minggu"],
						["month", "Bulan"],
					].map(([p, label]) => (
						<button
							key={p}
							type="button"
							onClick={() => setPeriod(p)}
							aria-pressed={period === p}
							className={`rounded-full px-4 py-1.5 text-[15px] ${
								period === p ? "bg-surface font-semibold text-ink" : "text-faint hover:text-ink"
							}`}
						>
							{label}
						</button>
					))}
				</fieldset>
			</div>
			{error ? (
				<p className="mt-4 text-muted">Jadual tidak dapat dimuatkan. Cuba sebentar lagi.</p>
			) : (
				<div className="mt-4 overflow-x-auto">
					<table className="w-full min-w-[34rem] text-[15px] tabular-nums">
						<thead>
							<tr className="text-left text-sm text-faint">
								<th className="py-2 pr-3 font-normal">Tarikh</th>
								{TABLE_KEYS.map((k) => (
									<th key={k} className="py-2 pl-3 text-right font-normal">
										{prayerLabel(k, 0)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{(days ?? []).map((d) => {
								const isToday = d.isoDate === todayIso;
								return (
									<tr
										key={d.isoDate}
										className={`border-t border-line ${isToday ? "font-semibold text-ink" : "text-muted"}`}
									>
										<td className="py-2.5 pr-3 whitespace-nowrap">
											{formatDate(d.times.zohor).replace(/ \d{4}$/, "")}
										</td>
										{TABLE_KEYS.map((k) => (
											<td key={k} className="py-2.5 pl-3 text-right">
												{formatTime(d.times[k])}
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}

export default function ZoneTimes({ zone, changeZone }) {
	const info = zoneInfo(zone);
	const now = useNow();
	const { data: days, error } = useSWR(info ? `/api/v1/waktusolat/week/${zone}` : null, fetchDays);

	if (!info) {
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

	const found = days?.length ? dayFor(days, now) : null;
	const header = (
		<header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
			<div className="min-w-0">
				{/* The state is the title; the full area list (often long) follows
				    in full rather than being cut or wrapping a headline. */}
				<h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{info.negeri}</h1>
				<p className="mt-1 max-w-2xl text-[17px] text-muted">
					{areaName(info.name)} <span className="text-faint">· {zone.toUpperCase()}</span>
				</p>
			</div>
			<div className="flex items-center gap-4">
				<p className="text-[15px] text-muted md:text-right">
					{formatDate(now)}
					{found?.day.hijri && (
						<>
							<br />
							{found.day.hijri}
						</>
					)}
				</p>
				{changeZone}
			</div>
		</header>
	);

	if (!found) {
		return (
			<main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
				{header}
				<p className="mt-12 text-lg text-muted">
					{error
						? "Waktu solat untuk zon ini belum tersedia. Cuba sebentar lagi."
						: "Memuatkan waktu solat…"}
				</p>
			</main>
		);
	}

	const { day: today, estimate } = found;
	const state = screenState(now, today, estimate ? null : nextDay(days, today), SITE_CONFIG);
	const shown = estimate ? { ...state, estimate: true } : state;
	const rows = rowStates(now, today, state);

	return (
		<main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
			{header}
			<div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
				<Lead now={now} state={shown} />
				<TodayList today={today} rows={rows} />
			</div>
			<div className="mt-10">
				<DayTrack
					now={now}
					today={today}
					next={state.kind === "after-isyak" ? null : state.prayer}
				/>
			</div>
			<TimesTable zone={zone} todayIso={mytIsoDate(now)} />
		</main>
	);
}
