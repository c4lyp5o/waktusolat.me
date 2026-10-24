// TemaPicker.jsx — the mosque's TV theme (SPEC-redesign.md), as three radio
// cards, each a small drawing of the screen in that theme. The TV follows a
// saved change within a minute (its poll), with no reload.
import { LABEL } from "./ui.js";

// Colours copied from the theme files (tv/themes/*.css), for the drawing only.
const OPTIONS = [
	{
		tema: "langit",
		name: "Langit",
		note: "Warna langit semasa",
		ground: "#f0a868",
		ink: "#2b1306",
		accent: "#552300",
		sun: "#fff4dc",
		ring: "#2b1306",
	},
	{
		tema: "takwim",
		name: "Takwim",
		note: "Gelap, merah, seperti takwim",
		ground: "#121212",
		ink: "#f3efe6",
		accent: "#ff5a52",
		sun: "#ff5a52",
		ring: "none",
	},
	{
		tema: "songket",
		name: "Songket",
		note: "Hijau malam dan emas",
		ground: "#0c1c17",
		ink: "#f1ebdc",
		accent: "#d9ae55",
		sun: "#d9ae55",
		ring: "none",
	},
];

function Preview({ o }) {
	return (
		<svg viewBox="0 0 160 90" className="block w-full rounded-lg" aria-hidden="true">
			<rect width="160" height="90" fill={o.ground} />
			<rect x="10" y="12" width="30" height="5" rx="2" fill={o.accent} />
			<rect x="10" y="22" width="56" height="16" rx="3" fill={o.ink} />
			{[12, 20, 28, 36, 44].map((y, i) => (
				<rect
					key={y}
					x="100"
					y={y}
					width="50"
					height="5"
					rx="2"
					fill={i === 3 ? o.accent : o.ink}
					opacity={i === 3 ? 1 : 0.55}
				/>
			))}
			<path d="M 22 74 Q 80 46 138 74" fill="none" stroke={o.ink} strokeOpacity="0.5" />
			<circle cx="112" cy="64" r="4" fill={o.sun} stroke={o.ring} strokeWidth="1" />
		</svg>
	);
}

export default function TemaPicker({ value, onChange }) {
	return (
		<fieldset className="m-0 border-0 p-0">
			<legend className={LABEL}>Tema paparan TV</legend>
			<div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
				{OPTIONS.map((o) => (
					<label
						key={o.tema}
						className="cursor-pointer rounded-2xl bg-surface p-1.5 sm:p-2 ring-line transition-shadow has-[:checked]:ring-2 has-[:checked]:ring-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent"
					>
						<input
							type="radio"
							name="tema"
							value={o.tema}
							checked={value === o.tema}
							onChange={() => onChange(o.tema)}
							className="sr-only"
						/>
						<Preview o={o} />
						<span className="mt-2 block px-1 pb-1 text-[15px] font-semibold sm:pb-0 sm:text-[17px]">
							{o.name}
						</span>
						<span className="hidden px-1 pb-1 text-[15px] text-muted sm:block">{o.note}</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
