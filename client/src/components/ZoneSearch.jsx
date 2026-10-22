// ZoneSearch.jsx — find your zone by typing ("gomb", "kl", "johor"), or by
// tapping a state when the box is empty. Replaces the 57-row scroll.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { areaName } from "../lib/waktu/format.js";
import { searchZones } from "../lib/zoneSearch.js";
import { STATES, zoneIndex } from "../lib/zones.js";

export default function ZoneSearch({ autoFocus = false }) {
	const [query, setQuery] = useState("");
	const results = useMemo(() => searchZones(zoneIndex, query), [query]);
	const typed = query.trim().length > 0;
	// Focus the box when it is the page's one job (first visit), without the
	// autoFocus attribute (which also fires on every re-mount).
	const input = useRef(null);
	useEffect(() => {
		if (autoFocus) input.current?.focus();
	}, [autoFocus]);

	return (
		<section>
			<label htmlFor="zone-query" className="text-lg font-semibold">
				Cari daerah atau negeri
			</label>
			<input
				ref={input}
				id="zone-query"
				type="search"
				inputMode="search"
				autoComplete="off"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Contoh: Gombak, Johor"
				className="mt-3 h-14 w-full rounded-xl px-4 text-lg"
			/>

			{typed ? (
				results.length > 0 ? (
					<ul className="mt-4" aria-label="Zon sepadan">
						{results.map((z) => (
							<li key={z.code}>
								<Link
									to={`/times/${z.code}`}
									className="flex items-center justify-between gap-4 border-b border-line py-4 hover:bg-raised"
								>
									<span className="min-w-0">
										<span className="block text-lg text-ink">{areaName(z.name)}</span>
										<span className="text-[15px] text-faint">{z.negeri}</span>
									</span>
									<span className="shrink-0 text-[15px] text-faint tabular-nums">
										{z.code.toUpperCase()}
									</span>
								</Link>
							</li>
						))}
					</ul>
				) : (
					<p className="mt-4 text-lg text-muted">
						Tiada zon sepadan dengan "{query.trim()}". Cuba nama daerah atau negeri.
					</p>
				)
			) : (
				<div className="mt-6">
					<p className="text-[15px] text-faint">Atau pilih negeri</p>
					<ul className="mt-3 flex flex-wrap gap-2">
						{STATES.map((s) => (
							<li key={s}>
								<button
									type="button"
									onClick={() => setQuery(s)}
									className="rounded-full bg-raised px-4 py-2 text-[15px] text-ink hover:bg-line"
								>
									{s}
								</button>
							</li>
						))}
					</ul>
				</div>
			)}
		</section>
	);
}
