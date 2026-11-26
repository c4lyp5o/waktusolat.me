// Banner.jsx — a short ayat or hadith, a new one every 20 seconds. On a
// registered mosque's TV (/m/:id) its upcoming programmes take turns too:
// every programme, then one ayat or hadith (mosqueTv.js bannerSlot).
//
// Alternates ayat and hadith from our own API (?max= keeps every item to
// two lines, never shrunk to fit). Each new item joins a pool kept in
// localStorage; when the network is down the banner walks that pool, and on
// a first-ever offline load it shows a quiet notice instead.
import { m, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { addToPool, loadPool, nextFromPool, savePool, sourceFor } from "../lib/waktu/bannerPool.js";
import { bannerSlot, whenLine } from "../lib/waktu/mosqueTv.js";
import ProgrammeCard from "./ProgrammeCard.jsx";
import { safeStorage } from "./useTv.js";

const ROTATE_MS = 20_000;

export default function Banner({ programmes = [], now }) {
	const reduce = useReducedMotion();
	const storage = useMemo(safeStorage, []);
	const pool = useRef(null);
	if (pool.current === null) pool.current = loadPool(storage);
	const [item, setItem] = useState(() => pool.current.at(-1) ?? null);
	const current = useRef(item);
	current.current = item;
	const step = useRef(0);
	// The latest programmes and time, read when the 20 s rotation fires.
	const live = useRef({ programmes, now });
	live.current = { programmes, now };
	const slot = useRef(0);
	const lastQuote = useRef(item);

	useEffect(() => {
		let alive = true;
		const rotate = async () => {
			const list = live.current.programmes;
			const turn = bannerSlot(slot.current++, list.length);
			if (turn.programme !== undefined) {
				const p = list[turn.programme];
				const card = {
					kind: "programme",
					key: p.key,
					when: whenLine(p, live.current.now),
					...p.programme,
				};
				if (alive) setItem(card);
				return;
			}
			const { url, normalize } = sourceFor(step.current++);
			try {
				const res = await fetch(url);
				const next = res.ok ? normalize(await res.json()) : null;
				if (next) {
					pool.current = addToPool(pool.current, next);
					savePool(storage, pool.current);
					lastQuote.current = next;
					if (alive) setItem(next);
					return;
				}
			} catch {
				// Offline: fall through to the pool.
			}
			const fallback = nextFromPool(pool.current, lastQuote.current?.key);
			if (fallback) lastQuote.current = fallback;
			if (alive && fallback) setItem(fallback);
		};
		// With nothing cached, fetch the first card now rather than in 20 s.
		if (!current.current) rotate();
		const id = setInterval(rotate, ROTATE_MS);
		return () => {
			alive = false;
			clearInterval(id);
		};
	}, [storage]);

	// A programme that stopped being live mid-turn (its 2 hours passed, it
	// was edited away, the mosque was deleted) leaves at once: the last ayat
	// or hadith stands in until the next turn.
	const stale = item?.kind === "programme" && !programmes.some((p) => p.key === item.key);
	const shown = stale ? lastQuote.current : item;

	return (
		<section className="tv-banner" aria-live="off">
			{shown ? (
				<m.div
					key={shown.key}
					className="tv-banner-card"
					initial={{ opacity: 0, x: reduce ? 0 : "3vh" }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					{shown.kind === "programme" ? (
						<ProgrammeCard item={shown} />
					) : (
						<>
							<p className="tv-banner-text">{shown.text}</p>
							<p className="tv-banner-foot">
								<span>{shown.ref}</span>
								{shown.arabic && (
									<span className="tv-banner-arabic" lang="ar" dir="rtl">
										{shown.arabic}
									</span>
								)}
							</p>
						</>
					)}
				</m.div>
			) : (
				<p className="tv-banner-text">Sila senyapkan telefon bimbit</p>
			)}
		</section>
	);
}
