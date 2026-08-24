import { useEffect, useState } from "react";
import ZoneSelector from "../components/ZoneSelector";

/** Compact number formatting, e.g. 12_480 -> "12,480" */
function nf(n) {
	if (n === null || n === undefined) return "0";
	return Number(n).toLocaleString("en-MY");
}

export default function Landing() {
	const [stats, setStats] = useState(null);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			try {
				const json = await fetch("/api/v1/visitors/stats").then((r) => r.json());
				if (!cancelled && json?.data) setStats(json.data);
			} catch (error) {
				// Silent fail — page works fine without the counter
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<>
			<title>Waktu Solat Malaysia</title>
			<meta
				name="description"
				content="Waktu Solat Untuk Malaysia Straight Dari JAKIM"
			/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link rel="icon" href="/favicon.ico" />

			<main className="bg-ambient relative flex min-h-screen flex-col overflow-hidden">
				{/* Decorative Islamic pattern */}
				<div className="islamic-pattern pointer-events-none absolute inset-0" aria-hidden="true" />

				{/* Centered hero — as minimal as it gets */}
				<div className="flex flex-1 flex-col items-center justify-center px-4 pt-10 pb-16">
					<div className="rise-1 relative w-full max-w-3xl text-center">
										<h1 className="text-5xl font-extrabold tracking-tight text-slate-50 md:text-7xl">
											Waktu Solat{" "}
											<span className="text-acre-500">Malaysia</span>
										</h1>
									</div>

					{/* The one thing to do here */}
					<div className="rise-2 relative mt-8 w-full max-w-md px-2">
						<ZoneSelector />
					</div>
				</div>

				{/* Visitor stats — quiet fixed footer, pinned to bottom of viewport */}
				{stats && (
					<div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/60 bg-night-950/60 backdrop-blur-sm">
						<div className="flex items-center justify-center gap-8 px-4 py-2">
							<div className="text-center">
								<p className="text-sm font-semibold tabular-nums text-slate-300">
									{nf(stats.total_visits)}
								</p>
								<p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
									Kunjungan
								</p>
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold tabular-nums text-slate-300">
									{nf(stats.unique_visitors)}
								</p>
								<p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
									Pelawat
								</p>
							</div>
							<div className="text-center">
								<p className="text-sm font-semibold tabular-nums text-slate-300">
									{nf(stats.active_days)}
								</p>
								<p className="mt-0.5 text-[10px] uppercase tracking-widest text-slate-500">
									Hari Aktif
								</p>
							</div>
						</div>
					</div>
				)}
			</main>
		</>
	);
}