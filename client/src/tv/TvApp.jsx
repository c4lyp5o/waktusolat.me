// TvApp.jsx — /tv/:zone, the mosque TV display (SPEC-tv-display.md), and
// TvScreen, the same screen for a registered mosque (MosqueTv.jsx, /m/:id).
//
// Lazy-loaded from App.jsx, outside the site's Navbar. Everything shown is
// derived each second from server-corrected time (useNow), the zone's cached
// year (useYear) and the config: the URL's here, the mosque's on /m/:id.
// Bricolage Grotesque is bundled site-wide in main.jsx.
import "./tv.css";
import "./themes/langit.css";
import { domAnimation, LazyMotion, m } from "motion/react";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { parseConfig } from "../lib/waktu/config.js";
import { liveProgrammes } from "../lib/waktu/mosqueTv.js";
import { dayFor, nextDay } from "../lib/waktu/rows.js";
import { listRows, screenState } from "../lib/waktu/schedule.js";
import { skyPhase } from "../lib/waktu/sky.js";
import Banner from "./Banner.jsx";
import DayTrack from "./DayTrack.jsx";
import Header from "./Header.jsx";
import { useKiosk } from "./kiosk.js";
import Lead from "./Lead.jsx";
import PrayerList from "./PrayerList.jsx";
import { Message, SolatNotice } from "./SolatNotice.jsx";
import { useNow, usePortrait, useYear } from "./useTv.js";

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
	const portrait = usePortrait();
	const drift = useKiosk(now);
	useTvMode();
	const programmes = liveProgrammes(feed, days, now);

	const found = dayFor(days, now);
	// The theme (themes/*.css); Langit also follows the sky over the zone.
	const tema = config.tema ?? "langit";
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
		body =
			state.kind === "solat" ? (
				<SolatNotice label={state.label} />
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
						<PrayerList {...listRows(now, today, state)} estimate={estimate} />
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
			<div className="tv" data-tema={tema} data-sky={sky}>
				<div className="tv-drift" style={drift}>
					{portrait ? (
						<PortraitNotice zone={zone} />
					) : (
						// Crossfade between views (main <-> solat <-> messages).
						<m.div
							key={view}
							className="tv-view"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.8 }}
						>
							{body}
						</m.div>
					)}
				</div>
			</div>
		</LazyMotion>
	);
}

// Landscape only (spec). A phone opening the link, e.g. while setting up the
// TV, gets a pointer to the phone page instead of a broken layout.
function PortraitNotice({ zone }) {
	return (
		<section className="tv-full tv-portrait">
			<h1 className="tv-full-title">Paparan ini untuk TV</h1>
			<p className="tv-full-text">
				Buka pautan ini pada TV dalam mod landskap, atau lihat{" "}
				<a href={`/times/${zone}`}>waktu solat {zone.toUpperCase()}</a> di telefon.
			</p>
		</section>
	);
}
