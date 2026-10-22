// Header.jsx — who this screen belongs to, today's dates, and the clock.
import { areaName, formatClock, formatDate } from "./lib/format.js";

export default function Header({ now, zone, nama, meta, hijri }) {
	const area = areaName(meta?.area);
	const { hm, s } = formatClock(now);
	return (
		<header className="tv-header">
			<h1 className="tv-title">
				<span className="tv-title-name">{nama || area || zone.toUpperCase()}</span>
				<span className="tv-title-zone">
					{zone.toUpperCase()}
					{nama && area ? ` · ${area}` : ""}
				</span>
			</h1>
			<div className="tv-dates">
				<span>{formatDate(now)}</span>
				{hijri && <span>{hijri}</span>}
			</div>
			<time className="tv-clock">
				{hm}
				<span className="tv-clock-s">{s}</span>
			</time>
		</header>
	);
}
