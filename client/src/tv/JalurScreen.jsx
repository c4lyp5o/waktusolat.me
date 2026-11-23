// JalurScreen.jsx — draft TV 03: the answer across the middle with the
// countdown as the widest thing on the wall, the day as one band underneath.
// Header, Lead and Banner are the shared components; the band is DayRibbon.
import Banner from "./Banner.jsx";
import DayRibbon from "../components/DayRibbon.jsx";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";

export default function JalurScreen({
	now,
	zone,
	config,
	meta,
	today,
	state,
	rows,
	programmes,
	notice,
}) {
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
			<DayRibbon times={rows.times} now={now} variant="tv" />
			<Banner programmes={programmes} now={now} />
		</>
	);
}
