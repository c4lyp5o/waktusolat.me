// MosqueTv.jsx — /m/:id, a registered mosque's TV (SPEC-tv-mosque-mode.md).
//
// The same screen as /tv/:zone (TvScreen), driven by the mosque's settings
// and carrying its programmes in the banner. Boots from the last copy in
// localStorage, then polls the mosque and its 7-day feed every 60 s with
// If-None-Match, so an unchanged mosque costs two 304s a minute. Only a
// real 404 means the mosque is gone; a network error changes nothing.
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { parseConfig } from "../lib/waktu/config.js";
import { mosqueConfig, readMosque, writeMosque } from "../lib/waktu/mosqueTv.js";
import { TvMessage, TvScreen } from "./TvApp.jsx";
import { safeStorage } from "./useTv.js";

const POLL_MS = 60 * 1000;

// -> { status: 200 | 304 | 404 | 0, body, tag }
async function conditional(url, tag) {
	try {
		const res = await fetch(url, { headers: tag ? { "if-none-match": tag } : {} });
		if (res.status === 200)
			return { status: 200, body: await res.json(), tag: res.headers.get("etag") };
		return { status: res.status };
	} catch {
		return { status: 0 };
	}
}

export default function MosqueTv() {
	const { id } = useParams();
	const storage = useMemo(safeStorage, []);
	const [entry, setEntry] = useState(() => readMosque(storage, id));
	const [unknown, setUnknown] = useState(false);
	// Dev-only ?now= for previews and screenshots; settings come from the mosque.
	const fixedNow = useMemo(
		() => parseConfig(new URLSearchParams(window.location.search), import.meta.env.MODE).now,
		[],
	);

	useEffect(() => {
		let alive = true;
		let current = readMosque(storage, id);
		const save = (next) => {
			current = next;
			writeMosque(storage, id, next);
			if (alive) setEntry(next);
		};
		const poll = async () => {
			const m = await conditional(
				`/api/v1/mosques/${id}`,
				current?.gone ? null : current?.mosqueTag,
			);
			if (!alive) return;
			if (m.status === 404) {
				if (current) save({ ...current, gone: true, feed: null });
				else setUnknown(true);
				return;
			}
			if (m.status === 200) {
				save({ ...current, mosque: m.body, mosqueTag: m.tag, gone: false });
			}
			if (!current || current.gone) return;
			const f = await conditional(`/api/v1/mosques/${id}/programmes/upcoming`, current.feedTag);
			if (alive && f.status === 200) save({ ...current, feed: f.body, feedTag: f.tag });
		};
		poll();
		const timer = setInterval(poll, POLL_MS);
		return () => {
			alive = false;
			clearInterval(timer);
		};
	}, [id, storage]);

	if (!entry?.mosque) {
		return unknown ? (
			<TvMessage title="Masjid tidak dijumpai" text="Semak pautan TV dalam editor masjid." />
		) : (
			<TvMessage title="Memuatkan paparan masjid" text="" />
		);
	}
	const { mosque, feed, gone } = entry;
	// A deleted mosque keeps its last zone's times, without its name or programmes.
	const config = gone
		? { ...mosqueConfig(mosque, fixedNow), nama: null }
		: mosqueConfig(mosque, fixedNow);
	return (
		<TvScreen
			zone={mosque.zone}
			config={config}
			feed={gone ? null : feed}
			notice={gone ? "Paparan masjid ini tidak lagi aktif" : null}
		/>
	);
}
