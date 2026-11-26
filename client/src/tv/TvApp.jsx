// TvApp.jsx — /tv/:zone, the mosque TV display (SPEC-tv-display.md), and
// TvScreen, the same screen for a registered mosque (MosqueTv.jsx, /m/:id).
//
// Lazy-loaded from App.jsx, outside the site's Navbar. Everything shown is
// derived each second from server-corrected time (useNow), the zone's cached
// year (useYear) and the config: the URL's here, the mosque's on /m/:id.
// Bricolage Grotesque is bundled site-wide in main.jsx.
import "./tv.css";
import "./layouts/ellipse.js";
import "./layouts/dail-layout.js";
import "./layouts/jalur-layout.js";
import "./layouts/kaca-layout.js";
import "./layouts/program-layout.js";
import "./layouts/sorotan-layout.js";
import "./layouts/senyap-layout.js";
import "./layouts/malam-layout.js";
import "./layouts/papan-layout.js";
import "./layouts/potret.js";
import "./themes/langit.css";
import { AnimatePresence, domAnimation, LazyMotion, m } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { DEFAULT_TEMA, temaById } from "../../../shared/temas.js";
import { parseConfig } from "../lib/waktu/config.js";
import { liveProgrammes } from "../lib/waktu/mosqueTv.js";
import { dayFor, nextDay } from "../lib/waktu/rows.js";
import { listRows, screenState } from "../lib/waktu/schedule.js";
import { skyPhase } from "../lib/waktu/sky.js";
import Banner from "./Banner.jsx";
import DailScreen from "./DailScreen.jsx";
import DayTrack from "./DayTrack.jsx";
import Header from "./Header.jsx";
import JalurScreen from "./JalurScreen.jsx";
import KacaScreen from "./KacaScreen.jsx";
import { cacheAssets, useKiosk } from "./kiosk.js";
import Lead from "./Lead.jsx";
import MalamScreen from "./MalamScreen.jsx";
import PapanScreen from "./PapanScreen.jsx";
import PortraitScreen from "./PortraitScreen.jsx";
import PrayerList from "./PrayerList.jsx";
import ProgramScreen from "./ProgramScreen.jsx";
import SenyapScreen from "./SenyapScreen.jsx";
import { Message, SolatNotice } from "./SolatNotice.jsx";
import SorotanScreen from "./SorotanScreen.jsx";
import { useNow, useSurface, useYear } from "./useTv.js";

export default function TvApp() {
	const zone = useParams().zone.toLowerCase();
	const config = useMemo(
		() => parseConfig(new URLSearchParams(window.location.search), import.meta.env.MODE),
		[],
	);
	return <TvScreen zone={zone} config={config} />;
}

// Full-screen TV: no page scroll, true black behind everything.
function useTvMode() {
	useEffect(() => {
		document.documentElement.classList.add("tv-mode");
		return () => document.documentElement.classList.remove("tv-mode");
	}, []);
}

// Langit is in this chunk; the other themes bring their own fonts, so each
// is a chunk of its own, loaded only by a screen that uses it.
const THEMES = {
	takwim: () => import("./themes/takwim.js"),
	papan: () => import("./themes/papan.js"),
	malam: () => import("./themes/malam.js"),
	jalur: () => import("./themes/jalur.js"),
	dail: () => import("./themes/dail.js"),
	kaca: () => import("./themes/kaca.js"),
	program: () => import("./themes/program.js"),
	sorotan: () => import("./themes/sorotan.js"),
	senyap: () => import("./themes/senyap.js"),
};

// The theme to paint: the chosen one once its chunk is in, Langit until then
// (and for good if it fails to load), so the screen is never unstyled.
function useTheme(tema) {
	const [loaded, setLoaded] = useState(() => new Set(["langit"]));
	useEffect(() => {
		if (loaded.has(tema) || !THEMES[tema]) return;
		let alive = true;
		THEMES[tema]()
			.then(() => alive && setLoaded((s) => new Set(s).add(tema)))
			.catch(() => console.info(`[tv] theme ${tema} failed to load; showing langit`));
		return () => {
			alive = false;
		};
	}, [tema, loaded]);
	return loaded.has(tema) ? tema : "langit";
}

// One full-screen message before there is anything to show (/m/:id).
export function TvMessage({ title, text, tema = "langit" }) {
	useTvMode();
	return (
		<div className="tv" data-tema={tema}>
			<Message title={title} text={text} />
		</div>
	);
}

// feed: a mosque's upcoming programmes (or null); notice: a short line in
// the header (a deleted mosque).
export function TvScreen({ zone, config, feed = null, notice = null }) {
	const now = useNow(config.now);
	const { days, meta, status } = useYear(zone, now);
	const surface = useSurface();
	const drift = useKiosk(now);
	useTvMode();
	const programmes = liveProgrammes(feed, days, now);

	const found = dayFor(days, now);
	// The theme (themes/*); Langit also follows the sky over the zone.
	const tema = useTheme(config.tema ?? DEFAULT_TEMA);
	// The worker keeps the files this screen is actually using (S7): its CSS
	// chunk and that tema's fonts. Re-run when a poll switches tema, so the
	// new one is cached before the screen ever needs it offline.
	// biome-ignore lint/correctness/useExhaustiveDependencies: tema drives what cacheAssets() caches; the callback reads the document, so the linter cannot see it
	useEffect(() => {
		cacheAssets();
	}, [tema]);
	// Which layout this tema names for this screen (shared/temas.js): the
	// landscape screen and the portrait panel are different compositions.
	const temaCfg = temaById(tema);
	const layout = surface === "tvPotret" ? temaCfg.tvPortrait.layout : temaCfg.tv.layout;
	const sky = found ? skyPhase(now, found.day) : undefined;
	let body;
	let view = "message";
	if (status === "unknown-zone") {
		body = (
			<Message
				title="Zon tidak dijumpai"
				text={`Kod zon "${zone.toUpperCase()}" tiada dalam senarai JAKIM.`}
			/>
		);
	} else if (!found) {
		body = <Message title="Menunggu data waktu solat" text={zone.toUpperCase()} />;
	} else {
		const { day: today, estimate } = found;
		const state = screenState(now, today, estimate ? null : nextDay(days, today), config);
		const shown = estimate ? { ...state, estimate: true } : state;
		view = state.kind === "solat" ? "solat" : "main";
		const rows = listRows(now, today, state);
		body =
			state.kind === "solat" ? (
				<SolatNotice label={state.label} />
			) : surface === "tvPotret" ? (
				<PortraitScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
				/>
			) : layout === "senyap" ? (
				<SenyapScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					notice={notice}
				/>
			) : layout === "sorotan" ? (
				<SorotanScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					notice={notice}
				/>
			) : layout === "program" ? (
				<ProgramScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
					besokSyuruk={nextDay(days, today)?.times?.syuruk ?? null}
				/>
			) : layout === "kaca" ? (
				<KacaScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
				/>
			) : layout === "dail" ? (
				<DailScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
				/>
			) : layout === "jalur" ? (
				<JalurScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
				/>
			) : layout === "malam" ? (
				<MalamScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
				/>
			) : layout === "papan" ? (
				<PapanScreen
					now={now}
					zone={zone}
					config={config}
					meta={meta}
					today={today}
					state={shown}
					rows={rows}
					estimate={estimate}
					programmes={programmes}
					notice={notice}
				/>
			) : (
				<>
					<Header
						now={now}
						zone={zone}
						nama={config.nama}
						meta={meta}
						hijri={today.hijri}
						notice={notice}
					/>
					<main className="tv-main">
						<Lead now={now} state={shown} />
						<PrayerList {...rows} estimate={estimate} />
					</main>
					<DayTrack
						now={now}
						today={today}
						next={state.kind === "after-isyak" ? null : state.prayer}
						palette={`${tema}:${sky}`}
					/>
					<Banner programmes={programmes} now={now} />
				</>
			);
	}

	// LazyMotion + m: only the animation features used here (fades, moves),
	// not the full motion bundle.
	return (
		<LazyMotion features={domAnimation} strict>
			<div className="tv" data-tema={tema} data-layout={layout} data-sky={sky}>
				<div className="tv-drift" style={drift}>
					{/* Crossfade between views (main <-> solat <-> messages). mode="wait"
					    so the screen fades out before the next one fades in: the moment
					    after iqamah should feel like a dimming, not a cut. */}
					<AnimatePresence mode="wait">
						<m.div
							key={view}
							className={`tv-view${surface === "tvPotret" ? " tv-potret-view" : layout === "papan" ? " tv-papan-view" : layout === "malam" ? " tv-malam-view" : layout === "jalur" ? " tv-jalur-view" : layout === "dail" ? " tv-dail-view" : layout === "kaca" ? " tv-kaca-view" : layout === "program" ? " tv-program-view" : layout === "sorotan" ? " tv-sorotan-view" : layout === "senyap" ? " tv-senyap-view" : ""}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: view === "solat" ? 1.2 : 0.9, ease: "easeInOut" }}
						>
							{body}
						</m.div>
					</AnimatePresence>
				</div>
			</div>
		</LazyMotion>
	);
}
