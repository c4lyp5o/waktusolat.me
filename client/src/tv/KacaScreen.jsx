// KacaScreen.jsx — draft TV 05/04: the photograph covers the wall, a veil
// quiets it, the answer sits on the glass and the day is printed in a panel.
// Header, Lead, PrayerList and Banner are shared; only the photo and the panel
// are this layout's own.
import photo from "../assets/kaca.webp";
import Banner from "./Banner.jsx";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";
import PrayerList from "./PrayerList.jsx";

export default function KacaScreen({
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
			{/* Decorative: the picture carries no information the text does not. */}
			<img className="tv-photo" src={photo} alt="" aria-hidden="true" />
			<div className="tv-veil" aria-hidden="true" />
			<Header
				now={now}
				zone={zone}
				nama={config.nama}
				meta={meta}
				hijri={today.hijri}
				notice={notice}
			/>
			<Lead now={now} state={state} />
			<div className="tv-kaca-panel">
				<div className="tv-kaca-head">
					<span>Waktu hari ini</span>
					<span>{today.hijri}</span>
				</div>
				<PrayerList {...rows} estimate={estimate} jawi status now={now} />
			</div>
			<Banner programmes={programmes} now={now} />
		</>
	);
}
