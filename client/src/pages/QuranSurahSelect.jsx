import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import Spin from "../components/Spin";

export default function QuranSurahSelect() {
	const navigate = useNavigate();
	const [surah, setSurah] = useState(null);
	const [randomAyat, setRandomAyat] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch Data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const [randomRes, surahRes] = await Promise.all([
					fetch("api/v1/quran/random"),
					fetch("api/v1/quran"),
				]);

				const randomData = await randomRes.json();
				const surahData = await surahRes.json();

				setRandomAyat(randomData);
				setSurah(surahData);
			} catch (error) {
				console.error("Failed to fetch Quran data", error);
			}
		};

		fetchData();
	}, []);

	// Filter Logic
	const filteredSurahs = useMemo(() => {
		if (!surah) return [];
		if (!searchTerm) return surah.data;

		return surah.data.filter((s) =>
			s.transliteration.toLowerCase().includes(searchTerm.toLowerCase()),
		);
	}, [surah, searchTerm]);

	// Handle Navigation (Index + 1 because API uses 1-based IDs)
	const handleSelectSurah = (index) => {
		navigate(`/quran/${index + 1}`);
	};

	if (!surah || !randomAyat) return <Spin />;

	return (
		<>
			<title>Al Quran</title>
			<meta name="description" content="Baca Al Quran Digital" />
			<link rel="icon" href="/favicon.ico" />

			<main className="min-h-screen bg-slate-950 pb-20 font-sans">
				<div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
					{/* --- SECTION 1: AYAT HARI INI (Daily Verse) --- */}
					<section className="bg-slate-900 rounded-3xl shadow-xl border border-acre-100 overflow-hidden relative">
						{/* Decorative Top Bar */}
						<div className="h-2 bg-linear-to-r from-acre-500 to-teal-500" />

						<div className="p-6 md:p-10 space-y-6">
							<div className="flex items-center gap-2 mb-2">
								<span className="bg-acre-100 text-acre-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
									Ayat Hari Ini
								</span>
							</div>

							{/* Arabic Text */}
							<h1
								className="text-3xl md:text-5xl text-right font-serif leading-loose md:leading-[1.6] text-slate-100 dir-rtl"
								style={{ direction: "rtl" }}
							>
								{randomAyat.data.arabic}
							</h1>

							{/* Translation */}
							<div className="space-y-4 pt-4 border-t border-slate-800">
								<p className="text-slate-200 text-lg italic leading-relaxed">
									"{randomAyat.data.malayTranslation}"
								</p>

								<div className="flex items-center justify-end text-sm font-medium text-acre-600">
									<span>Surah {randomAyat.data.fromSurah}</span>
									<span className="mx-2 text-slate-300">|</span>
									<span>Ayat {randomAyat.data.ayatNumber}</span>
								</div>
							</div>
						</div>
					</section>

					{/* --- SECTION 2: SURAH SELECTOR --- */}
					<section className="space-y-6">
						<div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
							<h2 className="text-2xl font-bold text-slate-100">
								Senarai Surah
							</h2>

							{/* Search Bar */}
							<div className="relative w-full md:w-72">
								<input
									type="text"
									placeholder="Cari Surah (cth: Yasin)..."
									className="w-full pl-10 pr-4 py-2 rounded-xl border bg-slate-800 text-white border-slate-700 focus:border-acre-500 focus:ring-2 focus:ring-acre-200 transition-all outline-none"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
								<svg
									className="absolute left-3 top-2.5 h-5 w-5 text-slate-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Search</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
						</div>

						{/* Grid of Surahs */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{filteredSurahs.map((singleSurah, idx) => {
								// Calculate the actual index in the full array for the link
								// We use indexOf to find the original index if we are filtering
								const originalIndex = surah.data.indexOf(singleSurah);

								return (
									<button
										type="button"
										key={singleSurah.transliteration}
										onClick={() => handleSelectSurah(originalIndex)}
										className="group bg-slate-900 hover:bg-acre-50 border border-slate-800 hover:border-acre-200 rounded-xl p-4 flex items-center justify-between transition-all duration-200 shadow-sm hover:shadow-md text-left"
									>
										<div className="flex items-center gap-4">
											{/* Number Badge */}
											<div className="h-10 w-10 shrink-0 bg-slate-100 group-hover:bg-acre-200 text-slate-600 group-hover:text-acre-800 rounded-lg flex items-center justify-center font-bold text-sm transition-colors">
												{originalIndex + 1}
											</div>

											{/* Name */}
											<div>
												<h3 className="font-bold text-slate-200 group-hover:text-acre-900">
													{singleSurah.transliteration}
												</h3>
												{/* If API had meaning, we'd put it here: <p className="text-xs text-slate-400">The Opening</p> */}
											</div>
										</div>

										{/* Arrow Icon */}
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5 text-slate-300 group-hover:text-acre-500 transform group-hover:translate-x-1 transition-all"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<title>Select</title>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
								);
							})}
						</div>

						{filteredSurahs.length === 0 && (
							<div className="text-center py-12 text-slate-400 bg-slate-900 rounded-xl border border-dashed border-slate-800">
								<p>Tiada surah dijumpai.</p>
							</div>
						)}
					</section>
				</div>
			</main>
		</>
	);
}
