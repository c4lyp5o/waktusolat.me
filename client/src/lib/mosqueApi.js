// mosqueApi.js — the registry and programmes API (SPEC-mosque-registry.md,
// SPEC-programmes.md), with every failure turned into a Malay sentence.
// The edit token goes only in the Authorization header.
const MESSAGES = {
	name: "Nama perlu 1 hingga 60 aksara, satu baris.",
	zone: "Pilih zon waktu solat.",
	iqamah: "Minit iqamah perlu 0 hingga 60.",
	jumaat: "Minit Jumaat perlu 0 hingga 90.",
	solat: "Minit paparan solat perlu 1 hingga 60.",
	title: "Tajuk perlu 1 hingga 80 aksara, satu baris.",
	speaker: "Nama penceramah paling panjang 60 aksara.",
	note: "Catatan paling panjang 80 aksara.",
	date: "Pilih tarikh yang betul.",
	weekday: "Pilih hari.",
	at: "Pilih masa: jam, atau selepas solat.",
	from: "Tarikh mula tidak betul.",
	until: "Tarikh tamat mesti selepas tarikh mula.",
	skip: "Tarikh cuti tidak betul.",
	photo: "Gambar tidak dapat diterima. Cuba gambar lain.",
};
const BY_STATUS = {
	401: "Pautan edit ini tidak sah lagi.",
	404: "Tidak dijumpai. Mungkin sudah dipadam.",
	429: "Terlalu banyak cubaan. Cuba lagi sebentar.",
	507: "Storan gambar penuh. Sila maklumkan kepada pemilik laman.",
};

// -> { ok, status, data, message, field }
export async function api(path, { method = "GET", token, json, body, type } = {}) {
	const headers = {};
	if (token) headers.authorization = `Bearer ${token}`;
	if (json !== undefined) headers["content-type"] = "application/json";
	if (type) headers["content-type"] = type;
	let res;
	try {
		res = await fetch(`/api/v1${path}`, {
			method,
			headers,
			body: json !== undefined ? JSON.stringify(json) : body,
			referrerPolicy: "no-referrer",
		});
	} catch {
		return { ok: false, status: 0, message: "Tiada sambungan internet. Cuba lagi." };
	}
	const data = res.status === 204 ? null : await res.json().catch(() => null);
	if (res.ok) return { ok: true, status: res.status, data };
	const field = data?.field ?? null;
	const message =
		(res.status === 400 &&
			(MESSAGES[field] ??
				(data?.message?.includes("50") ? "Had 50 program bagi setiap masjid." : null))) ||
		BY_STATUS[res.status] ||
		"Ada masalah di pelayan. Cuba lagi sebentar.";
	return { ok: false, status: res.status, data, field, message };
}

// The mosque's TV link (tv-mosque-mode): short enough to type on a remote.
export const tvPath = (m) => `/m/${m.id}`;
