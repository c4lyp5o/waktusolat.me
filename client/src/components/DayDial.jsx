// DayDial.jsx — the day as a ring (drafts 06/07): the arc shows how much of
// the day has gone, the hub answers the question (prayer, countdown, azan),
// and the two prayers either side of the next one sit at the hub's shoulders.
//
// One component for the phone page and the board: `variant` changes the size
// only; the maths is lib/waktu/ribbon.js, so the arc and the ribbon agree.
import { dayPercent } from "../lib/waktu/ribbon.js";
import { formatCountdown, formatTime } from "../lib/waktu/format.js";
import { ORDER, prayerJawi } from "../lib/waktu/names.js";

function neighbour(times, now, direction) {
	const keys = ORDER.filter((k) => times[k] !== undefined);
	const past = keys.filter((k) => times[k] <= now);
	const ahead = keys.filter((k) => times[k] > now);
	const key = direction === "prev" ? past.at(-1) : ahead.at(1);
	return key ? { key, time: times[key] } : null;
}

export default function DayDial({ times, now, state, variant = "web" }) {
	const pct = dayPercent(now);
	const prev = neighbour(times, now, "prev");
	const nextNext = neighbour(times, now, "next");
	const iqamah = state.iqamah && state.iqamah !== state.azan ? state.iqamah : null;

	return (
		<div className={`dial dial-${variant}`} role="img" aria-label="Kitaran hari ini">
			<div className="dial-ring" style={{ "--dial-pct": `${pct}%` }} />
			<div className="dial-hub">
				<span className="dial-k">
					{state.kind === "after-isyak" ? `${state.label} esok` : `Seterusnya · ${state.label}`}
				</span>
				<span className="dial-name">
					{state.label}
					<span className="dial-jawi" lang="ar" dir="rtl">
						{prayerJawi(state.prayer, state.azan)}
					</span>
				</span>
				<span className="dial-count">
					{formatCountdown(state.target - now)}
				</span>
				<span className="dial-meta">
					Azan {state.estimate ? "~" : ""}
					{formatTime(state.azan)}
					{iqamah ? ` · Iqamah ${formatTime(state.iqamah)}` : ""}
				</span>
			</div>
			{prev && (
				<span className="dial-mark dial-mark-left">
					{prev.key.toUpperCase()} {formatTime(prev.time)}
				</span>
			)}
			{nextNext && (
				<span className="dial-mark dial-mark-right">
					{nextNext.key.toUpperCase()} {formatTime(nextNext.time)}
				</span>
			)}
			<span className="sr-only">
				{Math.round(pct)}% hari ini telah berlalu. Baki {formatCountdown(state.target - now)}.
			</span>
		</div>
	);
}
