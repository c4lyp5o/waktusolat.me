// zoneSearch.js — typing-first zone search for the landing page.
//
// Every word of the query must start a word of the zone's code, state or
// area names ("gomb" -> SGR01, "kuala lumpur" -> WLY01). A few short forms
// people actually type are expanded first. Takes the zone table as data
// (controllers/zones.js via the @zones alias) so it is testable as is.

const SHORT_FORMS = {
	kl: "kuala lumpur",
	jb: "johor bahru",
	kk: "kota kinabalu",
	kb: "kota bharu",
	pj: "petaling",
	n9: "negeri sembilan",
};

const normalize = (s) =>
	String(s ?? "")
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.replace(/[^a-z0-9]+/g, " ")
		.trim();

// ZONES ({ code: { negeri, name } }) -> searchable entries, in table order.
export function buildZoneIndex(zones) {
	return Object.entries(zones).map(([code, { negeri, name }]) => ({
		code,
		negeri,
		name,
		words: normalize(`${code} ${negeri} ${name}`).split(" "),
	}));
}

export function searchZones(index, query) {
	const q = normalize(query);
	if (!q) return [];
	const terms = q.split(" ").flatMap((t) => (SHORT_FORMS[t] ? SHORT_FORMS[t].split(" ") : [t]));
	return index
		.filter((z) => terms.every((t) => z.words.some((w) => w.startsWith(t))))
		.map(({ code, negeri, name }) => ({ code, negeri, name }));
}
