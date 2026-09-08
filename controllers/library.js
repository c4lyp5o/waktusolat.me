// library.js — data registry for waktusolat.me.
//
// Prayer-time JSONs are loaded at runtime from data/times/<zone>.json
// (data/ is gitignored). The zone list, negeri and display names are
// preserved verbatim from the previous hand-maintained table.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const quranmy = JSON.parse(
	readFileSync(join(import.meta.dir, "../data/quran/quran_id.json"), "utf8"),
);
const quranen = JSON.parse(
	readFileSync(join(import.meta.dir, "../data/quran/quran_en.json"), "utf8"),
);
const readJson = (rel) => JSON.parse(readFileSync(join(import.meta.dir, rel), "utf8"));

const bukhari = readJson("../data/hadith/sahih-bukhari.json");
const muslim = readJson("../data/hadith/sahih-muslim.json");
const abu_daud = readJson("../data/hadith/sunan-abu-daud.json");
const nasai = readJson("../data/hadith/sunan-al-nasai.json");
const tirmizi = readJson("../data/hadith/sunan-al-tirmizi.json");
const ibnu_majah = readJson("../data/hadith/sunan-ibnu-majah.json");

const Quranen = quranen.holyQuran;
const Quranmy = quranmy.holyQuran;
const BukhariBook = bukhari;
const MuslimBook = muslim;
const AbudaudBook = abu_daud;
const NasaiBook = nasai;
const TirmiziBook = tirmizi;
const IbnumajahBook = ibnu_majah;

// Prayer-time DBs live in data/times/ (gitignored, refreshed by
// data/getter.js). Missing/error files (e.g. KTN03, which JAKIM does not
// publish) get an empty db — TimeHelpers returns an explicit empty set
// for them instead of crashing.
const readPrayerTimes = (zone) => {
	try {
		const parsed = JSON.parse(
			readFileSync(join(import.meta.dir, "../data/times/", zone + ".json"), "utf8"),
		);
		const rows = parsed.prayerTime;
		return Array.isArray(rows) ? rows : [];
	} catch {
		return [];
	}
};

const Zones = {
	kdh01: {
		get db() {
			return readPrayerTimes("kdh01");
		},
		negeri: "Kedah",
		name: "KOTA SETAR, POKOK SENA DAN KUBANG PASU",
	},
	kdh02: {
		get db() {
			return readPrayerTimes("kdh02");
		},
		negeri: "Kedah",
		name: "KUALA MUDA, PENDANG DAN YAN",
	},
	kdh03: {
		get db() {
			return readPrayerTimes("kdh03");
		},
		negeri: "Kedah",
		name: "PADANG TERAP DAN SIK",
	},
	kdh04: {
		get db() {
			return readPrayerTimes("kdh04");
		},
		negeri: "Kedah",
		name: "BALING",
	},
	kdh05: {
		get db() {
			return readPrayerTimes("kdh05");
		},
		negeri: "Kedah",
		name: "KULIM DAN BANDAR BAHARU",
	},
	kdh06: {
		get db() {
			return readPrayerTimes("kdh06");
		},
		negeri: "Kedah",
		name: "LANGKAWI",
	},
	kdh07: {
		get db() {
			return readPrayerTimes("kdh07");
		},
		negeri: "Kedah",
		name: "GUNUNG JERAI",
	},
	mlk01: {
		get db() {
			return readPrayerTimes("mlk01");
		},
		negeri: "Melaka",
		name: "SELURUH NEGERI MELAKA",
	},
	ngs01: {
		get db() {
			return readPrayerTimes("ngs01");
		},
		negeri: "Negeri Sembilan",
		name: "JEMPOL DAN TAMPIN",
	},
	ngs02: {
		get db() {
			return readPrayerTimes("ngs02");
		},
		negeri: "Negeri Sembilan",
		name: "PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU",
	},
	phg01: {
		get db() {
			return readPrayerTimes("phg01");
		},
		negeri: "Pahang",
		name: "PULAU TIOMAN",
	},
	phg02: {
		get db() {
			return readPrayerTimes("phg02");
		},
		negeri: "Pahang",
		name: "ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN",
	},
	phg03: {
		get db() {
			return readPrayerTimes("phg03");
		},
		negeri: "Pahang",
		name: "MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT",
	},
	phg04: {
		get db() {
			return readPrayerTimes("phg04");
		},
		negeri: "Pahang",
		name: "BENTONG, RAUB DAN LIPIS",
	},
	phg05: {
		get db() {
			return readPrayerTimes("phg05");
		},
		negeri: "Pahang",
		name: "BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK",
	},
	phg06: {
		get db() {
			return readPrayerTimes("phg06");
		},
		negeri: "Pahang",
		name: "CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS",
	},
	prk01: {
		get db() {
			return readPrayerTimes("prk01");
		},
		negeri: "Perak",
		name: "TAPAH, SLIM RIVER DAN TANJUNG MALIM",
	},
	prk02: {
		get db() {
			return readPrayerTimes("prk02");
		},
		negeri: "Perak",
		name: "IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR",
	},
	prk03: {
		get db() {
			return readPrayerTimes("prk03");
		},
		negeri: "Perak",
		name: "PENGKALAN HULU, GERIK DAN LENGGONG",
	},
	prk04: {
		get db() {
			return readPrayerTimes("prk04");
		},
		negeri: "Perak",
		name: "TEMENGOR DAN BELUM",
	},
	prk05: {
		get db() {
			return readPrayerTimes("prk05");
		},
		negeri: "Perak",
		name: "TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR",
	},
	prk06: {
		get db() {
			return readPrayerTimes("prk06");
		},
		negeri: "Perak",
		name: "SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR",
	},
	prk07: {
		get db() {
			return readPrayerTimes("prk07");
		},
		negeri: "Perak",
		name: "BUKIT LARUT",
	},
	pls01: {
		get db() {
			return readPrayerTimes("pls01");
		},
		negeri: "Perlis",
		name: "SELURUH NEGERI PERLIS",
	},
	png01: {
		get db() {
			return readPrayerTimes("png01");
		},
		negeri: "Pulau Pinang",
		name: "SELURUH NEGERI PULAU PINANG",
	},
	sgr01: {
		get db() {
			return readPrayerTimes("sgr01");
		},
		negeri: "Selangor",
		name: "HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG",
	},
	sgr02: {
		get db() {
			return readPrayerTimes("sgr02");
		},
		negeri: "Selangor",
		name: "SABAK BERNAM DAN KUALA SELANGOR",
	},
	sgr03: {
		get db() {
			return readPrayerTimes("sgr03");
		},
		negeri: "Selangor",
		name: "KLANG DAN KUALA LANGAT",
	},
	trg01: {
		get db() {
			return readPrayerTimes("trg01");
		},
		negeri: "Terengganu",
		name: "KUALA TERENGGANU, MARANG DAN KUALA NERUS",
	},
	trg02: {
		get db() {
			return readPrayerTimes("trg02");
		},
		negeri: "Terengganu",
		name: "BESUT DAN SETIU",
	},
	trg03: {
		get db() {
			return readPrayerTimes("trg03");
		},
		negeri: "Terengganu",
		name: "HULU TERENGGANU",
	},
	trg04: {
		get db() {
			return readPrayerTimes("trg04");
		},
		negeri: "Terengganu",
		name: "DUNGUN DAN KEMAMAN",
	},
	jhr01: {
		get db() {
			return readPrayerTimes("jhr01");
		},
		negeri: "Johor",
		name: "PULAU AUR DAN PULAU PEMANGGIL",
	},
	jhr02: {
		get db() {
			return readPrayerTimes("jhr02");
		},
		negeri: "Johor",
		name: "KOTA TINGGI, MERSING DAN JOHOR BAHRU",
	},
	jhr03: {
		get db() {
			return readPrayerTimes("jhr03");
		},
		negeri: "Johor",
		name: "KLUANG DAN PONTIAN",
	},
	jhr04: {
		get db() {
			return readPrayerTimes("jhr04");
		},
		negeri: "Johor",
		name: "BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR",
	},
	ktn01: {
		get db() {
			return readPrayerTimes("ktn01");
		},
		negeri: "Kelantan",
		name: "JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)",
	},
	sbh01: {
		get db() {
			return readPrayerTimes("sbh01");
		},
		negeri: "Sabah",
		name: "BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN",
	},
	sbh02: {
		get db() {
			return readPrayerTimes("sbh02");
		},
		negeri: "Sabah",
		name: "BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID",
	},
	sbh03: {
		get db() {
			return readPrayerTimes("sbh03");
		},
		negeri: "Sabah",
		name: "BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA",
	},
	sbh04: {
		get db() {
			return readPrayerTimes("sbh04");
		},
		negeri: "Sabah",
		name: "BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN",
	},
	sbh05: {
		get db() {
			return readPrayerTimes("sbh05");
		},
		negeri: "Sabah",
		name: "BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI",
	},
	sbh06: {
		get db() {
			return readPrayerTimes("sbh06");
		},
		negeri: "Sabah",
		name: "GUNUNG KINABALU",
	},
	sbh07: {
		get db() {
			return readPrayerTimes("sbh07");
		},
		negeri: "Sabah",
		name: "BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU",
	},
	sbh08: {
		get db() {
			return readPrayerTimes("sbh08");
		},
		negeri: "Sabah",
		name: "BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN",
	},
	sbh09: {
		get db() {
			return readPrayerTimes("sbh09");
		},
		negeri: "Sabah",
		name: "BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA",
	},
	swk01: {
		get db() {
			return readPrayerTimes("swk01");
		},
		negeri: "Sarawak",
		name: "LIMBANG, SUNDAR, TRUSAN DAN LAWAS",
	},
	swk02: {
		get db() {
			return readPrayerTimes("swk02");
		},
		negeri: "Sarawak",
		name: "NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI",
	},
	swk03: {
		get db() {
			return readPrayerTimes("swk03");
		},
		negeri: "Sarawak",
		name: "TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU",
	},
	swk04: {
		get db() {
			return readPrayerTimes("swk04");
		},
		negeri: "Sarawak",
		name: "IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG",
	},
	swk05: {
		get db() {
			return readPrayerTimes("swk05");
		},
		negeri: "Sarawak",
		name: "BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG",
	},
	swk06: {
		get db() {
			return readPrayerTimes("swk06");
		},
		negeri: "Sarawak",
		name: "KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU",
	},
	swk07: {
		get db() {
			return readPrayerTimes("swk07");
		},
		negeri: "Sarawak",
		name: "SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM",
	},
	swk08: {
		get db() {
			return readPrayerTimes("swk08");
		},
		negeri: "Sarawak",
		name: "KUCHING, BAU, LUNDU DAN SEMATAN",
	},
	swk09: {
		get db() {
			return readPrayerTimes("swk09");
		},
		negeri: "Sarawak",
		name: "KAMPUNG PATARIKAN",
	},
	wly01: {
		get db() {
			return readPrayerTimes("wly01");
		},
		negeri: "Wilayah Persekutuan Kuala Lumpur",
		name: "KUALA LUMPUR DAN PUTRAJAYA",
	},
	wly02: {
		get db() {
			return readPrayerTimes("wly02");
		},
		negeri: "Wilayah Persekutuan Labuan",
		name: "LABUAN",
	},
};

const Months = [
	[
		{ id: 1, name: "January", count: 31 },
		{ id: 2, name: "February", count: 28, leapYear: "29" },
		{ id: 3, name: "March", count: 31 },
		{ id: 4, name: "April", count: 30 },
		{ id: 5, name: "May", count: 31 },
		{ id: 6, name: "June", count: 30 },
		{ id: 7, name: "July", count: 31 },
		{ id: 8, name: "August", count: 31 },
		{ id: 9, name: "September", count: 30 },
		{ id: 10, name: "October", count: 31 },
		{ id: 11, name: "November", count: 30 },
		{ id: 12, name: "December", count: 31 },
	],
];

export {
	AbudaudBook,
	BukhariBook,
	IbnumajahBook,
	Months,
	MuslimBook,
	NasaiBook,
	Quranen,
	Quranmy,
	TirmiziBook,
	Zones,
};
