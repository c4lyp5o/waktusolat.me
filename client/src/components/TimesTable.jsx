// TimesTable.jsx — the week or month of a zone, as a table. Used by the sky
// page and by the almanak page (it only uses palette tokens, no sky colours).
import { useState } from "react";
import useSWR from "swr";
import { formatDate, formatTime } from "../lib/waktu/format.js";
import { prayerLabel } from "../lib/waktu/names.js";
import { fetchDays } from "./useZoneSky.js";

const TABLE_KEYS = ["subuh", "syuruk", "zohor", "asar", "maghrib", "isyak"];

export default function TimesTable({ zone, todayIso, className = "mt-14" }) {
	const [period, setPeriod] = useState("week");
	const { data: days, error } = useSWR(`/api/v1/waktusolat/${period}/${zone}`, fetchDays);
	return (
		<section aria-labelledby="table-title" className={className}>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h2 id="table-title" className="text-xl font-semibold">
					{period === "week" ? "Minggu ini" : "Bulan ini"}
				</h2>
				<fieldset className="m-0 flex rounded-full border-0 bg-raised p-1">
					<legend className="sr-only">Tempoh</legend>
					{[
						["week", "Minggu"],
						["month", "Bulan"],
					].map(([p, label]) => (
						<button
							key={p}
							type="button"
							onClick={() => setPeriod(p)}
							aria-pressed={period === p}
							className={`rounded-full px-4 py-1.5 text-[15px] ${
								period === p ? "bg-surface font-semibold text-ink" : "text-faint hover:text-ink"
							}`}
						>
							{label}
						</button>
					))}
				</fieldset>
			</div>
			{error ? (
				<p className="mt-4 text-muted">Jadual tidak dapat dimuatkan. Cuba sebentar lagi.</p>
			) : (
				<div className="mt-4 overflow-x-auto">
					<table className="w-full min-w-[34rem] text-[15px] tabular-nums">
						<thead>
							<tr className="text-left text-sm text-faint">
								<th className="py-2 pr-3 font-normal">Tarikh</th>
								{TABLE_KEYS.map((k) => (
									<th key={k} className="py-2 pl-3 text-right font-normal">
										{prayerLabel(k, 0)}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{(days ?? []).map((d) => {
								const isToday = d.isoDate === todayIso;
								return (
									<tr
										key={d.isoDate}
										className={`border-t border-line ${isToday ? "font-semibold text-ink" : "text-muted"}`}
									>
										<td className="py-2.5 pr-3 whitespace-nowrap">
											{formatDate(d.times.zohor).replace(/ \d{4}$/, "")}
										</td>
										{TABLE_KEYS.map((k) => (
											<td key={k} className="py-2.5 pl-3 text-right">
												{formatTime(d.times[k])}
											</td>
										))}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
