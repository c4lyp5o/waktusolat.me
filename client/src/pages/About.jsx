// /about — what this is, the real visitor counts, where the data comes
// from, the free TV display for mosques, and the photo credits (every
// mosque photograph used on the site, with creator and licence).
import { useEffect, useState } from "react";
import tvDisplay from "../assets/tv-display.webp";
import { MOSQUE_CREDITS } from "../lib/mosques.js";
import { zoneIndex } from "../lib/zones.js";

const nf = (n) => Number(n ?? 0).toLocaleString("ms-MY");

function useVisitorStats() {
	const [stats, setStats] = useState(null);
	useEffect(() => {
		let cancelled = false;
		fetch("/api/v1/visitors/stats")
			.then((r) => r.json())
			.then((json) => !cancelled && json?.data && setStats(json.data))
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);
	return stats;
}

export default function About() {
	const stats = useVisitorStats();
	return (
		<main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
			<title>Tentang | Waktu Solat</title>
			<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_30rem]">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">
						Tentang Waktu Solat
					</h1>
					<p className="mt-3 max-w-2xl text-lg text-muted">
						Waktu solat untuk {zoneIndex.length} zon di seluruh Malaysia, terus dari JAKIM e-Solat,
						bersama Al-Quran, hadis, radio dan ruang sembang. Percuma dan sumber terbuka.
					</p>

					{stats && (
						<dl className="mt-8 grid max-w-xl grid-cols-3 gap-4">
							{[
								["Kunjungan", stats.total_visits],
								["Pelawat", stats.unique_visitors],
								["Hari aktif", stats.active_days],
							].map(([label, value]) => (
								<div key={label}>
									<dt className="text-[15px] text-faint">{label}</dt>
									<dd className="mt-1 text-2xl font-semibold tabular-nums">{nf(value)}</dd>
								</div>
							))}
						</dl>
					)}

					<section aria-labelledby="sumber" className="mt-12">
						<h2 id="sumber" className="text-xl font-semibold">
							Sumber data
						</h2>
						<ul className="mt-3 max-w-2xl space-y-2 text-[17px] text-muted">
							<li>
								<span className="text-ink">Waktu solat:</span> JAKIM e-Solat, setahun penuh bagi
								setiap zon, disemak semula setiap 6 jam.
							</li>
							<li>
								<span className="text-ink">Al-Quran:</span> teks Arab dengan terjemahan.
							</li>
							<li>
								<span className="text-ink">Hadis:</span> enam kitab: Bukhari, Muslim, Abu Daud,
								Nasa'i, Tirmizi dan Ibnu Majah.
							</li>
						</ul>
					</section>

					<section aria-labelledby="sumber-terbuka" className="mt-12">
						<h2 id="sumber-terbuka" className="text-xl font-semibold">
							Sumber terbuka
						</h2>
						<p className="mt-3 max-w-2xl text-[17px] text-muted">
							Kod sumber ada di{" "}
							<a
								href="https://github.com/c4lyp5o/waktusolat.me"
								target="_blank"
								rel="noreferrer"
								className="font-semibold text-ink underline underline-offset-2"
							>
								github.com/c4lyp5o/waktusolat.me
							</a>
							. Sumbangan dialu-alukan.
						</p>
					</section>
				</div>

				<section aria-labelledby="tv" className="self-start rounded-2xl bg-surface p-6">
					<h2 id="tv" className="text-xl font-semibold">
						Paparan TV untuk masjid
					</h2>
					<p className="mt-2 text-[17px] text-muted">
						Buka <span className="font-semibold text-ink">waktusolat.me/tv/kod-zon</span> pada
						pelayar TV masjid atau surau anda. Kiraan ke azan dan iqamah, Jumaat pada hari Jumaat,
						serta ayat dan hadis bergilir. Terus berfungsi walaupun internet terputus.
					</p>
					<img
						src={tvDisplay}
						width="1200"
						height="675"
						alt="Paparan TV: kiraan ke Zohor, waktu solat hari ini dan ayat Al-Quran"
						className="mt-5 w-full rounded-lg"
						loading="lazy"
					/>
					<p className="mt-4 text-[15px] text-faint">
						Tetapan dalam pautan, contohnya{" "}
						<span className="break-all text-ink">
							/tv/wly01?nama=Masjid%20Anda&amp;iqamah=10,10,10,5,10
						</span>
						.
					</p>
				</section>
			</div>

			<section id="kredit-foto" aria-labelledby="kredit" className="mt-16">
				<h2 id="kredit" className="text-xl font-semibold">
					Kredit foto
				</h2>
				<p className="mt-2 max-w-2xl text-[17px] text-muted">
					Foto masjid di halaman zon adalah daripada Wikimedia Commons, digunakan di bawah lesen
					masing-masing.
				</p>
				<ul className="mt-5 grid gap-x-10 md:grid-cols-2">
					{MOSQUE_CREDITS.map((m) => (
						<li key={m.negeri} className="border-t border-line py-3">
							<p className="text-[15px] text-ink">{m.name}</p>
							<p className="text-[13px] text-faint">
								<a
									href={m.page}
									target="_blank"
									rel="noreferrer"
									className="underline-offset-2 hover:underline"
								>
									{m.creator}
								</a>
								,{" "}
								<a
									href={m.licenseUrl}
									target="_blank"
									rel="noreferrer"
									className="underline-offset-2 hover:underline"
								>
									{m.license}
								</a>
							</p>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
