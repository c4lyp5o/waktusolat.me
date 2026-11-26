// PapanScreen.jsx — the board layout (S5): masthead, one huge answer, the
// seven times as columns, the banner band. Reuses Header, Lead and Banner, so
// iqamah, solat, after-isyak and programme cards behave exactly as elsewhere.
import Banner from "./Banner.jsx";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";
import PrayerList from "./PrayerList.jsx";

export default function PapanScreen({
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
			<Lead now={now} state={state} />
			<PrayerList {...rows} estimate={estimate} jawi now={now} />
			<Banner programmes={programmes} now={now} />
		</>
	);
}
