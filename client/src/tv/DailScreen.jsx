// DailScreen.jsx — draft TV 07: the day as a ring on the left, the seven
// times printed beside it with Lepas / Seterusnya in their own column. Header,
// PrayerList and Banner are shared; the ring is DayDial.
import Banner from "./Banner.jsx";
import DayDial from "../components/DayDial.jsx";
import Header from "./Header.jsx";
import PrayerList from "./PrayerList.jsx";

export default function DailScreen({
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
			<DayDial times={rows.times} now={now} state={state} variant="tv" />
			<PrayerList {...rows} estimate={estimate} jawi status now={now} />
			<Banner programmes={programmes} now={now} />
		</>
	);
}
