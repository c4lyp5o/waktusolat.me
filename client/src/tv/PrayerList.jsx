// PrayerList.jsx — today's seven times, the next (or current) one lit.
// `jawi` adds the Arabic name under the label (the board layout asks for it);
// `status` adds the printed word (Lepas / Seterusnya) the Dail layout puts in
// its own column. Without either, the markup is exactly what the other
// layouts have always had.
import { formatTime } from "../lib/waktu/format.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../lib/waktu/names.js";

const STATUS = { past: "Lepas", next: "Seterusnya", current: "Sedang" };

export default function PrayerList({
	times,
	rows,
	estimate,
	jawi = false,
	status = false,
	now = 0,
}) {
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
						{jawi && (
							<span className="tv-row-jawi" lang="ar" dir="rtl">
								{prayerJawi(key, now)}
							</span>
						)}
						{status && <span className="tv-row-status">{STATUS[rows[key]] ?? ""}</span>}
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
