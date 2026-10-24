// SolatNotice.jsx — full-screen states: solat in progress, and the messages
// shown instead of a blank or broken screen (unknown zone, no data yet).

export function SolatNotice({ label }) {
	return (
		<section className="tv-full tv-solat" aria-live="polite">
			<h1 className="tv-full-title">Solat {label} sedang didirikan</h1>
			<p className="tv-full-text">Sila senyapkan telefon bimbit</p>
		</section>
	);
}

export function Message({ title, text }) {
	return (
		<section className="tv-full">
			<h1 className="tv-full-title">{title}</h1>
			{text && <p className="tv-full-text">{text}</p>}
		</section>
	);
}
