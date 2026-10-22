// 404 — a plain way back to what people came for.
import { Link } from "react-router";

export default function NotFound() {
	return (
		<main className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
			<title>Halaman tidak dijumpai | Waktu Solat</title>
			<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">
				Halaman tidak dijumpai
			</h1>
			<p className="mt-3 text-lg text-muted">
				Pautan ini mungkin sudah lama atau tersalah taip. Cuba salah satu daripada ini:
			</p>
			<ul className="mt-8 flex flex-wrap gap-3">
				{[
					["/", "Waktu solat"],
					["/quran", "Al-Quran"],
					["/hadith", "Hadis"],
				].map(([to, label]) => (
					<li key={to}>
						<Link
							to={to}
							className="inline-block rounded-full bg-raised px-5 py-2.5 text-[17px] font-semibold text-ink hover:bg-line"
						>
							{label}
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
