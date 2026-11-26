// TemaPicker.jsx — the mosque's TV tema, as radio cards. Each card draws both
// screens the tema owns: the landscape TV and the tall panel, straight from the
// layouts named in the registry (shared/temas.js). A new tema appears here the
// day it is registered, and a tema that changes layout changes its drawing.
// The TV follows a saved change within a minute (its poll), with no reload.
import { TEMAS } from "../../../shared/temas.js";
import { LABEL } from "./ui.js";

// The sky colour is Langit's own (it changes with the hour); the drawing just
// needs something warm. Everything else comes from the registry swatch.
const SUN = {
	langit: "#fff4dc",
	takwim: "#ff5a52",
	malam: "#e0ab5f",
	jalur: "#d9a35e",
	papan: "#d9ae63",
};

// ---- landscape screen (16:9) -------------------------------------------

function EllipseLandscape({ o, sun }) {
	return (
		<>
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
			<circle cx="112" cy="64" r="4" fill={sun} stroke={o.ink} strokeWidth="1" />
		</>
	);
}

function BoardLandscape({ o, sun }) {
	return (
		<>
			{/* masthead, clock and the one big number */}
			<rect x="10" y="10" width="46" height="5" rx="2" fill={o.accent} />
			<rect x="132" y="9" width="18" height="6" rx="2" fill={o.ink} opacity="0.85" />
			<rect x="10" y="24" width="26" height="4" rx="2" fill={o.ink} opacity="0.6" />
			<rect x="10" y="32" width="42" height="15" rx="2" fill={o.ink} />
			<rect x="126" y="32" width="24" height="15" rx="2" fill={sun} opacity="0.9" />
			{/* seven columns, the next one gold */}
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<g key={i}>
					<rect
						x={10 + i * 20.5}
						y="58"
						width="14"
						height="3"
						rx="1.5"
						fill={o.ink}
						opacity="0.45"
					/>
					<rect
						x={10 + i * 20.5}
						y="64"
						width="14"
						height="6"
						rx="1.5"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.8}
					/>
				</g>
			))}
			<rect x="10" y="78" width="140" height="1" fill={o.accent} opacity="0.4" />
			<rect x="10" y="82" width="96" height="3" rx="1.5" fill={o.ink} opacity="0.35" />
		</>
	);
}

function MalamLandscape({ o }) {
	return (
		<>
			<rect x="10" y="10" width="44" height="5" rx="2" fill={o.ink} opacity="0.9" />
			<rect x="132" y="9" width="18" height="5" rx="2" fill={o.ink} opacity="0.7" />
			{/* the rail on the left, the countdown holding the right */}
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<g key={i}>
					<rect
						x="10"
						y={24 + i * 8}
						width="20"
						height="2.5"
						rx="1"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.4}
					/>
					<rect
						x="52"
						y={24 + i * 8}
						width="13"
						height="2.5"
						rx="1"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.55}
					/>
				</g>
			))}
			<rect x="86" y="34" width="26" height="3" rx="1.5" fill={o.accent} />
			<rect x="86" y="41" width="62" height="15" rx="2" fill={o.ink} />
			<rect x="86" y="60" width="40" height="3" rx="1.5" fill={o.ink} opacity="0.5" />
			<rect x="10" y="80" width="140" height="1" fill={o.ink} opacity="0.14" />
		</>
	);
}

function JalurLandscape({ o }) {
	return (
		<>
			<defs>
				<linearGradient id="jalur-band" x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stopColor="#0a1424" />
					<stop offset="0.24" stopColor="#8c6067" />
					<stop offset="0.29" stopColor="#f2c78e" />
					<stop offset="0.32" stopColor="#cfe5f0" />
					<stop offset="0.64" stopColor="#c6e1ee" />
					<stop offset="0.79" stopColor="#efa968" />
					<stop offset="0.84" stopColor="#24293f" />
					<stop offset="1" stopColor="#0a1424" />
				</linearGradient>
			</defs>
			<rect x="10" y="10" width="44" height="5" rx="2" fill={o.ink} opacity="0.9" />
			<rect x="132" y="9" width="18" height="5" rx="2" fill={o.ink} opacity="0.7" />
			<rect x="10" y="24" width="26" height="3.5" rx="1.5" fill={o.accent} />
			<rect x="10" y="31" width="76" height="17" rx="2" fill={o.ink} />
			<rect x="112" y="33" width="38" height="3" rx="1.5" fill={o.ink} opacity="0.5" />
			<rect x="112" y="39" width="30" height="3" rx="1.5" fill={o.accent} opacity="0.8" />
			{/* the day band, with its five marks */}
			<rect x="10" y="58" width="140" height="8" rx="4" fill="url(#jalur-band)" />
			{[24, 54, 68, 79, 88].map((x, i) => (
				<g key={x}>
					<rect x={x * 1.6 - 0.5} y="68" width="1" height="3" fill={o.ink} opacity="0.5" />
					<rect
						x={x * 1.6 - 4}
						y={i % 2 === 0 ? 72 : 77}
						width="8"
						height="2"
						rx="1"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 1 : 0.55}
					/>
				</g>
			))}
			<rect x="10" y="84" width="140" height="1" fill={o.ink} opacity="0.12" />
		</>
	);
}

function DailLandscape({ o }) {
	return (
		<>
			<rect x="10" y="10" width="44" height="5" rx="2" fill={o.ink} opacity="0.9" />
			<rect x="132" y="9" width="18" height="5" rx="2" fill={o.ink} opacity="0.7" />
			{/* the ring, its arc at roughly half the day */}
			<circle
				cx="44"
				cy="55"
				r="24"
				fill="none"
				stroke={o.ink}
				strokeOpacity="0.12"
				strokeWidth="5"
			/>
			<circle
				cx="44"
				cy="55"
				r="24"
				fill="none"
				stroke={o.accent}
				strokeWidth="5"
				strokeDasharray="75 151"
				transform="rotate(-90 44 55)"
			/>
			<rect x="32" y="44" width="24" height="4" rx="1.5" fill={o.ink} opacity="0.7" />
			<rect x="26" y="52" width="36" height="9" rx="2" fill={o.ink} />
			<rect x="33" y="65" width="22" height="3" rx="1.5" fill={o.ink} opacity="0.45" />
			{/* the printed list */}
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<g key={i}>
					<rect
						x="84"
						y={18 + i * 9}
						width="30"
						height="3"
						rx="1.5"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.55}
					/>
					<rect
						x="132"
						y={18 + i * 9}
						width="18"
						height="3"
						rx="1.5"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.75}
					/>
				</g>
			))}
			<rect x="84" y="14" width="66" height="1" fill={o.ink} opacity="0.35" />
			<rect x="10" y="84" width="140" height="1" fill={o.ink} opacity="0.2" />
		</>
	);
}

function KacaLandscape({ o }) {
	return (
		<>
			<defs>
				<linearGradient id="kaca-photo" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0" stopColor="#12314f" />
					<stop offset="0.55" stopColor="#1d4a6b" />
					<stop offset="1" stopColor="#0b1a24" />
				</linearGradient>
			</defs>
			{/* the photograph, dimmed by its veil */}
			<rect width="160" height="90" fill="url(#kaca-photo)" />
			<rect width="160" height="90" fill="#04100c" opacity="0.5" />
			<circle cx="112" cy="34" r="13" fill="#f0d9a8" opacity="0.18" />
			<rect x="10" y="10" width="44" height="5" rx="2" fill={o.ink} opacity="0.95" />
			<rect x="132" y="9" width="18" height="5" rx="2" fill={o.ink} opacity="0.8" />
			{/* hero on the glass */}
			<rect x="10" y="30" width="20" height="3" rx="1.5" fill={o.accent} />
			<rect x="10" y="38" width="54" height="15" rx="2" fill={o.ink} opacity="0.92" />
			{/* the panel */}
			<rect
				x="88"
				y="24"
				width="62"
				height="60"
				rx="5"
				fill="#0a120f"
				opacity="0.62"
				stroke={o.ink}
				strokeOpacity="0.2"
			/>
			{[0, 1, 2, 3, 4].map((i) => (
				<g key={i}>
					<rect
						x="94"
						y={32 + i * 10}
						width="22"
						height="3"
						rx="1.5"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 1 : 0.55}
					/>
					<rect
						x="126"
						y={32 + i * 10}
						width="18"
						height="3"
						rx="1.5"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 1 : 0.75}
					/>
				</g>
			))}
		</>
	);
}

function ProgramLandscape({ o }) {
	const cells = [0, 1, 2, 3, 4, 5, 6, 7];
	return (
		<>
			<rect x="10" y="10" width="46" height="4" rx="2" fill={o.accent} />
			<rect x="132" y="9" width="18" height="5" rx="2" fill={o.ink} opacity="0.85" />
			{/* the answer, then the day's grid */}
			<rect x="10" y="22" width="14" height="3" rx="1.5" fill={o.accent} />
			<rect x="10" y="29" width="36" height="10" rx="2" fill={o.ink} opacity="0.9" />
			{cells.map((i) => (
				<g key={i}>
					<rect
						x={10 + (i % 4) * 20}
						y={46 + Math.floor(i / 4) * 19}
						width="19"
						height="18"
						fill={i === 5 ? o.accent : "none"}
						fillOpacity={i === 5 ? 0.16 : 0}
						stroke={o.ink}
						strokeOpacity="0.2"
					/>
					<rect
						x={12 + (i % 4) * 20}
						y={50 + Math.floor(i / 4) * 19}
						width="9"
						height="2"
						rx="1"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.45}
					/>
					<rect
						x={12 + (i % 4) * 20}
						y={55 + Math.floor(i / 4) * 19}
						width="13"
						height="4"
						rx="1"
						fill={i === 5 ? o.accent : o.ink}
						opacity={i === 5 ? 1 : 0.8}
					/>
				</g>
			))}
			{/* the week's programmes */}
			<rect
				x="94"
				y="22"
				width="56"
				height="62"
				rx="2"
				fill={o.ink}
				fillOpacity="0.07"
				stroke={o.ink}
				strokeOpacity="0.2"
			/>
			<rect x="98" y="27" width="26" height="3" rx="1.5" fill={o.accent} />
			{[0, 1, 2].map((i) => (
				<g key={i}>
					<rect
						x="98"
						y={38 + i * 15}
						width="1.5"
						height="11"
						fill={o.accent}
						opacity={i === 0 ? 1 : 0.45}
					/>
					<rect x="102" y={38 + i * 15} width="14" height="2" rx="1" fill={o.ink} opacity="0.5" />
					<rect x="102" y={42 + i * 15} width="34" height="3" rx="1" fill={o.ink} opacity="0.85" />
				</g>
			))}
			<rect x="10" y="84" width="140" height="1" fill={o.ink} opacity="0.2" />
		</>
	);
}

function SorotanLandscape({ o }) {
	return (
		<>
			<defs>
				<radialGradient id="sorotan-glow">
					<stop offset="0" stopColor={o.accent} stopOpacity="0.22" />
					<stop offset="0.5" stopColor={o.accent} stopOpacity="0.07" />
					<stop offset="1" stopColor={o.accent} stopOpacity="0" />
				</radialGradient>
			</defs>
			<ellipse cx="80" cy="34" rx="52" ry="34" fill="url(#sorotan-glow)" />
			<rect x="10" y="9" width="40" height="3" rx="1.5" fill={o.ink} opacity="0.6" />
			<rect x="126" y="9" width="24" height="3" rx="1.5" fill={o.ink} opacity="0.4" />
			{/* kicker, name, the huge countdown */}
			<rect x="62" y="24" width="16" height="2" rx="1" fill={o.accent} />
			<rect x="56" y="29" width="48" height="5" rx="1.5" fill={o.ink} opacity="0.9" />
			<rect x="34" y="38" width="92" height="22" rx="3" fill={o.ink} opacity="0.95" />
			<rect x="58" y="64" width="44" height="2" rx="1" fill={o.ink} opacity="0.45" />
			{/* the floor strip */}
			<rect x="10" y="76" width="140" height="1" fill={o.ink} opacity="0.16" />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<g key={i}>
					<rect
						x={10 + i * 20}
						y={81}
						width="12"
						height="1.5"
						rx="0.7"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 1 : 0.35}
					/>
					<rect
						x={10 + i * 20}
						y={85}
						width="15"
						height="3"
						rx="1"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 1 : 0.75}
					/>
				</g>
			))}
		</>
	);
}

function SenyapLandscape({ o }) {
	return (
		<>
			<rect x="10" y="9" width="34" height="4" rx="2" fill={o.ink} opacity="0.85" />
			<rect x="126" y="9" width="24" height="3" rx="1.5" fill={o.muted ?? o.ink} opacity="0.35" />
			{/* nothing but the number */}
			<rect x="62" y="26" width="18" height="2" rx="1" fill={o.ink} opacity="0.3" />
			<rect x="22" y="34" width="116" height="26" rx="3" fill={o.ink} opacity="0.95" />
			<rect x="52" y="66" width="34" height="3" rx="1.5" fill={o.ink} opacity="0.7" />
			<rect x="90" y="66" width="18" height="3" rx="1.5" fill={o.accent} opacity="0.8" />
			<rect x="10" y="76" width="140" height="1" fill={o.ink} opacity="0.12" />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<g key={i}>
					<rect
						x={15 + i * 20}
						y={81}
						width="10"
						height="1.5"
						rx="0.7"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 0.9 : 0.22}
					/>
					<rect
						x={12 + i * 20}
						y={85}
						width="16"
						height="3.5"
						rx="1"
						fill={i === 3 ? o.accent : o.ink}
						opacity={i === 3 ? 1 : 0.45}
					/>
				</g>
			))}
			<rect x="10" y="93" width="22" height="1.5" rx="0.7" fill={o.ink} opacity="0.15" />
			<rect x="138" y="93" width="12" height="1.5" rx="0.7" fill={o.ink} opacity="0.15" />
		</>
	);
}

function Landscape({ tema }) {
	const o = tema.swatch;
	const sun = SUN[tema.id] ?? o.accent;
	const layout = tema.tv.layout;
	return (
		<svg
			viewBox="0 0 160 90"
			className="block w-full rounded-md"
			aria-hidden="true"
			data-screen="landscape"
		>
			<rect width="160" height="90" fill={o.ground} />
			{layout === "papan" ? (
				<BoardLandscape o={o} sun={sun} />
			) : layout === "malam" ? (
				<MalamLandscape o={o} />
			) : layout === "jalur" ? (
				<JalurLandscape o={o} />
			) : layout === "dail" ? (
				<DailLandscape o={o} />
			) : layout === "kaca" ? (
				<KacaLandscape o={o} />
			) : layout === "program" ? (
				<ProgramLandscape o={o} />
			) : layout === "sorotan" ? (
				<SorotanLandscape o={o} />
			) : layout === "senyap" ? (
				<SenyapLandscape o={o} />
			) : (
				<EllipseLandscape o={o} sun={sun} />
			)}
		</svg>
	);
}

// ---- tall panel (9:16) --------------------------------------------------
// Every registered tema names the "potret" composition today, so one drawing:
// masthead, the countdown, the stacked times, the banner. Keyed on the layout
// name, so a tema that picks another tall layout is not drawn wrongly.

function PotretPortrait({ o }) {
	return (
		<>
			<rect x="7" y="7" width="26" height="4" rx="2" fill={o.accent} />
			<rect x="58" y="7" width="25" height="4" rx="2" fill={o.ink} opacity="0.8" />
			<rect x="7" y="14" width="40" height="3" rx="1.5" fill={o.ink} opacity="0.4" />
			<rect x="7" y="26" width="30" height="4" rx="2" fill={o.ink} opacity="0.6" />
			<rect x="7" y="34" width="60" height="12" rx="2" fill={o.ink} opacity="0.9" />
			{[0, 1, 2, 3, 4, 5, 6].map((i) => (
				<rect
					key={i}
					x="7"
					y={54 + i * 9}
					width="76"
					height="6"
					rx="2"
					fill={i === 5 ? o.accent : o.ink}
					opacity={i === 5 ? 0.95 : 0.35}
				/>
			))}
			<rect x="7" y="122" width="76" height="1" fill={o.accent} opacity="0.4" />
			<rect x="7" y="128" width="76" height="20" rx="2" fill={o.ink} opacity="0.18" />
		</>
	);
}

function Portrait({ tema }) {
	const o = tema.swatch;
	return (
		<svg
			viewBox="0 0 90 160"
			className="block h-full w-full rounded-md"
			aria-hidden="true"
			data-screen="portrait"
		>
			<rect width="90" height="160" fill={o.ground} />
			{tema.tvPortrait.layout === "potret" ? (
				<PotretPortrait o={o} />
			) : (
				<rect x="7" y="7" width="76" height="146" rx="3" fill={o.ink} opacity="0.25" />
			)}
		</svg>
	);
}

export default function TemaPicker({ value, onChange }) {
	return (
		<fieldset className="m-0 border-0 p-0">
			<legend className={LABEL}>Tema paparan TV</legend>
			<p className="mt-1 text-[14px] text-muted">
				Setiap tema melukis dua skrin: TV melintang dan panel menegak.
			</p>
			<div className="mt-2 grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
				{TEMAS.map((tema) => (
					<label
						key={tema.id}
						className="cursor-pointer rounded-2xl bg-surface p-1.5 ring-line transition-shadow has-[:checked]:ring-2 has-[:checked]:ring-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent sm:p-2"
					>
						<input
							type="radio"
							name="tema"
							value={tema.id}
							checked={value === tema.id}
							onChange={() => onChange(tema.id)}
							className="sr-only"
						/>
						<span className="flex items-stretch gap-1.5">
							<span className="w-[64%]">
								<Landscape tema={tema} />
							</span>
							<span className="flex-1">
								<Portrait tema={tema} />
							</span>
						</span>
						<span className="mt-2 block px-1 text-[15px] font-semibold sm:text-[17px]">
							{tema.name}
						</span>
						<span className="mt-0.5 block px-1 pb-1 text-[14px] leading-snug text-muted">
							{tema.note}
						</span>
					</label>
				))}
			</div>
		</fieldset>
	);
}
