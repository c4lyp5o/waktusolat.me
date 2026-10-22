// DayTrack.jsx — the signature element: today from Subuh to Isyak, with the
// sun where the light really is. Labels are HTML (crisp at any size); the
// sky layer is drawn from the same geometry (lib/daytrack.js).
import { dayTrack } from "./lib/daytrack.js";
import { prayerLabel } from "./lib/names.js";

const ARC_TOP = 0.9; // share of the sky's height the arc may rise to
const SAMPLES = 48;

// Stars for the night sky: fixed positions (x 0..1, y 0..1 from the top),
// so the sky does not reshuffle on every render.
const STARS = Array.from({ length: 28 }, (_, i) => ({
	x: ((i * 0.618034) % 1) * 0.96 + 0.02,
	y: ((i * 0.381966 + 0.13) % 1) * 0.8 + 0.05,
	big: i % 5 === 0,
}));

function arcPoints(from, to) {
	return Array.from({ length: SAMPLES + 1 }, (_, i) => {
		const f = i / SAMPLES;
		const x = (from + (to - from) * f) * 1000;
		const y = 100 - ARC_TOP * 100 * Math.sin(Math.PI * f);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
}

// The SVG sky: also the fallback when WebGL is missing or too slow. The SVG
// stretches to the band (preserveAspectRatio none), so only lines and the
// glow live in it; the stars are HTML dots so they stay round.
export function DayTrackSvg({ track }) {
	const { arc, phase } = track;
	const glowX = phase === "dawn" ? arc.from : phase === "dusk" ? arc.to : null;
	const starry = phase === "night" || phase === "dawn";
	return (
		<>
			{starry &&
				STARS.map((s) => (
					<span
						key={`${s.x}-${s.y}`}
						className="tv-star"
						data-big={s.big || undefined}
						style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}
					/>
				))}
			<svg
				className="tv-track-svg"
				viewBox="0 0 1000 100"
				preserveAspectRatio="none"
				role="presentation"
			>
				<defs>
					<radialGradient id="tv-horizon" cx="0.5" cy="1" r="0.5">
						<stop offset="0" stopColor="#f2b33d" stopOpacity="0.18" />
						<stop offset="1" stopColor="#f2b33d" stopOpacity="0" />
					</radialGradient>
				</defs>
				{glowX !== null && (
					<rect x={glowX * 1000 - 140} y="20" width="280" height="80" fill="url(#tv-horizon)" />
				)}
				<polyline
					className="tv-arc"
					points={arcPoints(arc.from, arc.to)}
					vectorEffect="non-scaling-stroke"
				/>
			</svg>
		</>
	);
}

export default function DayTrack({ now, today, next, sky }) {
	const track = dayTrack(now, today);
	return (
		<section className="tv-track" data-phase={track.phase} aria-hidden="true">
			<div className="tv-track-sky">
				{sky ? sky(track) : <DayTrackSvg track={track} />}
				{track.sun && (
					<span
						className="tv-sun"
						style={{ left: `${track.sun.x * 100}%`, bottom: `${track.sun.lift * ARC_TOP * 100}%` }}
					/>
				)}
				{!track.sun && track.nowX !== null && (
					<span className="tv-now" style={{ left: `${track.nowX * 100}%` }} />
				)}
			</div>
			<ol className="tv-track-ticks">
				{track.ticks.map((t) => (
					<li key={t.key} style={{ left: `${t.x * 100}%` }} data-next={t.key === next || undefined}>
						{prayerLabel(t.key, today.times[t.key])}
					</li>
				))}
			</ol>
		</section>
	);
}
