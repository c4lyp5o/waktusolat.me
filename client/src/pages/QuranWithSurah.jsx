// /quran/:surah — the reader: the whole surah on one page (no paging),
// Arabic large in the Uthmanic face with its translation, then the next
// and previous surahs. Each ayat has an anchor (#ayat-12).
import { Link, useParams } from "react-router";
import useSWR from "swr";
import { SURAH_TYPE } from "./QuranSurahSelect.jsx";

const fetchJson = (url) =>
	fetch(url).then((res) => {
		if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status });
		return res.json();
	});

// Every surah opens with the Bismillah except Al-Fatihah (where it is the
// first ayat) and At-Tawbah (which has none).
const BISMILLAH = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ";
const hasBismillah = (n) => n !== 1 && n !== 9;

// The ayat number as in a printed mushaf: Arabic-Indic digits, which the
// bundled Uthmanic face draws inside an end-of-ayah frame.
const ayahMark = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

function Neighbours({ number }) {
	const { data } = useSWR("/api/v1/quran", fetchJson);
	const list = data?.data ?? [];
	const prev = list.find((s) => s.number === number - 1);
	const next = list.find((s) => s.number === number + 1);
	if (!prev && !next) return null;
	return (
		<nav aria-label="Surah lain" className="mt-12 grid grid-cols-2 gap-4">
			<div>
				{prev && (
					<Link
						to={`/quran/${prev.number}`}
						className="block rounded-xl bg-raised px-4 py-3 hover:bg-line"
					>
						<span className="block text-[14px] text-faint">Sebelum</span>
						<span className="block text-[17px] text-ink">
							{prev.number}. {prev.transliteration}
						</span>
					</Link>
				)}
			</div>
			<div className="text-right">
				{next && (
					<Link
						to={`/quran/${next.number}`}
						className="block rounded-xl bg-raised px-4 py-3 hover:bg-line"
					>
						<span className="block text-[14px] text-faint">Seterusnya</span>
						<span className="block text-[17px] text-ink">
							{next.number}. {next.transliteration}
						</span>
					</Link>
				)}
			</div>
		</nav>
	);
}

export default function QuranWithSurah() {
	const number = Number.parseInt(useParams().surah, 10);
	const { data, error } = useSWR(
		Number.isInteger(number) ? `/api/v1/quran/my/${number}` : null,
		fetchJson,
	);
	const surah = data?.data;

	if (error || !Number.isInteger(number)) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
				<h1 className="text-2xl font-semibold">Surah tidak dijumpai</h1>
				<Link to="/quran" className="mt-6 inline-block text-lg font-semibold text-accent">
					Kembali ke senarai surah
				</Link>
			</main>
		);
	}
	if (!surah) {
		return (
			<main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
				<p className="text-lg text-muted">Memuatkan surah…</p>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
			<title>{`${surah.transliteration} | Al-Quran`}</title>
			<Link to="/quran" className="text-[15px] text-faint hover:text-ink">
				← Senarai surah
			</Link>
			<header className="mt-6 flex items-end justify-between gap-6 border-b border-line pb-6">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">
						{surah.id}. {surah.transliteration}
					</h1>
					<p className="mt-1 text-[17px] text-muted">
						{surah.translation} · {surah.verses.length} ayat · {SURAH_TYPE[surah.type] ?? ""}
					</p>
				</div>
				<p
					lang="ar"
					dir="rtl"
					className="font-uthmanic text-[36px] leading-none text-ink md:text-[44px]"
				>
					{surah.name}
				</p>
			</header>

			{hasBismillah(surah.id) && (
				<p
					lang="ar"
					dir="rtl"
					className="mt-10 text-center font-uthmanic text-[30px] leading-loose text-ink md:text-[36px]"
				>
					{BISMILLAH}
				</p>
			)}

			<ol className="mt-6" aria-label={`Ayat surah ${surah.transliteration}`}>
				{surah.verses.map((v) => (
					<li
						key={v.id}
						id={`ayat-${v.id}`}
						className="border-b border-line py-7 [content-visibility:auto] [contain-intrinsic-size:auto_14rem]"
					>
						<p
							lang="ar"
							dir="rtl"
							className="font-uthmanic text-[28px] leading-[2.1] text-ink md:text-[34px]"
						>
							{v.text} {ayahMark(v.id)}
						</p>
						<p className="mt-4 text-[17px] leading-relaxed text-muted md:text-lg">
							<span className="mr-2 text-[15px] text-faint tabular-nums">{v.id}</span>
							{v.translation}
						</p>
					</li>
				))}
			</ol>

			<Neighbours number={surah.id} />
		</main>
	);
}
