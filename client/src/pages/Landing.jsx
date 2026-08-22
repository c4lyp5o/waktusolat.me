import { useEffect, useState } from "react";
import ZoneSelector from "../components/ZoneSelector";

/** Compact number formatting, e.g. 12_480 -> "12,480" */
function nf(n) {
	if (n === null || n === undefined) return "0";
	return Number(n).toLocaleString("en-MY");
}

/**
 * Lightweight inline SVG area chart (no external lib) for the 14-day
 * visitor trend. Draws a smooth-ish stepped area with a gradient fill.
 */
function VisitorTrend({ recent }) {
	const [width, setWidth] = useState(0);
	const [height] = useState(120);
	const points = Array.isArray(recent) ? recent : [];

	useEffect(() => {
		// Measure the card so the chart scales to its container.
		const el = document.getElementById("visitor-trend");
		if (!el) return;
		const resize = () => setWidth(el.clientWidth);
		resize();
		window.addEventListener("resize", resize);
		return () => window.removeEventListener("resize", resize);
	}, []);

	if (!points.length || width < 120) return null;

	const max = Math.max(1, ...points.map((p) => Number(p.visits) || 0));
	const pad = 4;
	const innerW = width - pad * 2;

	const xy = points.map((p, i) => {
		const x = pad + (i / (points.length - 1 || 1)) * innerW;
		const y = pad + (1 - (Number(p.visits) || 0) / max) * (height - pad * 2);
		return [x, y];
	});

	const line = xy.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
	const area = `${line} L${(width - pad).toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
	const last = xy[xy.length - 1];

	return (
		<svg
			id="visitor-trend"
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			role="img"
			aria-label="Trend lawatan 14 hari terakhir"
			className="block w-full h-auto"
		>
			<defs>
				<linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
					<stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={area} fill="url(#trend-fill)" />
			<path
				d={line}
				fill="none"
				stroke="#34d399"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{last && (
				<>
					<circle cx={last[0]} cy={last[1]} r="3" fill="#f5c95b" />
					<circle cx={last[0]} cy={last[1]} r="6" fill="#f5c95b" opacity="0.25" />
				</>
			)}
		</svg>
	);
}

export default function Landing() {
	const [stats, setStats] = useState(null);

	useEffect(() => {
		let cancelled = false;
		const visit = async () => {
			try {
				await fetch("/api/v1/thanks");
			} catch (error) {
				// Silent fail
			}
		};
		visit();
		return () => {
			cancelled = true;
		};
	}, []);

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

	const statItems = [
		{
			label: "Kunjungan",
			value: stats?.total_visits,
			icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
		},
		{
			label: "Pelawat Unik",
			value: stats?.unique_visitors,
			icon: "M13 10V3L4 14h7v7l9-11h-7z",
		},
		{
			label: "Hari Ini",
			value: stats?.today_visits,
			icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
		},
		{
			label: "Bulan Ini",
			value: stats?.month_visits,
			icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
		},
	];

	return (
		<>
			<title>Waktu Solat Malaysia</title>
			<meta
				name="description"
				content="Waktu Solat Untuk Malaysia Straight Dari JAKIM"
			/>
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link rel="icon" href="/favicon.ico" />

			<main className="bg-ambient relative min-h-screen flex flex-col items-center pt-10 pb-10 px-4 overflow-hidden">
				{/* Decorative Islamic pattern */}
				<div className="islamic-pattern pointer-events-none absolute inset-0" aria-hidden="true" />

				<div className="relative w-full max-w-3xl space-y-8">
					{/* Header */}
					<div className="rise-1 text-center space-y-3">
						<p
							className="font-uthmanic text-3xl text-dinar-400/90"
							dir="rtl"
							lang="ar"
							aria-hidden="true"
						>
							بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
						</p>
						<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-50">
							Waktu Solat <span className="text-acre-500">Malaysia</span>
						</h1>
						<p className="mx-auto max-w-xl text-slate-400 text-base md:text-lg leading-relaxed">
							Waktu solat terkini untuk seluruh Malaysia, terus dari
							JAKIM. Pilih kawasan anda dan solat on time, setiap hari.
						</p>
					</div>

					{/* Live usage stats dashboard */}
					<section aria-label="Statistik penggunaan" className="rise-2">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
							{statItems.map((s) => (
								<div
									key={s.label}
									className="rounded-2xl border border-night-800 bg-night-900/70 backdrop-blur px-4 py-4 text-center shadow-lg shadow-black/20"
								>
									<svg
										className="mx-auto h-5 w-5 text-dinar-400"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										strokeWidth={1.8}
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d={s.icon}
										/>
									</svg>
									<div className="mt-2 text-2xl md:text-3xl font-bold tabular-nums text-slate-50">
										{nf(s.value)}
									</div>
									<div className="mt-0.5 text-xs md:text-sm text-slate-400">
										{s.label}
									</div>
								</div>
							))}
						</div>

						{/* 14-day trend chart */}
						{stats?.recent?.length > 1 && (
							<div className="mt-3 rounded-2xl border border-night-800 bg-night-900/50 backdrop-blur px-4 pt-4 pb-2 shadow-lg shadow-black/20">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold text-slate-300">
										Trend 14 hari
									</h3>
									<span className="text-xs text-slate-500">
										{stats.unique_visitors} pelawat unik jumlah
									</span>
								</div>
								<VisitorTrend recent={stats.recent} />
							</div>
						)}

						{stats && stats.total_visits > 0 && (
							<p className="mt-3 text-center text-xs text-slate-500">
								Statistik dikemas kini secara langsung.
							</p>
						)}
					</section>

					{/* The Zone Selector (sticky CTA) */}
					<div className="rise-3">
						<ZoneSelector />
					</div>
				</div>
			</main>
		</>
	);
}