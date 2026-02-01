import { Link } from "react-router";

export default function NotFound() {
	return (
		<>
			<title>404 - Halaman Tidak Dijumpai</title>
			<meta name="description" content="Halaman tidak dijumpai" />

			<main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center font-sans">
				{/* Glow Effect Container */}
				<div className="relative">
					{/* Subtle background blur behind the text */}
					<div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none"></div>

					<div className="relative z-10 space-y-8">
						{/* Big Gradient Text */}
						<h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-600 tracking-tighter drop-shadow-sm">
							404
						</h1>

						<div className="space-y-3">
							<h2 className="text-2xl md:text-3xl font-bold text-white">
								Alamak! Tersesat ke?
							</h2>
							<p className="text-slate-400 max-w-sm mx-auto text-lg leading-relaxed">
								Halaman yang anda cari tidak wujud atau mungkin telah
								dipindahkan.
							</p>
						</div>

						<div className="pt-6">
							<Link
								to="/"
								className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-emerald-900/50"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<title>Home</title>
									<path
										fillRule="evenodd"
										d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
										clipRule="evenodd"
									/>
								</svg>
								Kembali ke Halaman Utama
							</Link>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
