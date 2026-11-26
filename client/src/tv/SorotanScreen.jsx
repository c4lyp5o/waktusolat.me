// SorotanScreen.jsx — draft TV 06: a black room, one warm spotlight, the
// answer lit from the front, the seven times along the floor. Header is
// shared; the middle and the strip are this layout's own (the composition is
// the opposite of Lead: the name is big, the countdown enormous).
import { formatCountdown, formatTime } from "../lib/waktu/format.js";
import { ADVISORY, ORDER, prayerJawi, prayerLabel } from "../lib/waktu/names.js";
import Header from "./Header.jsx";

const KICKER = {
	countdown: (label) => `${label} dalam`,
	iqamah: () => "Iqamah",
	"after-isyak": (label) => `${label} esok`,
};

export default function SorotanScreen({
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
			<div className="tv-spot" aria-hidden="true" />
			<Header
				now={now}
				zone={zone}
				nama={config.nama}
				meta={meta}
				hijri={today.hijri}
				notice={notice}
			/>
			<section className="tv-sorotan-mid">
				<p className="tv-sorotan-kicker">{KICKER[state.kind](state.label)}</p>
				<p className="tv-sorotan-name">
					<span>{state.label.toUpperCase()}</span>
					<span className="tv-sorotan-jawi" lang="ar" dir="rtl">
						{prayerJawi(state.prayer, now)}
					</span>
				</p>
				<p className="tv-sorotan-cd">{formatCountdown(state.target - now)}</p>
				<p className="tv-sorotan-meta">
					<span>
						Azan {approx}
						<b>{formatTime(state.azan)}</b>
					</span>
					<span>
						Iqamah {approx}
						<b>{formatTime(state.iqamah)}</b>
					</span>
					{estimate && <span>Anggaran</span>}
				</p>
			</section>
			<ol className="tv-sorotan-times" aria-label="Waktu solat hari ini">
				{ORDER.map((key) => (
					<li
						key={key}
						className="tv-sorotan-cell"
						data-state={marks[key]}
						data-advisory={ADVISORY.includes(key) || undefined}
					>
						<span>{prayerLabel(key, times[key])}</span>
						<b>
							{approx}
							{formatTime(times[key])}
						</b>
					</li>
				))}
			</ol>
		</>
	);
}
