// useTemaId.js — the active site tema as React state, kept current by the
// swap event, so any component can repaint itself without a reload.
import { useEffect, useState } from "react";
import { currentTema, TEMA_EVENT } from "./tema.js";

export function useTemaId() {
	const [tema, setTema] = useState(currentTema);
	useEffect(() => {
		const on = (e) => setTema(e.detail?.id ?? currentTema());
		window.addEventListener(TEMA_EVENT, on);
		return () => window.removeEventListener(TEMA_EVENT, on);
	}, []);
	return tema;
}
