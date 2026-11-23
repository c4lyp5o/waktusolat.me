// DayRibbon.jsx — the day as one band: a gradient from midnight to midnight,
// a marker at the visitor's clock, and the five prayers marked on it. Used by
// the Jalur TV layout and the Jalur web page from one implementation, so the
// two can never disagree about where a prayer sits.
//
// `variant` only changes the sizes and which side the labels sit on: the
// geometry is the same maths (lib/waktu/ribbon.js).
import { clockPercent, dayPercent, ribbonMarks } from "../lib/waktu/ribbon.js";
import { formatTime } from "../lib/waktu/format.js";

export default function DayRibbon({ times, now, variant = "web" }) {
	const marks = ribbonMarks(times, now);
	const pct = dayPercent(now);
	const hours = [0, 3, 6, 9, 12, 15, 18, 21, 24];

	return (
		<section className={`ribbon ribbon-${variant}`} aria-label="Garis masa hari ini">
			<div className="ribbon-track">
				<div className="ribbon-bar" />
				<span className="ribbon-now" style={{ left: `${pct}%` }}>
					<span className="ribbon-now-time">{formatTime(now).slice(0, 5)}</span>
				</span>
			</div>

			<ol className="ribbon-hours" aria-hidden="true">
				{hours.map((h) => (
					<li key={h} style={{ left: `${(h / 24) * 100}%` }}>
						{String(h).padStart(2, "0")}
					</li>
				))}
			</ol>

			<ol className="ribbon-marks">
				{marks.map((m) => (
					<li
						key={m.key}
						className={`ribbon-mark ribbon-row${m.row}`}
						data-state={m.past ? "past" : "upcoming"}
						style={{ left: `${m.left}%` }}
					>
						<span className="ribbon-name">{m.label}</span>
						<span className="ribbon-time">{formatTime(m.time)}</span>
						<span className="ribbon-jawi" lang="ar" dir="rtl">
							{m.jawi}
						</span>
					</li>
				))}
			</ol>

			{/* Screen readers get the same band as text. */}
			<p className="sr-only">
				Jam {clockPercent(now).toFixed(0)}% hari ini.{" "}
				{marks.map((m) => `${m.label} ${formatTime(m.time)}`).join(", ")}.
			</p>
		</section>
	);
}
