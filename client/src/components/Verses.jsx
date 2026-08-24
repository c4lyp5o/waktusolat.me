import { useParams } from "react-router";
import { useState } from "react";
import useSWR from "swr";

import Pagination from "./Pagination";
import Spin from "./Spin";
import LoadFailed from "./LoadFailed";

const fetcher = (url) => fetch(url).then((res) => res.json());

function QuranData({ data }) {
	const { text, translation, id } = data;
	return (
		// Dark border, Hover effect is dark slate
		<div className="border-b border-slate-800 py-8 px-4 md:px-8 hover:bg-slate-800/50 transition-colors duration-200 group">
			<div className="mb-6 flex justify-between items-start">
				{/* Badge: Dark Emerald */}
				<span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-acre-900/30 text-acre-400 text-xs font-bold tracking-wide border border-acre-900/50">
					Ayat {id}
				</span>
			</div>

			{/* Arabic: White text */}
			<div className="w-full text-right mb-6" dir="rtl">
				<h5 className="font-uthmanic text-3xl md:text-5xl leading-[2.2] md:leading-[2.2] text-slate-100 antialiased">
					{text}
				</h5>
			</div>

			{/* Translation: Light Gray text */}
			<div className="w-full text-left">
				<p className="text-slate-400 text-lg leading-relaxed font-light">
					{translation}
				</p>
			</div>
		</div>
	);
}

// --- Main Container ---
export default function Verses() {
	const { surah } = useParams();
	const [page, setPage] = useState(1);

	const { data, error } = useSWR(`/api/v1/quran/my/${surah}`, fetcher, {
		suspense: true,
	});

	if (!surah || !data) return <Spin />;
	if (error) return <LoadFailed />;

	return (
		<>
			<title>{data.data.transliteration}</title>
			<meta
				name="description"
				content={`Baca Surah ${data.data.transliteration}`}
			/>
			<link rel="icon" href="/favicon.ico" />

			<main className="min-h-screen bg-slate-950 font-sans pb-20">
				<div className="max-w-4xl mx-auto bg-slate-900 shadow-xl rounded-b-3xl min-h-screen border-x border-slate-800">
					{/* Header Section for Surah Name */}
					<div className="bg-acre-700 text-white p-8 text-center rounded-b-3xl shadow-lg mb-8 relative overflow-hidden">
						<div className="relative z-10">
							<h1 className="text-4xl font-bold tracking-tight mb-2">
								{data.data.transliteration}
							</h1>
							<p className="text-acre-100 text-sm uppercase tracking-widest font-semibold">
								{data.data.verses.length} Ayat
							</p>
						</div>
						{/* Subtle pattern background could go here */}
					</div>
					{/* Bismillah Header (Only on Page 1 & Not Surah Fatihah/Tawbah logic if applicable) */}
					{surah !== "1" && page < 2 && (
						<div className="text-center py-10 px-4 mb-4">
							<p
								className="text-4xl md:text-5xl font-serif text-acre-500/90 leading-relaxed drop-shadow-sm"
								dir="rtl"
							>
								بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
							</p>
						</div>
					)}
					{/* Verses List */}
					<Pagination
						data={data.data.verses}
						page={page}
						setPage={setPage}
						RenderComponent={QuranData}
						pageLimit={5}
						dataLimit={10}
					/>
				</div>
			</main>
		</>
	);
}
