// WeekPreview.jsx — "Minggu ini": the next 7 days as the TV will show them,
// with "selepas Maghrib" resolved to that day's real time for the zone.
import { useEffect, useState } from "react";
import { api } from "../lib/mosqueApi.js";
import { atText, dayLabel } from "../lib/programmeText.js";
import { parseYear } from "../lib/waktu/rows.js";

export default function WeekPreview({ mosqueId, zone, version }) {
	const [feed, setFeed] = useState(null);
	const [days, setDays] = useState([]);
	const [failed, setFailed] = useState(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: `version` refetches after every edit
	useEffect(() => {
		let alive = true;
		api(`/mosques/${mosqueId}/programmes/upcoming`).then((r) => {
			if (!alive) return;
			setFailed(!r.ok);
			if (r.ok) setFeed(r.data);
		});
		return () => {
			alive = false;
		};
	}, [mosqueId, version]);

	useEffect(() => {
		let alive = true;
		fetch(`/api/v1/waktusolat/week/${zone}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((body) => alive && body && setDays(parseYear(body)))
			.catch(() => {});
		return () => {
			alive = false;
		};
	}, [zone]);

	if (failed)
		return <p className="text-[17px] text-muted">Senarai minggu ini tidak dapat dimuatkan.</p>;
	if (!feed) return <p className="text-[17px] text-muted">Memuatkan…</p>;
	if (feed.items.length === 0) {
		return (
			<p className="rounded-2xl bg-surface p-5 text-[17px] text-muted">
				Tiada program dalam 7 hari ini. TV akan memaparkan ayat dan hadis.
			</p>
		);
	}

	return (
		<ol className="grid gap-3">
			{feed.items.map(({ date, at, programme: p }) => (
				<li key={`${date}-${p.id}`} className="flex items-center gap-4 rounded-2xl bg-surface p-4">
					{p.photo ? (
						<img
							src={p.photo}
							alt=""
							width="64"
							height="64"
							className="h-16 w-16 shrink-0 rounded-xl object-cover"
						/>
					) : (
						<span aria-hidden="true" className="h-16 w-16 shrink-0 rounded-xl bg-raised" />
					)}
					<div className="min-w-0">
						<p className="text-[15px] font-semibold text-accent">
							{dayLabel(date, feed.from)} ·{" "}
							{atText(
								at,
								date,
								days.find((d) => d.isoDate === date),
							)}
						</p>
						<p className="text-[17px] font-semibold text-ink">{p.title}</p>
						{p.speaker && <p className="text-[15px] text-muted">{p.speaker}</p>}
					</div>
				</li>
			))}
		</ol>
	);
}
