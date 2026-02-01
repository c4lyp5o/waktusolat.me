export default function LoadFailed() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6">
			{/* Error Icon with Glow */}
			<div className="relative">
				<div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full"></div>
				<div className="relative bg-slate-900 p-4 rounded-full border border-slate-800 shadow-xl">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-10 w-10 text-red-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<title>Error Icon</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>
			</div>

			<div className="space-y-2 max-w-md">
				<h1 className="text-2xl md:text-3xl font-bold text-slate-100">
					Gagal Memuatkan
				</h1>
				<p className="text-slate-400">
					Maaf, terdapat masalah semasa memuatkan data. Sila periksa sambungan
					internet anda.
				</p>
			</div>

			{/* Retry Button */}
			<button
				type="button"
				onClick={() => window.location.reload()}
				className="px-6 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-all hover:scale-105 border border-slate-700 hover:border-emerald-500/50 flex items-center gap-2"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<title>Retry</title>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				Cuba Lagi
			</button>
		</div>
	);
}
