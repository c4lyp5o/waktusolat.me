// /quran — the surah index: search first, then all 114 surahs; a quiet
// ayat of the day beside it on desktop.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import useSWR from "swr";
import { searchSurahs } from "../lib/surahSearch.js";

const fetchJson = (url) =>
	fetch(url).then((res) => {
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return res.json();
	});

export const SURAH_TYPE = { meccan: "Makkiyah", medinan: "Madaniyah" };

function AyatHariIni() {
	// Short enough to read at a glance (the same ?max= the TV banner uses).
	const { data } = useSWR("/api/v1/quran/random?max=240", fetchJson, { revalidateOnFocus: false });
	const ayat = data?.data;
	if (!ayat) return null;
	const surah = ayat.fromSurah.split(" / ")[1];
	return (
		<section
			aria-labelledby="ayat-hari-ini"
			className="self-start rounded-2xl bg-surface p-6 lg:sticky lg:top-6"
		>
			<h2 id="ayat-hari-ini" className="text-[15px] text-faint">
				Ayat untuk direnungkan
			</h2>
			<p lang="ar" dir="rtl" className="mt-4 font-uthmanic text-[28px] leading-[2] text-ink">
				{ayat.arabic}
			</p>
			<p className="mt-4 text-[17px] leading-relaxed text-muted">{ayat.malayTranslation}</p>
			<p className="mt-3 text-[15px] text-faint">
				Surah {surah}, ayat {ayat.ayatNumber}
			</p>
		</section>
	);
}

export default function QuranSurahSelect() {
	const [query, setQuery] = useState("");
	const { data, error } = useSWR("/api/v1/quran", fetchJson);
	const surahs = useMemo(() => searchSurahs(data?.data ?? [], query), [data, query]);

	return (
		<main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
			<title>Al-Quran | Waktu Solat</title>
			<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_26rem]">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">Al-Quran</h1>
					<p className="mt-2 text-lg text-muted">114 surah, teks Arab dengan terjemahan.</p>

					<label htmlFor="surah-query" className="mt-8 block text-lg font-semibold">
						Cari surah
					</label>
					<input
						id="surah-query"
						type="search"
						autoComplete="off"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Contoh: Yasin, 36, Al-Mulk"
						className="mt-3 h-14 w-full rounded-xl px-4 text-lg"
					/>

					{error ? (
						<p className="mt-6 text-lg text-muted">
							Senarai surah tidak dapat dimuatkan. Cuba sebentar lagi.
						</p>
					) : !data ? (
						<p className="mt-6 text-lg text-muted">Memuatkan senarai surah…</p>
					) : surahs.length === 0 ? (
						<p className="mt-6 text-lg text-muted">Tiada surah sepadan dengan "{query.trim()}".</p>
					) : (
						<ol className="mt-6 grid gap-x-8 md:grid-cols-2" aria-label="Senarai surah">
							{surahs.map((s) => (
								<li key={s.number}>
									<Link
										to={`/quran/${s.number}`}
										className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line py-3 hover:bg-raised"
									>
										<span className="text-right text-[15px] text-faint tabular-nums">
											{s.number}
										</span>
										<span className="min-w-0">
											<span className="block truncate text-[17px] text-ink">
												{s.transliteration}
											</span>
											<span className="block truncate text-[14px] text-faint">
												{s.meaning} · {s.verses} ayat
											</span>
										</span>
										<span lang="ar" dir="rtl" className="font-uthmanic text-[22px] text-muted">
											{s.name}
										</span>
									</Link>
								</li>
							))}
						</ol>
					)}
				</div>
				<AyatHariIni />
			</div>
		</main>
	);
}
