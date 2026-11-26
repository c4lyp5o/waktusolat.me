// shared/temas.js — the one list of temas, imported by the client and the
// server so a value can never be valid on one side and invalid on the other.
//
// A tema owns a palette and names one layout per surface (web, TV landscape,
// TV portrait). Layouts are a shared pool in client/src/tv/layouts; a tema
// only points at one, so a new tema is a token file and three names.

export const TEMAS = Object.freeze([
	{
		id: "langit",
		name: "Langit",
		note: "Langit sebenar di atas zon",
		mode: "auto",
		web: true,
		webLayout: "sky",
		swatch: { ground: "#faf6f0", ink: "#1d130b", accent: "#8a4f00" },
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "takwim",
		name: "Takwim",
		note: "Gelap, satu merah, seperti takwim",
		mode: "fixed",
		web: true,
		webLayout: "almanak",
		swatch: { ground: "#121212", ink: "#f3efe6", accent: "#ff5a52" },
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "malam",
		name: "Malam",
		note: "Gelap, ambar, satu senarai tenang",
		mode: "fixed",
		web: true,
		webLayout: "almanak",
		swatch: { ground: "#08090b", ink: "#ecebe7", accent: "#e0ab5f" },
		tv: { layout: "malam" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "jalur",
		name: "Jalur",
		note: "Jalur hari ini: subuh ke isyak, satu pita",
		mode: "fixed",
		web: true,
		webLayout: "almanak",
		swatch: { ground: "#0e1211", ink: "#f1efe9", accent: "#d9a35e" },
		tv: { layout: "jalur" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "dail",
		name: "Dail",
		note: "Bulatan hari ini, cetak hitam di atas kertas",
		mode: "fixed",
		web: true,
		webLayout: "almanak",
		swatch: { ground: "#f6f6f3", ink: "#0f1210", accent: "#2438c8" },
		tv: { layout: "dail" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "kaca",
		name: "Kaca",
		note: "Foto di sebalik kaca, emas di atasnya",
		mode: "fixed",
		web: true,
		webLayout: "almanak",
		swatch: { ground: "#050a08", ink: "#f6f3ec", accent: "#e6c78f" },
		tv: { layout: "kaca" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "program",
		name: "Program",
		note: "Jadual solat dan program minggu ini, sebelah-menyebelah",
		mode: "fixed",
		web: false,
		swatch: { ground: "#0a1420", ink: "#eef2f6", accent: "#d9b26b" },
		tv: { layout: "program" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "sorotan",
		name: "Sorotan",
		note: "Satu lampu di atas kiraan, waktu solat di lantai",
		mode: "fixed",
		web: false,
		swatch: { ground: "#060606", ink: "#f3efe6", accent: "#e8b366" },
		tv: { layout: "sorotan" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "senyap",
		name: "Senyap",
		note: "Tiada kotak, tiada cahaya — hanya angka",
		mode: "fixed",
		web: false,
		swatch: { ground: "#0a0a0b", ink: "#e9e7e2", accent: "#d8a964" },
		tv: { layout: "senyap" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "siang",
		name: "Siang",
		note: "Kertas cerah, satu teal, hari dalam perkataan",
		mode: "fixed",
		web: true,
		webLayout: "siang",
		swatch: { ground: "#fbfaf6", ink: "#12211c", accent: "#0f6b5c" },
		// No TV draft: it keeps the ellipse board in day colours.
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "poster",
		name: "Poster",
		note: "Kertas kraft, dua dakwat: hitam dan satu merah",
		mode: "fixed",
		web: true,
		webLayout: "poster",
		swatch: { ground: "#ece5d6", ink: "#141310", accent: "#ad3320" },
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "editorial",
		name: "Editorial",
		note: "Hamparan majalah: satu halaman cerah, satu halaman gelap",
		mode: "fixed",
		web: true,
		webLayout: "editorial",
		swatch: { ground: "#f1ebdf", ink: "#171512", accent: "#a8321f" },
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "mihrab",
		name: "Mihrab",
		note: "Hijau tua, satu gerbang emas di tengah",
		mode: "fixed",
		web: true,
		webLayout: "mihrab",
		swatch: { ground: "#06201a", ink: "#f2e9d7", accent: "#cfa963" },
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "kad",
		name: "Kad",
		note: "Satu kad hijau untuk yang seterusnya, kad putih untuk hari itu",
		mode: "fixed",
		web: true,
		webLayout: "kad",
		swatch: { ground: "#eef0ed", ink: "#13201b", accent: "#1f6f57" },
		tv: { layout: "ellipse" },
		tvPortrait: { layout: "potret" },
	},
	{
		id: "papan",
		name: "Papan",
		note: "Hijau dan emas, seperti papan masjid",
		mode: "fixed",
		web: true,
		webLayout: "almanak",
		swatch: { ground: "#081713", ink: "#f5efdf", accent: "#d9ae63" },
		tv: { layout: "papan" },
		tvPortrait: { layout: "potret" },
	},
]);

export const TEMA_IDS = Object.freeze(TEMAS.map((t) => t.id));
// Temas that can paint the website. Langit has the sky page; Takwim and Papan
// share the almanak page (S5b).
export const WEB_TEMAS = Object.freeze(TEMAS.filter((t) => t.web).map((t) => t.id));
export const DEFAULT_TEMA = TEMA_IDS[0];

export function isTema(id) {
	return TEMA_IDS.includes(id);
}

export function isWebTema(id) {
	return WEB_TEMAS.includes(id);
}

// Which page a web tema paints. Layouts live in client/src/web/layouts; a
// tema names one, so a new printed page is a component plus a name here.
export const WEB_LAYOUTS = Object.freeze([
	"sky",
	"almanak",
	"siang",
	"poster",
	"editorial",
	"mihrab",
	"kad",
]);

export function webLayoutOf(id) {
	const t = TEMAS.find((x) => x.id === id);
	return t?.web && WEB_LAYOUTS.includes(t.webLayout) ? t.webLayout : "almanak";
}

export function temaById(id) {
	return TEMAS.find((t) => t.id === id) ?? TEMAS[0];
}
