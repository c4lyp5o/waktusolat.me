import { useState, useEffect } from "react";
import { getTheKeetab, giveTheKeetab } from "../lib/helper";
import Spin from "../components/Spin";

export default function Hadith() {
	const [keetab, setKeetab] = useState([]);
	const [selectedBook, setSelectedBook] = useState(null);
	const [hadithContent, setHadithContent] = useState(null);
	const [loading, setLoading] = useState(false);

	// Fetch list of books on mount
	useEffect(() => {
		const downloadKeetabList = async () => {
			try {
				const { msg } = await getTheKeetab();
				// Ensure msg is an array before setting
				if (Array.isArray(msg)) {
					setKeetab(msg);
				}
			} catch (error) {
				console.error("Failed to load books");
			}
		};
		downloadKeetabList();
	}, []);

	// Handle fetching a hadith
	const fetchHadith = async (bookId) => {
		setLoading(true);
		setHadithContent(null);
		setSelectedBook(bookId);

		try {
			// Assuming giveTheKeetab returns an object like { hadis: "..." }
			const data = await giveTheKeetab(bookId);
			setHadithContent(data.hadis || "Tiada hadis dijumpai.");
		} catch (error) {
			setHadithContent(
				"Harap Maaf, Sila Cuba Lagi. Terdapat masalah sambungan.",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<title>Hadith Pilihan</title>
			<meta
				name="description"
				content="Koleksi hadis dari kutubussittah dalam bahasa Melayu"
			/>
			<link rel="icon" href="/favicon.ico" />

			<main className="min-h-screen bg-slate-950 flex flex-col items-center p-4 font-sans pb-20">
				<div className="w-full max-w-4xl space-y-8">
					{/* Header Section */}
					<div className="text-center space-y-2 pt-2">
						<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
							Koleksi <span className="text-emerald-600">Hadis</span>
						</h1>
						{/* <p className="text-slate-400 text-lg">
							Pilih kitab di bawah untuk membaca hadis secara rawak.
						</p> */}
					</div>

					{/* Book Selection Grid */}
					<div className="bg-slate-900 rounded-3xl shadow-sm border border-slate-800 p-6">
						<h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
							Pilih Kitab
						</h2>

						{keetab.length === 0 ? (
							<div className="animate-pulse flex space-x-4">
								<div className="h-10 bg-gray-200 rounded w-full"></div>
							</div>
						) : (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
								{keetab.map((book) => (
									<button
										type="button"
										key={book}
										onClick={() => fetchHadith(book)}
										className={`
                      px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border
                      ${
												selectedBook === book
													? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
													: "bg-slate-900 text-slate-200 border-slate-800 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50"
											}
                    `}
									>
										{book === "abudaud"
											? "Abu Daud"
											: book === "ibnumajah"
												? "Ibnu Majah"
												: book.charAt(0).toUpperCase() + book.slice(1)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Content Display Area */}
					<div className="min-h-75">
						{loading ? (
							<div className="flex flex-col items-center justify-center h-64 text-emerald-600">
								<Spin />
								{/* <p className="mt-4 font-medium animate-pulse">
									Sedang mencari hadis...
								</p> */}
							</div>
						) : hadithContent ? (
							<div className="bg-slate-900 rounded-3xl shadow-xl border border-slate-800 overflow-hidden relative">
								{/* Decorative Quote Icon */}
								<div className="absolute top-4 left-4 text-emerald-100">
									<svg
										width="60"
										height="60"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<title>Quote</title>
										<path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91203 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 8.44772 5.0166 9V11C5.0166 11.5523 4.56889 12 4.0166 12H3.0166V5H13.0166V15C13.0166 18.3137 10.3303 21 7.0166 21H5.0166Z" />
									</svg>
								</div>

								<div className="p-8 md:p-12 relative mt-8 z-10">
									<div className="prose prose-lg prose-emerald max-w-none">
										{/* Logic: Sometimes the API might return text with newlines. 
                       We render it cleanly.
                     */}
										<p className="text-slate-200 leading-loose text-lg md:text-xl font-medium">
											{hadithContent}
										</p>
									</div>

									{/* Footer Actions */}
									<div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
										<div className="text-sm text-slate-400 font-medium bg-slate-950 px-4 py-2 rounded-lg">
											Sumber:{" "}
											<span className="text-emerald-700 font-bold uppercase">
												{selectedBook}
											</span>
										</div>

										<button
											type="button"
											onClick={() => fetchHadith(selectedBook)}
											className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-semibold transition-colors shadow-lg shadow-emerald-200"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<title>Refresh</title>
												<path
													fillRule="evenodd"
													d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.276a1 1 0 01-2 0V13.107a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
													clipRule="evenodd"
												/>
											</svg>
											Baca Hadis Lain
										</button>
									</div>
								</div>
							</div>
						) : (
							// Initial State / "Salam"
							<div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-slate-900 rounded-3xl border border-dashed border-gray-300">
								<p className="text-xl font-serif text-slate-400">
									Assalamualaikum
								</p>
								<p className="text-sm mt-2">Sila pilih kitab.</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</>
	);
}
