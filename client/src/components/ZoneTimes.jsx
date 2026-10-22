// ZoneTimes.jsx — a zone's prayer times: the site's main job.
//
// The TV's tested logic (lib/waktu) at phone and desktop size: the lead
// answers "how long until the next prayer", then today's times (next lit
// amber), the day track, and the week or month as a table. No iqamah here:
// that is a mosque setting, so the countdown always targets the azan.
import { useEffect, useState } from "react";
import { Link } from "react-router";
import useSWR from "swr";
import { mosqueFor } from "../lib/mosques.js";
import { DEFAULTS } from "../lib/waktu/config.js";
import { ARC_TOP, arcPoints, dayTrack, STARS } from "../lib/waktu/daytrack.js";
import { areaName, formatCountdown, formatDate, formatTime } from "../lib/waktu/format.js";
import { mytIsoDate } from "../lib/waktu/mytime.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../lib/waktu/names.js";
import { dayFor, nextDay, parseYear } from "../lib/waktu/rows.js";
import { listRows, screenState } from "../lib/waktu/schedule.js";
import { skyPhase } from "../lib/waktu/sky.js";
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
			<p id="lead-title" className="text-xl font-semibold md:text-3xl">
				<span className="text-accent">{(LEAD[state.kind] ?? LEAD.countdown)(state.label)}</span>{" "}
				<span className="font-medium text-muted">dalam</span>
				<span
					lang="ar"
					dir="rtl"
					className="ml-4 font-uthmanic text-[1.1em] font-normal text-faint"
				>
					{prayerJawi(state.prayer, state.azan)}
				</span>
				{/* On a phone the azan time joins this line (all seven times must
				    fit above the bottom bar); its own line returns from md up. */}
				<span className="ml-2 text-base font-normal text-muted tabular-nums md:hidden">
					· Azan {state.estimate ? "~" : ""}
					{formatTime(state.azan)}
				</span>
			</p>
			<p className="mt-1 text-[clamp(3.25rem,15vw,8.5rem)] font-medium leading-none tracking-[-0.04em] tabular-nums md:mt-3 [@media(max-height:620px)]:text-[2.75rem]">
				{formatCountdown(state.target - now)}
			</p>
			<p className="mt-3 hidden text-lg text-muted tabular-nums md:block">
				Azan {state.estimate ? "~" : ""}
				{formatTime(state.azan)}
			</p>
		</section>
	);
}

function TodayList({ times, rows }) {
	return (
		<ol className="flex flex-col gap-0.5 md:gap-1" aria-label="Waktu solat hari ini">
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
						className={`flex items-baseline justify-between rounded-xl px-4 py-1.5 text-[17px] md:py-2.5 md:text-xl [@media(max-height:620px)]:py-0.5 [@media(max-height:620px)]:text-base ${tone} ${
							ADVISORY.includes(key) ? "font-normal" : "font-medium"
						}`}
					>
						<span className="flex items-baseline gap-3">
							<span>{prayerLabel(key, times[key])}</span>
							<span
								lang="ar"
								dir="rtl"
								className="font-uthmanic text-[1.15em] font-normal opacity-80"
							>
								{prayerJawi(key, times[key])}
							</span>
						</span>
						<span className={`flex items-center gap-3 tabular-nums ${lit ? "text-accent" : ""}`}>
							{/* The next prayer breathes: a small amber dot before its time,
							    clear of the text; still under reduced motion. */}
							{lit && <span className="pulse-dot" aria-hidden="true" />}
							{formatTime(times[key])}
						</span>
					</li>
				);
			})}
		</ol>
	);
}

// Subuh/Syuruk and Maghrib/Isyak sit about an hour apart, so on a phone
// their labels collide. Show one of each pair: the next prayer if it is in
// the pair, otherwise the inner one (Syuruk, Maghrib).
const PAIR = { subuh: "syuruk", syuruk: "subuh", maghrib: "isyak", isyak: "maghrib" };
function hiddenOnPhone(key, next) {
	if (!PAIR[key] || key === next) return false;
	return PAIR[key] === next || key === "subuh" || key === "isyak";
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
						className={`absolute -translate-x-1/2 whitespace-nowrap ${t.key === next ? "text-accent" : "text-faint"} ${
							hiddenOnPhone(t.key, next) ? "max-md:hidden" : ""
						}`}
						style={{ left: `${t.x * 100}%` }}
					>
						{prayerLabel(t.key, today.times[t.key])}
					</li>
				))}
			</ol>
		</section>
	);
}

// A well-known mosque of the zone's state: a real, credited photograph.
function StateMosque({ negeri }) {
	const m = mosqueFor(negeri);
	if (!m) return null;
	return (
		<figure className="mt-12">
			<img
				src={m.src}
				width={m.width}
				height={m.height}
				alt={m.name}
				loading="lazy"
				className="aspect-[4/3] w-full rounded-2xl object-cover md:aspect-[21/9]"
			/>
			<figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
				<span className="text-[17px] text-ink">{m.name}</span>
				<span className="text-[13px] text-faint">
					Foto:{" "}
					<a
						href={m.page}
						target="_blank"
						rel="noreferrer"
						className="underline-offset-2 hover:underline"
					>
						{m.creator}
					</a>
					,{" "}
					<a
						href={m.licenseUrl}
						target="_blank"
						rel="noreferrer"
						className="underline-offset-2 hover:underline"
					>
						{m.license}
					</a>
					, Wikimedia Commons
				</span>
			</figcaption>
		</figure>
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
		<header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 md:flex md:flex-wrap md:items-end md:justify-between md:gap-x-6 md:gap-y-3">
			<div className="min-w-0">
				{/* The state is the title; the full area list (often long) follows.
				    On a phone: three short lines so all seven times fit above the
				    bottom bar (state shortened to "WP …", areas on one line). */}
				<h1 className="text-xl font-semibold tracking-tight md:text-3xl">
					<span className="md:hidden">
						{info.negeri.replace("Wilayah Persekutuan", "WP")}
						<span className="font-normal text-faint"> · {zone.toUpperCase()}</span>
					</span>
					<span className="hidden md:inline">{info.negeri}</span>
				</h1>
				<p className="mt-0.5 truncate text-[15px] text-muted md:mt-1 md:max-w-2xl md:whitespace-normal md:text-[17px]">
					{areaName(info.name)}{" "}
					<span className="hidden text-faint md:inline">· {zone.toUpperCase()}</span>
				</p>
				<p className="mt-0.5 text-[13px] text-faint md:hidden [@media(max-height:620px)]:hidden">
					{formatDate(now)}
					{found?.day.hijri ? ` · ${found.day.hijri}` : ""}
				</p>
			</div>
			<div className="flex items-center gap-4">
				<p className="hidden text-[15px] text-muted md:block md:text-right">
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
	const { rows, times } = listRows(now, today, state);

	return (
		<main className="pb-16">
			{/* The sky over the zone right now: a flat field of its colour. */}
			<section className="sky" data-sky={skyPhase(now, today)}>
				<div className="mx-auto max-w-6xl px-4 pt-4 pb-10 md:px-6 md:pt-10 md:pb-12">
					{header}
					<div className="mt-5 grid gap-4 [@media(max-height:620px)]:mt-3 [@media(max-height:620px)]:gap-2 md:mt-10 md:gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center">
						<Lead now={now} state={shown} />
						<TodayList times={times} rows={rows} />
					</div>
					<div className="mt-10">
						<DayTrack
							now={now}
							today={today}
							next={state.kind === "after-isyak" ? null : state.prayer}
						/>
					</div>
				</div>
			</section>
			<div className="mx-auto max-w-6xl px-4 md:px-6">
				<StateMosque negeri={info.negeri} />
				<TimesTable zone={zone} todayIso={mytIsoDate(now)} />
			</div>
		</main>
	);
}
