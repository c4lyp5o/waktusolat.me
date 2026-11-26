// SenyapScreen.jsx — draft TV 10: the quietest board. Nothing but type: the
// header whispers, the countdown is the whole room, the day sits on one rule.
import { formatCountdown, formatTime } from "../lib/waktu/format.js";
import { ORDER, prayerJawi, prayerLabel } from "../lib/waktu/names.js";
import Header from "./Header.jsx";

const KICKER = {
	countdown: (label) => `${label} dalam`,
	iqamah: () => "Iqamah",
	"after-isyak": (label) => `${label} esok`,
};

export default function SenyapScreen({
	now,
	zone,
	config,
	meta,
	today,
	state,
	rows,
	estimate,
	notice,
}) {
	const { times, rows: marks } = rows;
	const approx = estimate ? "~" : "";
	return (
		<>
			<Header
				now={now}
				zone={zone}
				nama={config.nama}
				meta={meta}
				hijri={today.hijri}
				notice={notice}
			/>
			<section className="tv-senyap-mid">
				<p className="tv-senyap-kicker">{KICKER[state.kind](state.label)}</p>
				<p className="tv-senyap-cd">{formatCountdown(state.target - now)}</p>
				<p className="tv-senyap-meta">
					<span className="tv-senyap-name">{state.label}</span>
					<span className="tv-senyap-jawi" lang="ar" dir="rtl">
						{prayerJawi(state.prayer, now)}
					</span>
					<span className="tv-senyap-times">
						azan {approx}
						<b>{formatTime(state.azan)}</b> · iqamah {approx}
						<b>{formatTime(state.iqamah)}</b>
						{estimate && " (anggaran)"}
					</span>
				</p>
			</section>
			<ol className="tv-senyap-strip" aria-label="Waktu solat hari ini">
				{ORDER.map((key) => (
					<li key={key} className="tv-senyap-cell" data-state={marks[key]}>
						<span>{prayerLabel(key, times[key])}</span>
						<b>
							{approx}
							{formatTime(times[key])}
						</b>
					</li>
				))}
			</ol>
			<footer className="tv-senyap-foot">
				<span>JAKIM · Waktu Malaysia</span>
				<span>{zone.toUpperCase()}</span>
			</footer>
		</>
	);
}
