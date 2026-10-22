// zones.js — JAKIM e-Solat zone registry: code -> negeri + display name.
// Kept free of data imports so scripts (data/getter.js) can use it cheaply.
// KTN03 is omitted: JAKIM has published no record for it since 2026-09.

export const ZONES = {
	kdh01: { negeri: "Kedah", name: "KOTA SETAR, POKOK SENA DAN KUBANG PASU" },
	kdh02: { negeri: "Kedah", name: "KUALA MUDA, PENDANG DAN YAN" },
	kdh03: { negeri: "Kedah", name: "PADANG TERAP DAN SIK" },
	kdh04: { negeri: "Kedah", name: "BALING" },
	kdh05: { negeri: "Kedah", name: "KULIM DAN BANDAR BAHARU" },
	kdh06: { negeri: "Kedah", name: "LANGKAWI" },
	kdh07: { negeri: "Kedah", name: "GUNUNG JERAI" },
	mlk01: { negeri: "Melaka", name: "SELURUH NEGERI MELAKA" },
	ngs01: { negeri: "Negeri Sembilan", name: "JEMPOL DAN TAMPIN" },
	ngs02: {
		negeri: "Negeri Sembilan",
		name: "PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU",
	},
	phg01: { negeri: "Pahang", name: "PULAU TIOMAN" },
	phg02: { negeri: "Pahang", name: "ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN" },
	phg03: { negeri: "Pahang", name: "MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT" },
	phg04: { negeri: "Pahang", name: "BENTONG, RAUB DAN LIPIS" },
	phg05: { negeri: "Pahang", name: "BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK" },
	phg06: { negeri: "Pahang", name: "CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS" },
	prk01: { negeri: "Perak", name: "TAPAH, SLIM RIVER DAN TANJUNG MALIM" },
	prk02: { negeri: "Perak", name: "IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR" },
	prk03: { negeri: "Perak", name: "PENGKALAN HULU, GERIK DAN LENGGONG" },
	prk04: { negeri: "Perak", name: "TEMENGOR DAN BELUM" },
	prk05: {
		negeri: "Perak",
		name: "TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR",
	},
	prk06: { negeri: "Perak", name: "SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR" },
	prk07: { negeri: "Perak", name: "BUKIT LARUT" },
	pls01: { negeri: "Perlis", name: "SELURUH NEGERI PERLIS" },
	png01: { negeri: "Pulau Pinang", name: "SELURUH NEGERI PULAU PINANG" },
	sgr01: {
		negeri: "Selangor",
		name: "HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG",
	},
	sgr02: { negeri: "Selangor", name: "SABAK BERNAM DAN KUALA SELANGOR" },
	sgr03: { negeri: "Selangor", name: "KLANG DAN KUALA LANGAT" },
	trg01: { negeri: "Terengganu", name: "KUALA TERENGGANU, MARANG DAN KUALA NERUS" },
	trg02: { negeri: "Terengganu", name: "BESUT DAN SETIU" },
	trg03: { negeri: "Terengganu", name: "HULU TERENGGANU" },
	trg04: { negeri: "Terengganu", name: "DUNGUN DAN KEMAMAN" },
	jhr01: { negeri: "Johor", name: "PULAU AUR DAN PULAU PEMANGGIL" },
	jhr02: { negeri: "Johor", name: "KOTA TINGGI, MERSING DAN JOHOR BAHRU" },
	jhr03: { negeri: "Johor", name: "KLUANG DAN PONTIAN" },
	jhr04: { negeri: "Johor", name: "BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR" },
	ktn01: {
		negeri: "Kelantan",
		name: "JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)",
	},
	sbh01: {
		negeri: "Sabah",
		name: "BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN",
	},
	sbh02: {
		negeri: "Sabah",
		name: "BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID",
	},
	sbh03: {
		negeri: "Sabah",
		name: "BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA",
	},
	sbh04: {
		negeri: "Sabah",
		name: "BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN",
	},
	sbh05: { negeri: "Sabah", name: "BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI" },
	sbh06: { negeri: "Sabah", name: "GUNUNG KINABALU" },
	sbh07: {
		negeri: "Sabah",
		name: "BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU",
	},
	sbh08: {
		negeri: "Sabah",
		name: "BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN",
	},
	sbh09: {
		negeri: "Sabah",
		name: "BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA",
	},
	swk01: { negeri: "Sarawak", name: "LIMBANG, SUNDAR, TRUSAN DAN LAWAS" },
	swk02: { negeri: "Sarawak", name: "NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI" },
	swk03: { negeri: "Sarawak", name: "TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU" },
	swk04: {
		negeri: "Sarawak",
		name: "IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG",
	},
	swk05: { negeri: "Sarawak", name: "BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG" },
	swk06: {
		negeri: "Sarawak",
		name: "KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU",
	},
	swk07: { negeri: "Sarawak", name: "SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM" },
	swk08: { negeri: "Sarawak", name: "KUCHING, BAU, LUNDU DAN SEMATAN" },
	swk09: { negeri: "Sarawak", name: "KAMPUNG PATARIKAN" },
	wly01: { negeri: "Wilayah Persekutuan Kuala Lumpur", name: "KUALA LUMPUR DAN PUTRAJAYA" },
	wly02: { negeri: "Wilayah Persekutuan Labuan", name: "LABUAN" },
};

export const ZONE_IDS = Object.keys(ZONES);
