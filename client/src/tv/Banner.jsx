// Banner.jsx — a short ayat or hadith, a new one every 20 seconds.
//
// Alternates ayat and hadith from our own API (?max= keeps every item to
// two lines, never shrunk to fit). Each new item joins a pool kept in
// localStorage; when the network is down the banner walks that pool, and on
// a first-ever offline load it shows a quiet notice instead.
import { m, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { addToPool, loadPool, nextFromPool, savePool, sourceFor } from "../lib/waktu/bannerPool.js";
import { safeStorage } from "./useTv.js";

const ROTATE_MS = 20_000;

export default function Banner() {
	const reduce = useReducedMotion();
	const storage = useMemo(safeStorage, []);
	const pool = useRef(null);
	if (pool.current === null) pool.current = loadPool(storage);
	const [item, setItem] = useState(() => pool.current.at(-1) ?? null);
	const current = useRef(item);
	current.current = item;
	const step = useRef(0);

	useEffect(() => {
		let alive = true;
		const rotate = async () => {
			const { url, normalize } = sourceFor(step.current++);
			try {
				const res = await fetch(url);
				const next = res.ok ? normalize(await res.json()) : null;
				if (next) {
					pool.current = addToPool(pool.current, next);
					savePool(storage, pool.current);
					if (alive) setItem(next);
					return;
				}
			} catch {
				// Offline: fall through to the pool.
			}
			const fallback = nextFromPool(pool.current, current.current?.key);
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

	return (
		<section className="tv-banner" aria-live="off">
			{item ? (
				<m.div
					key={item.key}
					className="tv-banner-card"
					initial={{ opacity: 0, x: reduce ? 0 : "3vh" }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<p className="tv-banner-text">{item.text}</p>
					<p className="tv-banner-foot">
						<span>{item.ref}</span>
						{item.arabic && (
							<span className="tv-banner-arabic" lang="ar" dir="rtl">
								{item.arabic}
							</span>
						)}
					</p>
				</m.div>
			) : (
				<p className="tv-banner-text">Sila senyapkan telefon bimbit</p>
			)}
		</section>
	);
}
