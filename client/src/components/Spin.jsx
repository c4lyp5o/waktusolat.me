export default function Spin() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] p-4 space-y-6">
			<div className="relative w-16 h-16">
				<div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
				<div className="absolute inset-0 rounded-full border-4 border-acre-500 border-t-transparent animate-spin"></div>
				<div className="absolute inset-0 flex items-center justify-center text-acre-500/50 animate-pulse">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<title>Moon Icon</title>
						<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
					</svg>
				</div>
			</div>

			<h1 className="text-slate-400 text-lg font-medium tracking-wide animate-pulse">
				Fetching for you...
			</h1>
		</div>
	);
}
