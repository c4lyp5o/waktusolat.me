// Lead.jsx — the screen's answer: how long until the next prayer or iqamah.
import { m, useReducedMotion } from "motion/react";
import { formatCountdown, formatTime } from "./lib/format.js";

const HEADLINE = {
	countdown: (label) => label,
	iqamah: (label) => `Iqamah ${label}`,
	"after-isyak": (label) => `${label} esok`,
};

export default function Lead({ now, state }) {
	const approx = state.estimate ? "~" : "";
	const reduce = useReducedMotion();
	// A new state or prayer remounts the lead, so the change is seen from
	// across the hall: a fade and a short rise (fade only with reduced motion).
	return (
		<m.section
			key={`${state.kind}:${state.prayer}`}
			className="tv-lead"
			aria-live="off"
			initial={{ opacity: 0, y: reduce ? 0 : "2vh" }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.7, ease: "easeOut" }}
		>
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
		</m.section>
	);
}
