// MalamScreen.jsx — draft TV 02: the seven times as one quiet column beside
// the countdown, the banner along the foot. Reuses Header, Lead, PrayerList
// and Banner, so every state (iqamah, solat, after-isyak, estimate) behaves
// exactly as on the other layouts.
import Banner from "./Banner.jsx";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";
import PrayerList from "./PrayerList.jsx";

export default function MalamScreen({
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
			<PrayerList {...rows} estimate={estimate} jawi now={now} />
			<Lead now={now} state={state} />
			<Banner programmes={programmes} now={now} />
		</>
	);
}
