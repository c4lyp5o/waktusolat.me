// ProgramScreen.jsx — draft TV 08: the answer over the day's grid on the left,
// the week's programmes on the right, a foot with the source. Header and Lead
// are shared; the grid and the sheet are this layout's own.
import { formatTime } from "../lib/waktu/format.js";
import { whenLine } from "../lib/waktu/mosqueTv.js";
import { ADVISORY, ORDER, prayerLabel } from "../lib/waktu/names.js";
import Header from "./Header.jsx";
import Lead from "./Lead.jsx";

// "Malam ini · selepas Maghrib (7:01 malam)" -> the day, then the rest.
function splitWhen(item, now) {
	const [head, ...rest] = whenLine(item, now).split(" · ");
	return { head, rest: rest.join(" · ") };
}

export default function ProgramScreen({
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
	besokSyuruk = null,
}) {
	const { times, rows: marks } = rows;
	// What is on the wall: the next three, and a note if the mosque wrote one.
	const list = programmes.slice(0, 3);
	const note = list.find((p) => p.programme?.note)?.programme.note ?? null;
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
			<div className="tv-program-left">
				<Lead now={now} state={state} />
				<ol className="tv-prog-grid" aria-label="Waktu solat hari ini">
					{ORDER.map((key) => (
						<li
							key={key}
							className="tv-prog-cell"
							data-state={marks[key]}
							data-advisory={ADVISORY.includes(key) || undefined}
						>
							<span>{prayerLabel(key, times[key])}</span>
							<b>
								{estimate ? "~" : ""}
								{formatTime(times[key])}
							</b>
						</li>
					))}
					{besokSyuruk != null && (
						<li className="tv-prog-cell" data-advisory>
							<span>Syuruk esok</span>
							<b>{formatTime(besokSyuruk)}</b>
						</li>
					)}
				</ol>
			</div>

			<aside className="tv-prog-sheet" aria-label="Program minggu ini">
				<div className="tv-prog-sheet-head">
					<b>Program minggu ini</b>
					<span>Mengikut waktu solat</span>
				</div>
				{list.length === 0 ? (
					<p className="tv-prog-empty">
						Tiada program dijadualkan minggu ini. Sila hubungi pihak masjid untuk maklumat lanjut.
					</p>
				) : (
					<ol>
						{list.map((p) => {
							const when = splitWhen(p, now);
							const prog = p.programme ?? {};
							return (
								<li key={p.key} className="tv-prog-item">
									<p className="tv-prog-when">
										<b>{when.head}</b>
										{when.rest && <span>{when.rest}</span>}
									</p>
									<p className="tv-prog-title">{prog.title}</p>
									{(prog.speaker || prog.note) && (
										<p className="tv-prog-who">
											{[prog.speaker, prog.note].filter(Boolean).join(" · ")}
										</p>
									)}
								</li>
							);
						})}
					</ol>
				)}
				{note && <p className="tv-prog-note">{note}</p>}
			</aside>

			<footer className="tv-foot">
				<span>JAKIM · Waktu Malaysia</span>
				<span>
					{config.nama} · {zone.toUpperCase()}
				</span>
			</footer>
		</>
	);
}
