// PrayerList.jsx — today's seven times, the next (or current) one lit.
import { formatTime } from "../lib/waktu/format.js";
import { ADVISORY, ORDER, prayerLabel } from "../lib/waktu/names.js";

export default function PrayerList({ times, rows, estimate }) {
	return (
		<ol className="tv-list" aria-label="Waktu solat hari ini">
			{ORDER.map((key) => {
				const t = times[key];
				return (
					<li
						key={key}
						className="tv-row"
						data-state={rows[key]}
						data-advisory={ADVISORY.includes(key) || undefined}
					>
						<span>{prayerLabel(key, t)}</span>
						<span className="tv-row-time">
							{estimate ? "~" : ""}
							{formatTime(t)}
						</span>
					</li>
				);
			})}
		</ol>
	);
}
