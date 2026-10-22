// /radio — Islamic radio stations with one shared player: one stream at a
// time, play/pause from the list or the player. On phones the player sits
// above the bottom bar; on desktop it is a panel beside the list.
import { useEffect, useRef, useState } from "react";

const STATIONS = [
	{
		id: "rodja",
		name: "Radio Rodja",
		location: "Bogor, Indonesia",
		url: "https://radioonline.co.id/#rodja",
		logo: "https://cdn.webrad.io/images/logos/radioonline-co-id/rodja.png",
		stream: "https://radioislamindonesia.com/rodja.mp3?_=2",
	},
	{
		id: "muslim",
		name: "Radio Muslim",
		location: "Yogyakarta, Indonesia",
		url: "https://radioonline.co.id/#muslim",
		logo: "https://cdn.webrad.io/images/logos/radioonline-co-id/muslim.png",
		stream: "https://cp.phpmystream.com/radioSSLnew/s/75",
	},
	{
		id: "bass",
		name: "Radio Bass",
		location: "Salatiga, Indonesia",
		url: "https://radioonline.co.id/#bass-salatiga",
		logo: "https://cdn.webrad.io/images/logos/radioonline-co-id/bass-salatiga.png",
		// http only: browsers block it on an https page (shown as unavailable).
		stream: "http://live.bassfm.id/;",
	},
];

const STATUS_TEXT = {
	idle: "Pilih stesen untuk mula mendengar.",
	loading: "Menyambung…",
	playing: "Sedang bersiaran",
	paused: "Dijeda",
	error: "Stesen ini tidak dapat dimainkan sekarang.",
};

function PlayIcon({ playing }) {
	return (
		<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
			{playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
		</svg>
	);
}

export default function Radio() {
	const audio = useRef(null);
	const [station, setStation] = useState(null);
	const [status, setStatus] = useState("idle");

	const play = (s) => {
		const el = audio.current;
		if (station?.id === s.id && status === "playing") {
			el.pause();
			return;
		}
		if (station?.id !== s.id) {
			setStation(s);
			el.src = s.stream;
		}
		setStatus("loading");
		el.play().catch(() => setStatus("error"));
	};

	// Stop the stream when leaving the page.
	useEffect(() => () => audio.current?.pause(), []);

	const isPlaying = (s) => station?.id === s.id && status === "playing";

	return (
		<main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
			<title>Radio | Waktu Solat</title>
			<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">Radio</h1>
			<p className="mt-2 text-lg text-muted">Stesen radio Islam, siaran langsung.</p>

			{/* biome-ignore lint/a11y/useMediaCaption: live radio has no captions */}
			<audio
				ref={audio}
				preload="none"
				onPlaying={() => setStatus("playing")}
				onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
				onWaiting={() => setStatus("loading")}
				onError={() => station && setStatus("error")}
			/>

			<div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<ul className="min-w-0" aria-label="Stesen radio">
					{STATIONS.map((s) => (
						<li key={s.id} className="flex items-center gap-4 border-b border-line py-4">
							<img
								src={s.logo}
								alt=""
								width="56"
								height="56"
								loading="lazy"
								className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1.5"
							/>
							<div className="min-w-0 flex-1">
								<p className="text-[17px] text-ink">{s.name}</p>
								<p className="text-[15px] text-faint">
									{s.location} ·{" "}
									<a
										href={s.url}
										target="_blank"
										rel="noreferrer"
										className="underline-offset-2 hover:underline"
									>
										laman asal
									</a>
								</p>
							</div>
							<button
								type="button"
								onClick={() => play(s)}
								aria-label={`${isPlaying(s) ? "Jeda" : "Main"} ${s.name}`}
								aria-pressed={isPlaying(s)}
								className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
									isPlaying(s) ? "bg-ink text-ground" : "bg-raised text-ink hover:bg-line"
								}`}
							>
								<PlayIcon playing={isPlaying(s)} />
							</button>
						</li>
					))}
				</ul>

				{/* The player: a bar above the phone's bottom navigation, a panel on
				    desktop. Shown once a station has been chosen. */}
				<section
					aria-label="Pemain radio"
					aria-live="polite"
					className={`${
						station
							? "fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex"
							: "hidden"
					} items-center gap-4 border-t border-line bg-surface px-4 py-3 md:static md:flex md:self-start md:rounded-2xl md:border-0 md:p-6`}
				>
					<div className="min-w-0 flex-1">
						<p className="truncate text-[17px] font-semibold text-ink">
							{station?.name ?? "Radio"}
						</p>
						<p className={`text-[15px] ${status === "error" ? "text-ink" : "text-faint"}`}>
							{status === "playing" && (
								<span className="pulse-dot mr-2 inline-block align-middle" aria-hidden="true" />
							)}
							{STATUS_TEXT[status]}
						</p>
					</div>
					{station && (
						<button
							type="button"
							onClick={() => play(station)}
							aria-label={status === "playing" ? "Jeda" : "Main"}
							className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-ground"
						>
							<PlayIcon playing={status === "playing"} />
						</button>
					)}
				</section>
			</div>
		</main>
	);
}
