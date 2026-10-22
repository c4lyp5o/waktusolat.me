// ZoneSearch.jsx — find your zone by typing ("gomb", "kl", "johor"), or by
// tapping a state when the box is empty. Replaces the 57-row scroll.
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { mosqueFor } from "../lib/mosques.js";
import { areaName } from "../lib/waktu/format.js";
import { searchZones } from "../lib/zoneSearch.js";
import { STATES, zoneIndex } from "../lib/zones.js";

// With `onPick` (the mosque editor) a result is chosen in place instead of
// opening its times page.
export default function ZoneSearch({
	autoFocus = false,
	onPick,
	label = "Cari daerah atau negeri",
}) {
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
				{label}
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
								<ResultLink
									code={z.code}
									onPick={onPick}
									className="flex w-full items-center justify-between gap-4 border-b border-line py-4 text-left hover:bg-raised"
								>
									<span className="min-w-0">
										<span className="block text-lg text-ink">{areaName(z.name)}</span>
										<span className="text-[15px] text-faint">{z.negeri}</span>
									</span>
									<span className="shrink-0 text-[15px] text-faint tabular-nums">
										{z.code.toUpperCase()}
									</span>
								</ResultLink>
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
					{onPick ? (
						// Inside a form: compact chips, so the form's button stays near.
						<ul className="mt-3 flex flex-wrap gap-2">
							{STATES.map((s) => (
								<li key={s}>
									<button
										type="button"
										onClick={() => setQuery(s)}
										className="min-h-12 rounded-full bg-raised px-4 text-[15px] text-ink hover:bg-line"
									>
										{s.replace("Wilayah Persekutuan", "WP")}
									</button>
								</li>
							))}
						</ul>
					) : (
						<StateTiles setQuery={setQuery} />
					)}
				</div>
			)}
		</section>
	);
}

function StateTiles({ setQuery }) {
	return (
		<>
			{/* Each state as its own mosque: the same photographs as the zone
			    pages, at thumbnail size. */}
			<ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
				{STATES.map((s) => {
					const m = mosqueFor(s);
					return (
						<li key={s}>
							<button
								type="button"
								onClick={() => setQuery(s)}
								className="group block w-full overflow-hidden rounded-xl bg-raised text-left"
							>
								{m?.thumb && (
									<img
										src={m.thumb}
										alt=""
										loading="lazy"
										className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
									/>
								)}
								<span className="block px-3 py-2 text-[15px] leading-snug text-ink">
									{s.replace("Wilayah Persekutuan", "WP")}
								</span>
							</button>
						</li>
					);
				})}
			</ul>
			<p className="mt-4 text-[13px] text-faint">
				Foto masjid dari Wikimedia Commons.{" "}
				<Link to="/about#kredit-foto" className="underline underline-offset-2">
					Kredit penuh
				</Link>
			</p>
		</>
	);
}

function ResultLink({ code, onPick, className, children }) {
	if (onPick) {
		return (
			<button type="button" onClick={() => onPick(code)} className={className}>
				{children}
			</button>
		);
	}
	return (
		<Link to={`/times/${code}`} className={className}>
			{children}
		</Link>
	);
}
