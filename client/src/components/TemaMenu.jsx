// TemaMenu.jsx — the visitor's tema, as a small sheet of cards (S2 plumbing,
// S5b UI). The cards come from the registry, so a tema appears here the day it
// gains a site palette; picking one repaints the page in place (no reload) and
// is remembered.
import { useEffect, useRef, useState } from "react";
import { TEMAS } from "../../../shared/temas.js";
import { currentTema, saveTema, TEMA_EVENT } from "../lib/tema.js";

function Swatch({ tema }) {
	const { ground, ink, accent } = tema.swatch;
	return (
		<span
			className="flex h-14 w-full flex-col justify-between overflow-hidden rounded-lg p-2"
			style={{ background: ground }}
			aria-hidden="true"
		>
			<span className="flex items-center justify-between">
				<span className="h-1.5 w-8 rounded-full" style={{ background: accent }} />
				<span className="h-1.5 w-5 rounded-full" style={{ background: ink, opacity: 0.7 }} />
			</span>
			<span className="flex items-end gap-1">
				<span className="h-4 w-10 rounded-sm" style={{ background: ink, opacity: 0.85 }} />
				<span className="h-2 w-3 rounded-sm" style={{ background: accent }} />
			</span>
		</span>
	);
}

export default function TemaMenu() {
	const ref = useRef(null);
	const [picked, setPicked] = useState(currentTema);

	useEffect(() => {
		const on = (e) => setPicked(e.detail?.id ?? currentTema());
		window.addEventListener(TEMA_EVENT, on);
		return () => window.removeEventListener(TEMA_EVENT, on);
	}, []);

	const options = TEMAS.filter((t) => t.web);

	const choose = (id) => {
		if (saveTema(id)) setPicked(id);
		ref.current?.close();
	};

	return (
		<>
			<button
				type="button"
				onClick={() => ref.current?.showModal()}
				className="shrink-0 rounded-full bg-raised px-3 py-1.5 text-sm font-semibold text-ink hover:bg-line md:px-4 md:py-2 md:text-[15px]"
			>
				Tema
			</button>
			{/* Native dialog: focus trapping, Esc and the backdrop come free. */}
			<dialog
				ref={ref}
				aria-labelledby="tema-title"
				className="m-auto w-[min(92vw,42rem)] rounded-3xl bg-sheet p-0 text-ink backdrop:bg-black/50"
			>
				<form method="dialog" className="p-4 md:p-6">
					<div className="flex items-start justify-between gap-4">
						<div>
							<h2 id="tema-title" className="text-xl font-semibold">
								Tema laman
							</h2>
							<p className="mt-1 text-[15px] text-muted">
								Pilih rupa laman. TV masjid pula ikut tema yang dipilih di editor masjid.
							</p>
						</div>
						<button
							type="submit"
							aria-label="Tutup"
							className="rounded-full bg-raised px-3 py-1.5 text-sm font-semibold text-ink"
						>
							Tutup
						</button>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
						{options.map((tema) => {
							const on = picked === tema.id;
							return (
								<button
									key={tema.id}
									type="button"
									onClick={() => choose(tema.id)}
									aria-pressed={on}
									className={`rounded-2xl bg-surface p-2 text-left ring-line transition-shadow ${
										on ? "ring-2 ring-ink" : "hover:ring-2"
									}`}
								>
									<Swatch tema={tema} />
									<span className="mt-2 block px-1 text-[15px] font-semibold">{tema.name}</span>
									<span className="block px-1 pb-1 text-[14px] text-muted">{tema.note}</span>
								</button>
							);
						})}
					</div>
				</form>
			</dialog>
		</>
	);
}
