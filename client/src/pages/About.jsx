export default function About() {
	return (
		<>
			<title>Tentang Kami</title>
			<meta name="description" content="Mari kenali kami di c4lyp5o @ github" />
			<link rel="icon" href="/favicon.ico" />

			<main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans pb-20">
				<div className="w-full max-w-md bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
					{/* Header Image / Pattern */}
					<div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-600 relative overflow-hidden">
						{/* Decorative Circles */}
						<div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-900/10 rounded-full blur-2xl"></div>
						<div className="absolute top-10 -left-10 w-20 h-20 bg-slate-900/10 rounded-full blur-xl"></div>
					</div>

					{/* Profile Section */}
					<div className="px-8 pb-10 text-center relative">
						{/* Floating Icon */}
						<div className="-mt-12 mb-6">
							<div className="w-24 h-24 bg-slate-900 rounded-full p-2 mx-auto shadow-lg">
								<div className="w-full h-full bg-red-50 rounded-full flex items-center justify-center">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="w-10 h-10 text-red-500 animate-pulse"
									>
										<title>Profile Icon</title>
										<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
									</svg>
								</div>
							</div>
						</div>

						<h1 className="text-2xl font-bold text-slate-100">
							Made with <span className="text-red-500">love!</span>
						</h1>

						{/* <p className="text-slate-400 mt-3 text-sm leading-relaxed">
							Satu inisiatif sumber terbuka untuk memudahkan semakan waktu
							solat, bacaan Al-Quran, dan komuniti Islamik.
						</p> */}

						{/* Developer Button */}
						<div className="mt-4">
							<a
								href="https://github.com/c4lyp5o"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										fillRule="evenodd"
										d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
										clipRule="evenodd"
									/>
								</svg>
								<span>github.com/c4lyp5o</span>
							</a>
						</div>
					</div>

					{/* Tech Stack Footer */}
					<div className="bg-slate-950 border-t border-slate-800 p-6 flex flex-wrap justify-center gap-3">
						<span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400">
							React
						</span>
						<span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400">
							Tailwind CSS
						</span>
						<span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400">
							Vite
						</span>
						<span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-slate-400">
							Socket.io
						</span>
					</div>
				</div>
			</main>
		</>
	);
}
