// /m/baru — register a mosque for the TV display (SPEC-mosque-editor.md),
// then the one moment the edit link is shown: save it. Also lists the
// mosques this phone already manages.
import { useMemo, useState } from "react";
import { Link } from "react-router";
import tvDisplay from "../assets/tv-display.webp";
import ZoneSearch from "../components/ZoneSearch.jsx";
import { api, tvPath } from "../lib/mosqueApi.js";
import { forgetMosque, loadMosques, rememberMosque } from "../lib/mosqueKeys.js";
import { safeStorage } from "../lib/storage.js";
import { areaName } from "../lib/waktu/format.js";
import { zoneInfo } from "../lib/zones.js";
import LinkCard from "../mosque/LinkCard.jsx";
import { BTN, BTN_SOFT, ERROR, FIELD, LABEL } from "../mosque/ui.js";

export default function MosqueNew() {
	const storage = useMemo(safeStorage, []);
	const [mine, setMine] = useState(() => loadMosques(storage));
	const [created, setCreated] = useState(null);

	if (created) return <Saved created={created} />;

	return (
		<main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
			<title>Daftar masjid | Waktu Solat</title>
			<div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_28rem]">
				<div className="min-w-0">
					<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">
						Paparan TV untuk masjid anda
					</h1>
					<p className="mt-3 max-w-2xl text-lg text-muted">
						Waktu solat, iqamah dan program masjid anda di TV dewan solat. Percuma, tanpa akaun:
						anda akan diberi satu pautan untuk mengurusnya.
					</p>

					{mine.length > 0 && (
						<section aria-labelledby="mine" className="mt-10">
							<h2 id="mine" className="text-xl font-semibold">
								Masjid anda di telefon ini
							</h2>
							<ul className="mt-3">
								{mine.map((m) => (
									<li key={m.id} className="flex items-center gap-3 border-b border-line py-3">
										<Link
											to={`/m/${m.id}/edit`}
											className="min-w-0 flex-1 text-[17px] font-semibold text-ink underline-offset-2 hover:underline"
										>
											{m.name}
										</Link>
										<button
											type="button"
											onClick={() => {
												if (
													!window.confirm(
														`Lupakan ${m.name} di telefon ini? Anda perlukan pautan edit untuk membukanya semula.`,
													)
												)
													return;
												forgetMosque(storage, m.id);
												setMine(loadMosques(storage));
											}}
											className="text-[15px] text-faint underline underline-offset-2"
										>
											Lupakan
										</button>
									</li>
								))}
							</ul>
						</section>
					)}

					<RegisterForm
						onCreated={(data) => {
							rememberMosque(storage, {
								id: data.mosque.id,
								name: data.mosque.name,
								token: data.token,
							});
							setCreated(data);
							window.scrollTo(0, 0);
						}}
					/>
				</div>

				<aside className="self-start rounded-2xl bg-surface p-6">
					<img
						src={tvDisplay}
						width="1200"
						height="675"
						alt="Paparan TV: kiraan ke Zohor, waktu solat hari ini dan ayat Al-Quran"
						className="w-full rounded-lg"
					/>
					<ol className="mt-5 grid gap-3 text-[17px] text-muted">
						<li>
							<span className="font-semibold text-ink">1. Daftar</span> nama masjid dan zon.
						</li>
						<li>
							<span className="font-semibold text-ink">2. Simpan pautan edit</span> yang diberi.
						</li>
						<li>
							<span className="font-semibold text-ink">3. Buka pautan TV</span> pada pelayar TV
							masjid, dan biarkan.
						</li>
					</ol>
				</aside>
			</div>
		</main>
	);
}

function RegisterForm({ onCreated }) {
	const [name, setName] = useState("");
	const [zone, setZone] = useState(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);

	const submit = async (e) => {
		e.preventDefault();
		if (!zone) return setError({ field: "zone", message: "Pilih zon waktu solat." });
		setBusy(true);
		setError(null);
		const r = await api("/mosques", { method: "POST", json: { name, zone } });
		setBusy(false);
		if (r.ok) onCreated(r.data);
		else setError(r);
	};

	return (
		<form onSubmit={submit} className="mt-10 grid max-w-2xl gap-8" aria-labelledby="daftar">
			<h2 id="daftar" className="text-xl font-semibold">
				Daftar masjid
			</h2>
			<div>
				<label htmlFor="m-name" className={LABEL}>
					Nama masjid atau surau
				</label>
				<input
					id="m-name"
					required
					maxLength={60}
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Contoh: Masjid Al-Ikhlas"
					className={FIELD}
				/>
				{error?.field === "name" && <p className={ERROR}>{error.message}</p>}
			</div>
			<div>
				{zone ? (
					<>
						<p className={LABEL}>Zon waktu solat</p>
						<div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3">
							<span>
								<span className="block text-[17px] text-ink">{areaName(zoneInfo(zone).name)}</span>
								<span className="text-[15px] text-faint">
									{zoneInfo(zone).negeri} · {zone.toUpperCase()}
								</span>
							</span>
							<button type="button" onClick={() => setZone(null)} className={BTN_SOFT}>
								Tukar
							</button>
						</div>
					</>
				) : (
					<ZoneSearch onPick={setZone} label="Zon waktu solat: cari daerah atau negeri" />
				)}
				{error?.field === "zone" && <p className={ERROR}>{error.message}</p>}
			</div>
			{error && !["name", "zone"].includes(error.field) && (
				<p className={ERROR} role="alert">
					{error.message}
				</p>
			)}
			<div>
				<button type="submit" disabled={busy} className={BTN}>
					{busy ? "Mendaftar…" : "Daftar"}
				</button>
			</div>
		</form>
	);
}

// The only time the edit link is shown by the server.
function Saved({ created }) {
	const { mosque, editPath } = created;
	return (
		<main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
			<title>Simpan pautan edit | Waktu Solat</title>
			<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">
				{mosque.name} sudah didaftar
			</h1>
			<p className="mt-3 text-lg text-muted">
				Simpan pautan edit di bawah, contohnya hantar ke WhatsApp anda sendiri atau kepada AJK lain.
				Pautan ini <span className="font-semibold text-ink">tidak akan ditunjukkan lagi</span>.
				Telefon ini akan mengingatnya, tetapi jika telefon bertukar, pautan inilah kuncinya.
			</p>
			<div className="mt-8 grid gap-4">
				<LinkCard title="Pautan edit (rahsia)" path={editPath} whatsapp>
					Sesiapa yang ada pautan ini boleh mengubah paparan TV masjid anda.
				</LinkCard>
				<LinkCard title="Pautan TV" path={tvPath(mosque)} open>
					Buka pada pelayar TV masjid, dalam mod landskap, dan biarkan.
				</LinkCard>
			</div>
			<Link to={`/m/${mosque.id}/edit`} className={`${BTN} mt-8`}>
				Teruskan: tambah program
			</Link>
		</main>
	);
}
