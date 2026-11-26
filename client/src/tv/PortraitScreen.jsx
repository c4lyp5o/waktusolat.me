// PortraitScreen.jsx — the tall-panel screen (S4): the same answers as the
// landscape layout, stacked. Who and now at the top, the countdown, the seven
// times, then the banner. No day track: a portrait panel has no width for it.
import Banner from "./Banner.jsx";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";
import PrayerList from "./PrayerList.jsx";

export default function PortraitScreen({
	now,
	zone,
	config,
	meta,
	today,
	state,
	rows,
	estimate,
	programmes,
	notice,
}) {
	// A fragment on purpose: these four are the grid children of the view the
	// caller already renders, so the portrait CSS can place them.
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
			<Lead now={now} state={state} />
			<PrayerList {...rows} estimate={estimate} />
			<Banner programmes={programmes} now={now} />
		</>
	);
}
