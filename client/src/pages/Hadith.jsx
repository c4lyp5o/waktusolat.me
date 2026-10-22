// /hadith — a hadith from one of the six books, read large. Opens on
// Sahih Bukhari straight away; "Hadis lain" draws another from the chosen
// book. The previous hadith stays (dimmed) while the next one loads.
import { useCallback, useEffect, useState } from "react";

const BOOKS = [
	{ id: "bukhari", name: "Sahih Bukhari", arabic: "صحيح البخاري" },
	{ id: "muslim", name: "Sahih Muslim", arabic: "صحيح مسلم" },
	{ id: "abudaud", name: "Sunan Abu Daud", arabic: "سنن أبي داود" },
	{ id: "nasai", name: "Sunan an-Nasa'i", arabic: "سنن النسائي" },
	{ id: "tirmizi", name: "Jami' at-Tirmizi", arabic: "جامع الترمذي" },
	{ id: "ibnumajah", name: "Sunan Ibnu Majah", arabic: "سنن ابن ماجه" },
];

export default function Hadith() {
	const [book, setBook] = useState(BOOKS[0]);
	const [hadith, setHadith] = useState(null); // { hadis, kitab, id }
	const [status, setStatus] = useState("loading"); // loading | ready | error
	const [copied, setCopied] = useState(false);

	const draw = useCallback(async (b) => {
		setStatus("loading");
		setCopied(false);
		try {
			const res = await fetch(`/api/v1/hadis/${b.id}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setHadith(await res.json());
			setStatus("ready");
		} catch {
			setStatus("error");
		}
	}, []);

	useEffect(() => {
		draw(book);
	}, [book, draw]);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(`${hadith.hadis}\n\n(${hadith.kitab ?? book.name})`);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	};

	return (
		<main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
			<title>Hadis | Waktu Solat</title>
			<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">Hadis</h1>
			<p className="mt-2 text-lg text-muted">Hadis rawak daripada enam kitab hadis utama.</p>

			<div className="mt-8 grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
				<fieldset className="m-0 min-w-0 border-0 p-0">
					<legend className="sr-only">Pilih kitab</legend>
					<ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
						{BOOKS.map((b) => {
							const active = b.id === book.id;
							return (
								<li key={b.id} className="shrink-0">
									<button
										type="button"
										aria-pressed={active}
										onClick={() => (active ? draw(b) : setBook(b))}
										className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-2.5 text-left lg:py-3 ${
											active
												? "bg-surface font-semibold text-ink"
												: "bg-raised text-muted hover:text-ink lg:bg-transparent"
										}`}
									>
										<span className="whitespace-nowrap text-[15px] lg:text-[17px]">{b.name}</span>
										<span
											lang="ar"
											dir="rtl"
											className="hidden font-uthmanic text-[20px] text-faint lg:inline"
										>
											{b.arabic}
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</fieldset>

				<section aria-live="polite" aria-busy={status === "loading"} className="min-w-0">
					{status === "error" ? (
						<p className="text-lg text-muted">Hadis tidak dapat dimuatkan. Cuba sebentar lagi.</p>
					) : !hadith ? (
						<p className="text-lg text-muted">Memuatkan hadis…</p>
					) : (
						<article className={`transition-opacity ${status === "loading" ? "opacity-40" : ""}`}>
							<p className="max-w-3xl text-[19px] leading-[1.75] text-ink md:text-[21px]">
								{hadith.hadis}
							</p>
							<footer className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-line pt-4">
								<span className="text-[17px] text-muted">{hadith.kitab ?? book.name}</span>
								<span lang="ar" dir="rtl" className="font-uthmanic text-[20px] text-faint">
									{book.arabic}
								</span>
							</footer>
						</article>
					)}
					<div className="mt-8 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => draw(book)}
							disabled={status === "loading"}
							className="rounded-full bg-ink px-6 py-3 text-[17px] font-semibold text-ground disabled:opacity-60"
						>
							Hadis lain
						</button>
						{hadith && status !== "error" && (
							<button
								type="button"
								onClick={copy}
								className="rounded-full bg-raised px-6 py-3 text-[17px] font-semibold text-ink hover:bg-line"
							>
								{copied ? "Disalin" : "Salin"}
							</button>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
