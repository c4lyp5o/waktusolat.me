// ProgrammeSheet.jsx — add or edit one programme, in a native <dialog>
// (a bottom sheet on phones). The photo is chosen here too: it is shrunk in
// the browser and uploaded right after the programme is saved.
import { useEffect, useRef, useState } from "react";
import { api } from "../lib/mosqueApi.js";
import { squareJpeg } from "../lib/photo.js";
import { PRAYER_NAMES } from "../lib/programmeText.js";
import { DAYS } from "../lib/waktu/format.js";
import { BTN, BTN_DANGER, BTN_SOFT, ERROR, FIELD, LABEL } from "./ui.js";

const EMPTY = {
	title: "",
	speaker: "",
	note: "",
	repeat: "weekly",
	weekday: 1,
	date: "",
	from: "",
	until: "",
	atKind: "after",
	after: "maghrib",
	time: "21:00",
};

function toForm(p) {
	if (!p) return EMPTY;
	return {
		...EMPTY,
		title: p.title,
		speaker: p.speaker ?? "",
		note: p.note ?? "",
		repeat: p.repeat,
		weekday: p.weekday ?? 1,
		date: p.date ?? "",
		from: p.from ?? "",
		until: p.until ?? "",
		atKind: p.at.time ? "time" : "after",
		after: p.at.after ?? "maghrib",
		time: p.at.time ?? "21:00",
	};
}

function toBody(f, existing) {
	const at = f.atKind === "time" ? { time: f.time } : { after: f.after };
	const base = {
		title: f.title,
		speaker: f.speaker || null,
		note: f.note || null,
		repeat: f.repeat,
		at,
	};
	if (f.repeat === "once") return { ...base, date: f.date };
	// Keep skip dates that still fit (the editor's "cuti" list).
	const skip = (existing?.repeat === "weekly" ? existing.skip : []).filter(
		(d) => (!f.from || d >= f.from) && (!f.until || d <= f.until),
	);
	return {
		...base,
		weekday: Number(f.weekday),
		from: f.from || null,
		until: f.until || null,
		skip: existing?.weekday === Number(f.weekday) ? skip : [],
	};
}

// programme: undefined = closed, null = new, object = edit.
export default function ProgrammeSheet({ mosqueId, token, programme, onClose, onSaved }) {
	const dialog = useRef(null);
	const [form, setForm] = useState(EMPTY);
	const [photo, setPhoto] = useState({ blob: null, url: null, remove: false });
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState(null);
	const open = programme !== undefined;

	useEffect(() => {
		const d = dialog.current;
		if (open) {
			setForm(toForm(programme));
			setPhoto({ blob: null, url: null, remove: false });
			setError(null);
			if (!d.open) d.showModal();
		} else if (d.open) {
			d.close();
		}
	}, [open, programme]);

	const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
	const shownPhoto = photo.url ?? (photo.remove ? null : programme?.photo);

	const pickPhoto = async (e) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;
		try {
			const blob = await squareJpeg(file);
			if (photo.url) URL.revokeObjectURL(photo.url);
			setPhoto({ blob, url: URL.createObjectURL(blob), remove: false });
			setError(null);
		} catch {
			setError({ message: "Gambar ini tidak dapat dibaca. Cuba gambar lain." });
		}
	};

	const save = async (e) => {
		e.preventDefault();
		setBusy(true);
		setError(null);
		const body = toBody(form, programme);
		const saved = programme
			? await api(`/mosques/${mosqueId}/programmes/${programme.id}`, {
					method: "PATCH",
					token,
					json: body,
				})
			: await api(`/mosques/${mosqueId}/programmes`, { method: "POST", token, json: body });
		if (!saved.ok) {
			setBusy(false);
			return setError(saved);
		}
		const path = `/mosques/${mosqueId}/programmes/${saved.data.id}/photo`;
		let photoResult = { ok: true };
		if (photo.blob) {
			photoResult = await api(path, { method: "PUT", token, body: photo.blob, type: "image/jpeg" });
		} else if (photo.remove && programme?.photo) {
			photoResult = await api(path, { method: "DELETE", token });
		}
		setBusy(false);
		onSaved();
		if (!photoResult.ok) {
			// The programme is saved; keep the sheet open on it to retry the photo.
			return setError({
				...photoResult,
				message: `Program disimpan, tetapi gambar gagal: ${photoResult.message}`,
			});
		}
		onClose();
	};

	const remove = async () => {
		if (!window.confirm("Padam program ini?")) return;
		setBusy(true);
		const r = await api(`/mosques/${mosqueId}/programmes/${programme.id}`, {
			method: "DELETE",
			token,
		});
		setBusy(false);
		if (!r.ok) return setError(r);
		onSaved();
		onClose();
	};

	const fieldError = (name) =>
		error?.field === name ? (
			<p className={ERROR} role="alert">
				{error.message}
			</p>
		) : null;

	return (
		<dialog
			ref={dialog}
			onClose={onClose}
			aria-labelledby="sheet-title"
			className="mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-2xl bg-sheet p-0 text-ink backdrop:bg-black/60 md:m-auto md:max-w-xl md:rounded-2xl"
		>
			<form
				onSubmit={save}
				className="grid gap-6 px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] md:p-6"
			>
				<div className="flex items-center justify-between gap-4">
					<h2 id="sheet-title" className="text-xl font-semibold">
						{programme ? "Sunting program" : "Program baharu"}
					</h2>
					<button type="button" onClick={onClose} className={BTN_SOFT}>
						Tutup
					</button>
				</div>

				<div>
					<label htmlFor="p-title" className={LABEL}>
						Tajuk
					</label>
					<input
						id="p-title"
						required
						maxLength={80}
						value={form.title}
						onChange={set("title")}
						placeholder="Contoh: Kuliah Maghrib, Tafsir Al-Quran"
						className={FIELD}
					/>
					{fieldError("title")}
				</div>

				<div>
					<label htmlFor="p-speaker" className={LABEL}>
						Penceramah <span className="font-normal text-faint">(pilihan)</span>
					</label>
					<input
						id="p-speaker"
						maxLength={60}
						value={form.speaker}
						onChange={set("speaker")}
						placeholder="Contoh: Ustaz Ahmad"
						className={FIELD}
					/>
					{fieldError("speaker")}
				</div>

				<fieldset className="m-0 border-0 p-0">
					<legend className={LABEL}>
						Gambar penceramah <span className="font-normal text-faint">(pilihan)</span>
					</legend>
					<div className="mt-2 flex items-center gap-4">
						{shownPhoto ? (
							<img src={shownPhoto} alt="" className="h-20 w-20 rounded-xl object-cover" />
						) : (
							<span aria-hidden="true" className="h-20 w-20 rounded-xl bg-raised" />
						)}
						<div className="flex flex-wrap gap-2">
							<label className={`${BTN_SOFT} cursor-pointer`}>
								{shownPhoto ? "Tukar" : "Tambah gambar"}
								<input type="file" accept="image/*" onChange={pickPhoto} className="sr-only" />
							</label>
							{shownPhoto && (
								<button
									type="button"
									onClick={() => setPhoto({ blob: null, url: null, remove: true })}
									className={BTN_SOFT}
								>
									Buang
								</button>
							)}
						</div>
					</div>
					<p className="mt-2 text-[15px] text-faint">
						Pastikan anda mendapat izin penceramah untuk memaparkan gambar beliau.
					</p>
					{fieldError("photo")}
				</fieldset>

				<fieldset className="m-0 border-0 p-0">
					<legend className={LABEL}>Bila</legend>
					<div className="mt-2 grid grid-cols-2 gap-2">
						{[
							["weekly", "Setiap minggu"],
							["once", "Sekali sahaja"],
						].map(([value, label]) => (
							<label
								key={value}
								className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-3 text-[17px] ${
									form.repeat === value ? "bg-ink font-semibold text-ground" : "bg-raised text-ink"
								}`}
							>
								<input
									type="radio"
									name="repeat"
									value={value}
									checked={form.repeat === value}
									onChange={set("repeat")}
									className="sr-only"
								/>
								{label}
							</label>
						))}
					</div>
					{form.repeat === "weekly" ? (
						<div className="mt-4 grid gap-4">
							<div>
								<label htmlFor="p-day" className={LABEL}>
									Hari
								</label>
								<select id="p-day" value={form.weekday} onChange={set("weekday")} className={FIELD}>
									{DAYS.map((d, i) => (
										<option key={d} value={i}>
											{d}
										</option>
									))}
								</select>
							</div>
							<details
								className="rounded-xl bg-surface px-4 py-3"
								open={Boolean(form.from || form.until)}
							>
								<summary className="cursor-pointer text-[17px]">Tempoh (pilihan)</summary>
								<div className="mt-3 grid grid-cols-2 gap-3">
									<div>
										<label htmlFor="p-from" className={LABEL}>
											Mula
										</label>
										<input
											id="p-from"
											type="date"
											value={form.from}
											onChange={set("from")}
											className={FIELD}
										/>
									</div>
									<div>
										<label htmlFor="p-until" className={LABEL}>
											Hingga
										</label>
										<input
											id="p-until"
											type="date"
											value={form.until}
											onChange={set("until")}
											className={FIELD}
										/>
									</div>
								</div>
								{fieldError("from")}
								{fieldError("until")}
							</details>
						</div>
					) : (
						<div className="mt-4">
							<label htmlFor="p-date" className={LABEL}>
								Tarikh
							</label>
							<input
								id="p-date"
								type="date"
								required
								value={form.date}
								onChange={set("date")}
								className={FIELD}
							/>
							{fieldError("date")}
						</div>
					)}
					{fieldError("weekday")}
				</fieldset>

				<fieldset className="m-0 border-0 p-0">
					<legend className={LABEL}>Masa</legend>
					<div className="mt-2 grid grid-cols-2 gap-2">
						{[
							["after", "Selepas solat"],
							["time", "Pada jam"],
						].map(([value, label]) => (
							<label
								key={value}
								className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl px-3 text-[17px] ${
									form.atKind === value ? "bg-ink font-semibold text-ground" : "bg-raised text-ink"
								}`}
							>
								<input
									type="radio"
									name="atKind"
									value={value}
									checked={form.atKind === value}
									onChange={set("atKind")}
									className="sr-only"
								/>
								{label}
							</label>
						))}
					</div>
					<div className="mt-4">
						{form.atKind === "after" ? (
							<>
								<label htmlFor="p-after" className="sr-only">
									Selepas solat
								</label>
								<select id="p-after" value={form.after} onChange={set("after")} className={FIELD}>
									{Object.entries(PRAYER_NAMES).map(([key, name]) => (
										<option key={key} value={key}>
											Selepas {name}
										</option>
									))}
								</select>
							</>
						) : (
							<>
								<label htmlFor="p-time" className="sr-only">
									Jam
								</label>
								<input
									id="p-time"
									type="time"
									required
									value={form.time}
									onChange={set("time")}
									className={FIELD}
								/>
							</>
						)}
					</div>
					{fieldError("at")}
				</fieldset>

				<div>
					<label htmlFor="p-note" className={LABEL}>
						Catatan <span className="font-normal text-faint">(pilihan)</span>
					</label>
					<input
						id="p-note"
						maxLength={80}
						value={form.note}
						onChange={set("note")}
						placeholder="Contoh: Dewan solat utama"
						className={FIELD}
					/>
					{fieldError("note")}
				</div>

				{error &&
					!["title", "speaker", "note", "date", "weekday", "at", "from", "until", "photo"].includes(
						error.field,
					) && (
						<p className={ERROR} role="alert">
							{error.message}
						</p>
					)}

				<div className="flex flex-wrap items-center gap-3">
					<button type="submit" disabled={busy} className={BTN}>
						{busy ? "Menyimpan…" : "Simpan"}
					</button>
					{programme && (
						<button
							type="button"
							onClick={remove}
							disabled={busy}
							className={`${BTN_DANGER} ml-auto`}
						>
							Padam program
						</button>
					)}
				</div>
			</form>
		</dialog>
	);
}
