import { useEffect } from "react";
import ZoneSelector from "../components/ZoneSelector";

export default function Landing() {
	useEffect(() => {
		const visit = async () => {
			try {
				await fetch("/api/v1/thanks");
			} catch (error) {
				// Silent fail
			}
		};
		visit();
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

			{/* Hero Container */}
			<main className="min-h-screen bg-slate-950 flex flex-col items-center pt-6 pb-10 px-4">
				<div className="w-full max-w-3xl space-y-8">
					{/* Header Text */}
					<div className="text-center space-y-2">
						<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100">
							Waktu Solat <span className="text-emerald-600">Malaysia</span>
						</h1>
					</div>

					{/* The Selector Component */}
					<ZoneSelector />
				</div>
			</main>
		</>
	);
}
