// /m/:id/edit — the mosque's editor (SPEC-mosque-editor.md): this week as
// the TV will show it, the programme list, settings, the TV link, and the
// edit link's safety. Opened from the edit link (#k=token) or from this
// phone's memory; the token is then stripped from the address bar.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import ZoneSearch from "../components/ZoneSearch.jsx";
import { api, tvPath } from "../lib/mosqueApi.js";
import { forgetMosque, fragmentToken, rememberMosque, tokenFor } from "../lib/mosqueKeys.js";
import { atText, dateText, nextDate, whenText } from "../lib/programmeText.js";
import { safeStorage } from "../lib/storage.js";
import { areaName } from "../lib/waktu/format.js";
import { mytIsoDate } from "../lib/waktu/mytime.js";
import { PRAYERS } from "../lib/waktu/names.js";
import { zoneInfo } from "../lib/zones.js";
import LinkCard from "../mosque/LinkCard.jsx";
import ProgrammeSheet from "../mosque/ProgrammeSheet.jsx";
import { BTN, BTN_DANGER, BTN_SOFT, ERROR, FIELD, LABEL } from "../mosque/ui.js";
import WeekPreview from "../mosque/WeekPreview.jsx";

const TABS = [
	["program", "Program"],
	["tetapan", "Tetapan"],
	["tv", "TV"],
	["keselamatan", "Keselamatan"],
];
const PRAYER_LABEL = {
	subuh: "Subuh",
	zohor: "Zohor",
	asar: "Asar",
	maghrib: "Maghrib",
	isyak: "Isyak",
};

export default function MosqueEditor() {
	const { id } = useParams();
	const storage = useMemo(safeStorage, []);
	// From the link's fragment (first open) or this phone's memory.
	const [token, setToken] = useState(
		() => fragmentToken(window.location.hash) ?? tokenFor(storage, id),
	);
	const [mosque, setMosque] = useState(null);
	const [status, setStatus] = useState("checking"); // checking | ok | invalid | gone | offline | no-token
	const [remembered, setRemembered] = useState(true);

	useEffect(() => {
		// Never leave the key in the address bar (screenshots, shared tabs).
		if (window.location.hash) {
			window.history.replaceState(window.history.state, "", window.location.pathname);
		}
	}, []);

	useEffect(() => {
		if (!token) return setStatus("no-token");
		let alive = true;
		(async () => {
			const r = await api(`/mosques/${id}`);
			if (!alive) return;
			if (!r.ok) return setStatus(r.status === 404 ? "gone" : "offline");
			// An empty edit checks the key without changing anything.
			const check = await api(`/mosques/${id}`, { method: "PATCH", token, json: {} });
			if (!alive) return;
			if (check.status === 401) return setStatus("invalid");
			if (!check.ok) return setStatus("offline");
			setMosque(check.data);
			setRemembered(rememberMosque(storage, { id, name: check.data.name, token }));
			setStatus("ok");
		})();
		return () => {
			alive = false;
		};
	}, [id, token, storage]);

	if (status !== "ok") return <Gate status={status} id={id} storage={storage} />;

	return (
		<Editor
			mosque={mosque}
			setMosque={setMosque}
			token={token}
			setToken={setToken}
			remembered={remembered}
			storage={storage}
		/>
	);
}

function Gate({ status, id, storage }) {
	const text = {
		checking: ["Membuka…", null],
		"no-token": [
			"Pautan edit diperlukan",
			"Buka pautan edit yang diberi semasa mendaftar. Telefon ini belum mengingat masjid ini.",
		],
		invalid: [
			"Pautan edit ini tidak sah lagi",
			"Mungkin pautan baharu telah dibuat. Minta pautan terkini daripada AJK yang menguruskannya.",
		],
		gone: ["Masjid ini tiada lagi", "Ia mungkin telah dipadam."],
		offline: ["Tidak dapat menyambung", "Semak sambungan internet dan cuba lagi."],
	}[status];
	useEffect(() => {
		if (status === "invalid" || status === "gone") forgetMosque(storage, id);
	}, [status, storage, id]);
	return (
		<main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
			<title>Editor masjid | Waktu Solat</title>
			<h1 className="text-2xl font-semibold">{text[0]}</h1>
			{text[1] && <p className="mt-3 text-lg text-muted">{text[1]}</p>}
			{status !== "checking" && (
				<Link to="/m/baru" className={`${BTN_SOFT} mt-8`}>
					Ke halaman masjid
				</Link>
			)}
		</main>
	);
}

function Editor({ mosque, setMosque, token, setToken, remembered, storage }) {
	const [programmes, setProgrammes] = useState(null);
	const [version, setVersion] = useState(0);
	const [sheet, setSheet] = useState(undefined); // undefined closed, null new, object edit
	const today = mytIsoDate(Date.now());

	const reload = useCallback(async () => {
		const r = await api(`/mosques/${mosque.id}/programmes`);
		if (r.ok) setProgrammes(r.data);
		setVersion((v) => v + 1);
	}, [mosque.id]);

	useEffect(() => {
		reload();
	}, [reload]);

	return (
		<main className="mx-auto max-w-3xl px-4 pb-10 md:px-6">
			<title>{`${mosque.name} | Editor masjid`}</title>
			<header className="pt-8 md:pt-12">
				<p className="text-[15px] text-faint">Editor masjid</p>
				<h1 className="text-2xl font-semibold tracking-tight md:text-[32px]">{mosque.name}</h1>
				<p className="mt-1 text-[17px] text-muted">
					{areaName(zoneInfo(mosque.zone)?.name)} · {mosque.zone.toUpperCase()}
				</p>
				{!remembered && (
					<p className="mt-4 rounded-xl bg-surface p-4 text-[15px] text-muted">
						Telefon ini tidak dapat mengingat masjid ini (storan pelayar disekat). Simpan pautan
						edit anda.
					</p>
				)}
			</header>

			<nav
				aria-label="Bahagian"
				className="sticky top-0 z-20 -mx-4 mt-6 border-b border-line bg-ground px-4 md:-mx-6 md:px-6"
			>
				<ul className="no-scrollbar flex gap-1 overflow-x-auto">
					{TABS.map(([anchor, label]) => (
						<li key={anchor}>
							<a
								href={`#${anchor}`}
								className="block px-3 py-3 text-[15px] font-semibold text-muted hover:text-ink"
							>
								{label}
							</a>
						</li>
					))}
				</ul>
			</nav>

			<section id="program" aria-labelledby="h-program" className="scroll-mt-14 pt-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<h2 id="h-program" className="text-xl font-semibold">
						Minggu ini di TV
					</h2>
					<button
						type="button"
						onClick={() => setSheet(null)}
						className={`${BTN} whitespace-nowrap`}
					>
						Tambah program
					</button>
				</div>
				<div className="mt-4">
					<WeekPreview mosqueId={mosque.id} zone={mosque.zone} version={version} />
				</div>

				<h3 className="mt-10 text-[17px] font-semibold">Semua program</h3>
				{programmes === null ? (
					<p className="mt-3 text-[17px] text-muted">Memuatkan…</p>
				) : programmes.length === 0 ? (
					<p className="mt-3 text-[17px] text-muted">
						Belum ada program. Mulakan dengan kuliah mingguan, contohnya Kuliah Maghrib setiap
						Isnin.
					</p>
				) : (
					<ul className="mt-3">
						{programmes.map((p) => (
							<ProgrammeRow
								key={p.id}
								p={p}
								today={today}
								mosqueId={mosque.id}
								token={token}
								onEdit={() => setSheet(p)}
								onChanged={reload}
							/>
						))}
					</ul>
				)}
			</section>

			<Settings
				mosque={mosque}
				token={token}
				onSaved={(m) => {
					setMosque(m);
					rememberMosque(storage, { id: m.id, name: m.name, token });
					setVersion((v) => v + 1);
				}}
			/>

			<section id="tv" aria-labelledby="h-tv" className="scroll-mt-14 pt-12">
				<h2 id="h-tv" className="text-xl font-semibold">
					Pautan TV
				</h2>
				<div className="mt-4">
					<LinkCard title="Buka pautan ini pada TV masjid" path={tvPath(mosque)} open big>
						Pada pelayar TV (Chrome, atau pelayar terbina dalam), mod landskap. Biarkan terbuka: ia
						menyegar sendiri setiap hari dan terus berfungsi jika internet terputus.
					</LinkCard>
				</div>
			</section>

			<Safety mosque={mosque} token={token} setToken={setToken} storage={storage} />

			<ProgrammeSheet
				mosqueId={mosque.id}
				token={token}
				programme={sheet}
				onClose={() => setSheet(undefined)}
				onSaved={reload}
			/>
		</main>
	);
}

function ProgrammeRow({ p, today, mosqueId, token, onEdit, onChanged }) {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const next = nextDate(p, today);
	const off = next && p.skip.includes(next);

	// "Cuti minggu ini": skip (or un-skip) the next date in one tap.
	const toggleSkip = async () => {
		setBusy(true);
		const skip = off ? p.skip.filter((d) => d !== next) : [...p.skip, next];
		const r = await api(`/mosques/${mosqueId}/programmes/${p.id}`, {
			method: "PATCH",
			token,
			json: { skip },
		});
		setBusy(false);
		setError(r.ok ? null : r.message);
		if (r.ok) onChanged();
	};

	return (
		<li className="flex gap-4 border-b border-line py-4">
			{p.photo ? (
				<img src={p.photo} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
			) : (
				<span aria-hidden="true" className="h-14 w-14 shrink-0 rounded-xl bg-raised" />
			)}
			<div className="min-w-0 flex-1">
				<p className="text-[17px] font-semibold text-ink">{p.title}</p>
				<p className="text-[15px] text-muted">
					{whenText(p, today)}, {atText(p.at)}
				</p>
				{p.speaker && <p className="text-[15px] text-muted">{p.speaker}</p>}
				{off && (
					<p className="mt-1 text-[15px] font-semibold text-accent">
						Cuti pada {dateText(next, today)}
					</p>
				)}
				{p.repeat === "once" && p.date < today && (
					<p className="mt-1 text-[15px] text-faint">Sudah berlalu</p>
				)}
				<div className="mt-3 flex flex-wrap gap-2">
					<button type="button" onClick={onEdit} className={BTN_SOFT}>
						Sunting
					</button>
					{next && (
						<button type="button" onClick={toggleSkip} disabled={busy} className={BTN_SOFT}>
							{off ? "Batal cuti" : "Cuti minggu ini"}
						</button>
					)}
				</div>
				{error && <p className={ERROR}>{error}</p>}
			</div>
		</li>
	);
}

function Stepper({ id, label, value, min, max, onChange }) {
	const clamp = (n) => Math.min(max, Math.max(min, n));
	return (
		<div className="flex items-center justify-between gap-3 border-b border-line py-2">
			<label htmlFor={id} className="text-[17px]">
				{label}
			</label>
			<div className="flex items-center gap-2">
				<button
					type="button"
					aria-label={`Kurangkan ${label}`}
					onClick={() => onChange(clamp(value - 1))}
					className={`${BTN_SOFT} w-12 px-0`}
				>
					−
				</button>
				<input
					id={id}
					type="number"
					inputMode="numeric"
					min={min}
					max={max}
					value={value}
					onChange={(e) => onChange(clamp(Number.parseInt(e.target.value || "0", 10)))}
					className="h-12 w-16 rounded-xl px-2 text-center text-[17px] tabular-nums"
				/>
				<button
					type="button"
					aria-label={`Tambah ${label}`}
					onClick={() => onChange(clamp(value + 1))}
					className={`${BTN_SOFT} w-12 px-0`}
				>
					+
				</button>
			</div>
		</div>
	);
}

function Settings({ mosque, token, onSaved }) {
	const [form, setForm] = useState(mosque);
	const [picking, setPicking] = useState(false);
	const [busy, setBusy] = useState(false);
	const [result, setResult] = useState(null);
	useEffect(() => setForm(mosque), [mosque]);

	const save = async (e) => {
		e.preventDefault();
		setBusy(true);
		const { name, zone, iqamah, jumaat, solat } = form;
		const r = await api(`/mosques/${mosque.id}`, {
			method: "PATCH",
			token,
			json: { name, zone, iqamah, jumaat, solat },
		});
		setBusy(false);
		setResult(r);
		if (r.ok) onSaved(r.data);
	};

	return (
		<section id="tetapan" aria-labelledby="h-tetapan" className="scroll-mt-14 pt-12">
			<h2 id="h-tetapan" className="text-xl font-semibold">
				Tetapan
			</h2>
			<form onSubmit={save} className="mt-4 grid gap-8">
				<div>
					<label htmlFor="s-name" className={LABEL}>
						Nama masjid atau surau
					</label>
					<input
						id="s-name"
						required
						maxLength={60}
						value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						className={FIELD}
					/>
				</div>
				<div>
					{picking ? (
						<ZoneSearch
							onPick={(zone) => {
								setForm({ ...form, zone });
								setPicking(false);
							}}
							label="Zon waktu solat: cari daerah atau negeri"
						/>
					) : (
						<>
							<p className={LABEL}>Zon waktu solat</p>
							<div className="mt-2 flex items-center justify-between gap-4 rounded-xl bg-surface px-4 py-3">
								<span className="text-[17px]">
									{areaName(zoneInfo(form.zone)?.name)} · {form.zone.toUpperCase()}
								</span>
								<button type="button" onClick={() => setPicking(true)} className={BTN_SOFT}>
									Tukar
								</button>
							</div>
						</>
					)}
				</div>
				<fieldset className="m-0 border-0 p-0">
					<legend className={LABEL}>Minit dari azan ke iqamah</legend>
					<div className="mt-2">
						{PRAYERS.map((p) => (
							<Stepper
								key={p}
								id={`iq-${p}`}
								label={PRAYER_LABEL[p]}
								value={form.iqamah[p]}
								min={0}
								max={60}
								onChange={(v) => setForm({ ...form, iqamah: { ...form.iqamah, [p]: v } })}
							/>
						))}
						<Stepper
							id="iq-jumaat"
							label="Jumaat"
							value={form.jumaat}
							min={0}
							max={90}
							onChange={(v) => setForm({ ...form, jumaat: v })}
						/>
					</div>
				</fieldset>
				<fieldset className="m-0 border-0 p-0">
					<legend className={LABEL}>Paparan "solat sedang didirikan"</legend>
					<div className="mt-2">
						<Stepper
							id="solat"
							label="Minit selepas iqamah"
							value={form.solat}
							min={1}
							max={60}
							onChange={(v) => setForm({ ...form, solat: v })}
						/>
					</div>
				</fieldset>
				<div className="flex flex-wrap items-center gap-4">
					<button type="submit" disabled={busy} className={BTN}>
						{busy ? "Menyimpan…" : "Simpan tetapan"}
					</button>
					<p
						aria-live="polite"
						className={result && !result.ok ? ERROR.replace("mt-2 ", "") : "text-[15px] text-muted"}
					>
						{result ? (result.ok ? "Disimpan." : result.message) : ""}
					</p>
				</div>
			</form>
		</section>
	);
}

function Safety({ mosque, token, setToken, storage }) {
	const navigate = useNavigate();
	const [newLink, setNewLink] = useState(null);
	const [confirmName, setConfirmName] = useState("");
	const [error, setError] = useState(null);
	const [busy, setBusy] = useState(false);

	const rotate = async () => {
		if (
			!window.confirm("Buat pautan edit baharu? Pautan lama akan berhenti berfungsi serta-merta.")
		)
			return;
		setBusy(true);
		const r = await api(`/mosques/${mosque.id}/token`, { method: "POST", token });
		setBusy(false);
		if (!r.ok) return setError(r.message);
		rememberMosque(storage, { id: mosque.id, name: mosque.name, token: r.data.token });
		setToken(r.data.token);
		setNewLink(r.data.editPath);
	};

	const remove = async (e) => {
		e.preventDefault();
		setBusy(true);
		const r = await api(`/mosques/${mosque.id}`, { method: "DELETE", token });
		setBusy(false);
		if (!r.ok) return setError(r.message);
		forgetMosque(storage, mosque.id);
		navigate("/m/baru");
	};

	return (
		<section id="keselamatan" aria-labelledby="h-keselamatan" className="scroll-mt-14 pt-12">
			<h2 id="h-keselamatan" className="text-xl font-semibold">
				Keselamatan
			</h2>
			<div className="mt-4 rounded-2xl bg-surface p-5">
				<h3 className="text-[17px] font-semibold">Pautan edit bocor?</h3>
				<p className="mt-1 text-[15px] text-muted">
					Buat pautan baharu. Pautan lama berhenti berfungsi, termasuk di telefon AJK lain.
				</p>
				{newLink ? (
					<div className="mt-4">
						<LinkCard title="Pautan edit baharu (rahsia)" path={newLink} whatsapp>
							Simpan sekarang: ia tidak akan ditunjukkan lagi.
						</LinkCard>
					</div>
				) : (
					<button type="button" onClick={rotate} disabled={busy} className={`${BTN_SOFT} mt-4`}>
						Tukar pautan edit
					</button>
				)}
			</div>
			<form onSubmit={remove} className="mt-4 rounded-2xl bg-surface p-5">
				<h3 className="text-[17px] font-semibold">Padam masjid ini</h3>
				<p className="mt-1 text-[15px] text-muted">
					Semua program dan gambar turut dipadam, dan paparan TV berhenti. Taip nama masjid untuk
					mengesahkan.
				</p>
				<label htmlFor="confirm-name" className="sr-only">
					Taip {mosque.name}
				</label>
				<input
					id="confirm-name"
					value={confirmName}
					onChange={(e) => setConfirmName(e.target.value)}
					placeholder={mosque.name}
					autoComplete="off"
					className={FIELD}
				/>
				<button
					type="submit"
					disabled={busy || confirmName.trim() !== mosque.name}
					className={`${BTN_DANGER} mt-4`}
				>
					Padam masjid
				</button>
			</form>
			{error && (
				<p className={ERROR} role="alert">
					{error}
				</p>
			)}
		</section>
	);
}
