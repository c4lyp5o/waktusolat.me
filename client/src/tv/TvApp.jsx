// TvApp.jsx — /tv/:zone, the mosque TV display (SPEC-tv-display.md).
//
// Lazy-loaded from App.jsx, outside the site's Navbar. Everything shown is
// derived each second from three inputs: server-corrected time (useNow),
// the zone's cached year (useYear) and the URL config.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./tv.css";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";
import { parseConfig } from "./lib/config.js";
import { dayFor, nextDay } from "./lib/rows.js";
import { rowStates, screenState } from "./lib/schedule.js";
import PrayerList from "./PrayerList.jsx";
import { Message, SolatNotice } from "./SolatNotice.jsx";
import { useNow, usePortrait, useYear } from "./useTv.js";

export default function TvApp() {
	const zone = useParams().zone.toLowerCase();
	const config = useMemo(
		() => parseConfig(new URLSearchParams(window.location.search), import.meta.env.MODE),
		[],
	);
	const now = useNow(config.now);
	const { days, meta, status } = useYear(zone, now);
	const portrait = usePortrait();

	// Full-screen TV: no page scroll, true black behind everything.
	useEffect(() => {
		document.documentElement.classList.add("tv-mode");
		return () => document.documentElement.classList.remove("tv-mode");
	}, []);

	const found = dayFor(days, now);
	let body;
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
		body =
			state.kind === "solat" ? (
				<SolatNotice label={state.label} />
			) : (
				<>
					<Header now={now} zone={zone} nama={config.nama} meta={meta} hijri={today.hijri} />
					<main className="tv-main">
						<Lead now={now} state={shown} />
						<PrayerList today={today} rows={rowStates(now, today, state)} estimate={estimate} />
					</main>
				</>
			);
	}

	return <div className="tv">{portrait ? <PortraitNotice zone={zone} /> : body}</div>;
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
