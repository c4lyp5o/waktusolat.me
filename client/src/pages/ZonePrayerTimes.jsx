import { useState, useEffect } from "react";
import { useParams } from "react-router";
import useSWR from "swr";

import { nameConverter } from "../lib/helper.jsx";

import Spin from "../components/Spin";
import LoadFailed from "../components/LoadFailed.jsx";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ZonePrayerTimes() {
	const { zone } = useParams();
	const [timeNow, setTimeNow] = useState(new Date());

	const { data, error } = useSWR(
		`/api/v1/waktusolat/today/${zone.toLowerCase()}`,
		fetcher,
		{ suspense: true },
	);

	useEffect(() => {
		const startTimer = () => {
			const timer = setInterval(() => {
				setTimeNow(new Date());
			}, 1000);
			return () => clearInterval(timer);
		};
		startTimer();
	}, []);

	if (!zone || !data) return <Spin />;
	if (error) return <LoadFailed />;

	const parseTime = (timeStr) => {
		const d = new Date();
		const [h, m, s] = timeStr.split(":");
		d.setHours(h, m, s || 0);
		return d;
	};

	const getTheme = () => {
		try {
			const syuruk = parseTime(data.data[0].syuruk);
			const maghrib = parseTime(data.data[0].maghrib);

			const isDay = timeNow >= syuruk && timeNow < maghrib;

			if (isDay) {
				return {
					gradient: "from-emerald-700 to-teal-900",
					textAccent: "text-emerald-100",
					highlightText: "text-emerald-300",
					cardActive: "bg-emerald-600 ring-emerald-100",
					progressBar: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]",
				};
			} else {
				return {
					gradient: "from-slate-900 via-indigo-950 to-slate-900",
					textAccent: "text-indigo-100",
					highlightText: "text-indigo-300",
					cardActive: "bg-indigo-600 ring-indigo-100",
					progressBar: "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.7)]",
				};
			}
		} catch (e) {
			return {
				gradient: "from-emerald-700 to-teal-900",
				textAccent: "text-emerald-100",
				highlightText: "text-emerald-300",
				cardActive: "bg-emerald-600 ring-emerald-100",
				progressBar: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]",
			};
		}
	};

	const theme = getTheme();

	const getCardStyle = (prayerName) => {
		const isCurrent =
			data.nextSolat.name === prayerName ||
			(prayerName === "dhuhr" &&
				["dhuhr", "jumaat"].includes(data.nextSolat.name));

		if (isCurrent) {
			return `${theme.cardActive} text-white border-transparent z-10 animate-breath ring-4 ring-offset-2 ring-offset-slate-900`;
		}
		return "bg-slate-800/50 text-slate-300 hover:bg-slate-800 border-slate-700 hover:border-emerald-500/50";
	};

	const calculateProgress = () => {
		try {
			const prayerOrder = ["fajr", "syuruk", "dhuhr", "asr", "maghrib", "isha"];
			const nextName =
				data.nextSolat.name === "jumaat" ? "dhuhr" : data.nextSolat.name;

			const nextIndex = prayerOrder.indexOf(nextName);
			const prevIndex = nextIndex === 0 ? 5 : nextIndex - 1;
			const prevName = prayerOrder[prevIndex];

			const nextTime = parseTime(data.data[0][nextName]);
			const prevTime = parseTime(data.data[0][prevName]);
			const now = new Date();

			if (nextTime < prevTime) {
				if (now < nextTime) {
					prevTime.setDate(prevTime.getDate() - 1);
				} else {
					nextTime.setDate(nextTime.getDate() + 1);
				}
			}

			if (nextIndex === 0 && now > prevTime && now > nextTime) {
				nextTime.setDate(nextTime.getDate() + 1);
			}

			const totalDuration = nextTime - prevTime;
			const elapsed = now - prevTime;

			const percent = (elapsed / totalDuration) * 100;
			return Math.min(Math.max(percent, 0), 100);
		} catch (e) {
			return 0;
		}
	};

	const progress = calculateProgress();

	return (
		<>
			<title>{data.zone}</title>
			<meta name="description" content={data.zone} />
			<link rel="icon" href="/favicon.ico" />

			<main className="min-h-screen bg-slate-950 flex flex-col items-center p-4 font-sans transition-colors duration-1000">
				<div className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
					{/* Dynamic Hero Section */}
					<section
						className={`relative bg-linear-to-br ${theme.gradient} p-8 md:p-12 text-center text-white pb-16 transition-all duration-1000 overflow-hidden`}
					>
						<div className="relative z-10 space-y-2">
							<h1 className="text-6xl md:text-7xl font-bold tracking-tight drop-shadow-lg">
								{timeNow.toLocaleTimeString()}
							</h1>

							<div
								className={`flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 font-medium text-lg mt-4 ${theme.textAccent}`}
							>
								<span>{data.today.day}</span>
								<span className="hidden md:inline opacity-60">•</span>
								<span>
									{data.today.hijri.split(" / ")[1]},{" "}
									{data.today.date.split(" / ")[1]}
								</span>
							</div>

							<div
								className={`uppercase tracking-widest text-xs font-bold mt-2 opacity-80 ${theme.textAccent}`}
							>
								{data.zone}
							</div>

							{/* Countdown Badge */}
							<div className="mt-8 inline-block bg-slate-900/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 shadow-sm">
								<p className="text-sm md:text-base font-medium">
									{nameConverter[data.nextSolat.name]} akan masuk dalam{" "}
									<span className={`font-bold ${theme.highlightText}`}>
										{data.nextSolat.hours === 0
											? `${data.nextSolat.minutes} minit`
											: `${data.nextSolat.hours} jam ${data.nextSolat.minutes} minit`}
									</span>
								</p>
							</div>
						</div>

						{/* Progress Bar Container */}
						<div className="absolute bottom-0 left-0 w-full h-2 bg-black/20">
							{/* Dynamic Progress Bar */}
							<div
								className={`h-full transition-all duration-1000 ease-linear ${theme.progressBar}`}
								style={{ width: `${progress}%` }}
							/>
						</div>
					</section>
					{/* Grid Section */}
					<section className="p-6 md:p-8 bg-slate-950/30">
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
							{[
								{ key: "fajr", label: "Subuh", time: data.data[0].fajr },
								{ key: "isyraq", label: "Syuruk", time: data.data[0].syuruk },
								{ key: "dhuhr", label: "Zuhur", time: data.data[0].dhuhr },
								{ key: "asr", label: "Asar", time: data.data[0].asr },
								{
									key: "maghrib",
									label: "Maghrib",
									time: data.data[0].maghrib,
								},
								{ key: "isha", label: "Isha", time: data.data[0].isha },
							].map((item) => (
								<div
									key={item.key}
									className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-500 ${getCardStyle(item.key)}`}
								>
									<span className="text-xs uppercase tracking-wider opacity-80 mb-1">
										{item.label}
									</span>
									<span className="text-2xl font-bold">
										{item.time.slice(0, 5)}
									</span>
								</div>
							))}
						</div>
					</section>
				</div>
			</main>
		</>
	);
}
