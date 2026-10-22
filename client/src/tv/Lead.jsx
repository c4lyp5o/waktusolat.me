// Lead.jsx — the screen's answer: how long until the next prayer or iqamah.
import { formatCountdown, formatTime } from "./lib/format.js";

const HEADLINE = {
	countdown: (label) => label,
	iqamah: (label) => `Iqamah ${label}`,
	"after-isyak": (label) => `${label} esok`,
};

export default function Lead({ now, state }) {
	const approx = state.estimate ? "~" : "";
	return (
		<section className="tv-lead" aria-live="off">
			<p className="tv-lead-name">
				<span className="tv-lead-prayer">{HEADLINE[state.kind](state.label)}</span>{" "}
				<span className="tv-lead-dalam">dalam</span>
			</p>
			<p className="tv-lead-count">{formatCountdown(state.target - now)}</p>
			<p className="tv-lead-meta">
				Azan {approx}
				{formatTime(state.azan)} · Iqamah {approx}
				{formatTime(state.iqamah)}
				{state.estimate && " (anggaran)"}
			</p>
			{state.secondary?.kind === "subuh-ends" && (
				<p className="tv-lead-meta">
					Waktu Subuh tamat dalam {formatCountdown(state.secondary.target - now)}
				</p>
			)}
		</section>
	);
}
