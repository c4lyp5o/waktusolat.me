// contrast.mjs — every text token against every ground it is set on, for
// each theme block in the site and TV stylesheets (SPEC-redesign.md, Checks).
//
//   node scripts/contrast.mjs        exits 1 when any pair is under 4.5:1
//
// A block is a CSS rule whose selector is in BLOCKS; its custom properties
// are read as written (hex, or rgb() with an alpha, composited over the
// block's own ground). Tokens a block leaves out come from its base.
import { readFileSync } from "node:fs";

const MIN = 4.5;
const css = (f) => readFileSync(new URL(`../client/src/${f}`, import.meta.url), "utf8");

// [label, file, selector, base label or null, grounds, texts]
const SITE_TEXT = ["ink", "muted", "faint", "spent", "accent", "danger"];
const SKY_TEXT = ["ink", "muted", "faint", "spent", "accent"];
const TV_TEXT = ["text", "muted", "faint", "spent", "accent"];
const tv = (label, selector, file = "tv/themes/langit.css") => [
	label,
	file,
	selector,
	null,
	["ground", "surface"],
	TV_TEXT,
];
const BLOCKS = [
	[
		"light",
		"web/themes/langit.css",
		'html[data-tema="langit"],\nhtml[data-tema="langit"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"dark",
		"web/themes/langit.css",
		'html[data-tema="langit"][data-theme="dark"],\nhtml[data-tema="langit"][data-theme="dark"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	...["malam", "subuh", "pagi", "zohor", "asar", "senja"].map((s) => [
		`sky ${s}`,
		"main.css",
		`.sky[data-sky="${s}"]`,
		null,
		["sky", "surface"],
		SKY_TEXT,
	]),
	[
		"takwim",
		"web/themes/takwim.css",
		'html[data-tema="takwim"],\nhtml[data-tema="takwim"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"papan",
		"web/themes/papan.css",
		'html[data-tema="papan"],\nhtml[data-tema="papan"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"kad",
		"web/themes/kad.css",
		'html[data-tema="kad"],\nhtml[data-tema="kad"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"mihrab",
		"web/themes/mihrab.css",
		'html[data-tema="mihrab"],\nhtml[data-tema="mihrab"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"editorial",
		"web/themes/editorial.css",
		'html[data-tema="editorial"],\nhtml[data-tema="editorial"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"poster",
		"web/themes/poster.css",
		'html[data-tema="poster"],\nhtml[data-tema="poster"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"siang",
		"web/themes/siang.css",
		'html[data-tema="siang"],\nhtml[data-tema="siang"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"kaca",
		"web/themes/kaca.css",
		'html[data-tema="kaca"],\nhtml[data-tema="kaca"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"dail",
		"web/themes/dail.css",
		'html[data-tema="dail"],\nhtml[data-tema="dail"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"jalur",
		"web/themes/jalur.css",
		'html[data-tema="jalur"],\nhtml[data-tema="jalur"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	[
		"malam",
		"web/themes/malam.css",
		'html[data-tema="malam"],\nhtml[data-tema="malam"] .sheet',
		null,
		["ground", "surface", "sheet"],
		SITE_TEXT,
	],
	tv("tv langit", '.tv[data-tema="langit"],\n.tv[data-tema="langit"][data-sky="malam"]'),
	...["subuh", "pagi", "zohor", "asar", "senja"].map((k) =>
		tv(`tv langit ${k}`, `.tv[data-tema="langit"][data-sky="${k}"]`),
	),
	tv("tv takwim", '.tv[data-tema="takwim"]', "tv/themes/takwim.css"),
	tv("tv papan", '.tv[data-tema="papan"]', "tv/themes/papan.css"),
	tv("tv malam", '.tv[data-tema="malam"]', "tv/themes/malam.css"),
	tv("tv jalur", '.tv[data-tema="jalur"]', "tv/themes/jalur.css"),
	tv("tv dail", '.tv[data-tema="dail"]', "tv/themes/dail.css"),
	tv("tv kaca", '.tv[data-tema="kaca"]', "tv/themes/kaca.css"),
	tv("tv program", '.tv[data-tema="program"]', "tv/themes/program.css"),
	tv("tv sorotan", '.tv[data-tema="sorotan"]', "tv/themes/sorotan.css"),
	tv("tv senyap", '.tv[data-tema="senyap"]', "tv/themes/senyap.css"),
];

function block(src, selector) {
	const at = src.indexOf(`${selector} {`);
	if (at < 0) throw new Error(`selector not found: ${selector}`);
	const body = src.slice(at, src.indexOf("}", at));
	const vars = {};
	for (const m of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
	return vars;
}

function parse(value) {
	const hex = value.match(/^#([0-9a-f]{6})$/i);
	if (hex) {
		const n = Number.parseInt(hex[1], 16);
		return { rgb: [n >> 16, (n >> 8) & 255, n & 255], a: 1 };
	}
	const rgb = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)(?:\s*\/\s*([\d.]+))?\s*\)$/);
	if (rgb) return { rgb: [+rgb[1], +rgb[2], +rgb[3]], a: rgb[4] === undefined ? 1 : +rgb[4] };
	return null;
}

const over = (top, under) => top.rgb.map((c, i) => c * top.a + under[i] * (1 - top.a));

function luminance(rgb) {
	const [r, g, b] = rgb.map((c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const ratio = (a, b) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

const read = {};
let failures = 0;
let checked = 0;
for (const [label, file, selector, base, grounds, texts] of BLOCKS) {
	const vars = { ...(base ? read[base] : {}), ...block(css(file), selector) };
	read[label] = vars;
	const first = parse(vars[grounds[0]]);
	for (const g of grounds) {
		const ground = parse(vars[g] ?? "");
		if (!ground) continue;
		const bg = ground.a < 1 ? over(ground, first.rgb) : ground.rgb;
		for (const t of texts) {
			const ink = parse(vars[t] ?? "");
			if (!ink) continue;
			const r = ratio(over(ink, bg), bg);
			checked++;
			if (r < MIN) {
				failures++;
				console.log(`FAIL ${label}: --${t} on --${g} ${r.toFixed(2)}:1`);
			}
		}
	}
}
console.log(`${checked} pairs, ${failures} under ${MIN}:1`);
process.exit(failures ? 1 : 0);
