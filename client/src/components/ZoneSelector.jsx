import { useNavigate } from "react-router";
import { useState, useMemo } from "react";

// Move the data outside the component to prevent re-creation on every render
// In the future, you should move this to a separate file like `src/data/zones.js`
const ALL_ZONES = [
	{
		parent: "Kedah",
		children: [
			{ name: "KOTA SETAR, POKOK SENA DAN KUBANG PASU", value: "kdh01" },
			{ name: "KUALA MUDA, PENDANG DAN YAN", value: "kdh02" },
			{ name: "PADANG TERAP DAN SIK", value: "kdh03" },
			{ name: "BALING", value: "kdh04" },
			{ name: "KULIM DAN BANDAR BAHARU", value: "kdh05" },
			{ name: "LANGKAWI", value: "kdh06" },
			{ name: "GUNUNG JERAI", value: "kdh07" },
		],
	},
	{
		parent: "Kelantan",
		children: [
			{
				name: "JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT, PASIR MAS, TANAH MERAH, MACHANG, KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)",
				value: "ktn01",
			},
			{
				name: "JAJAHAN JELI, GUA MUSANG (DAERAH GALAS DAN BERTAM) DAN JAJAHAN KECIL LOJING",
				value: "ktn03",
			},
		],
	},
	{
		parent: "Johor",
		children: [
			{ name: "PULAU AUR DAN PULAU PEMANGGIL", value: "jhr01" },
			{ name: "KOTA TINGGI, MERSING DAN JOHOR BAHRU", value: "jhr02" },
			{ name: "KLUANG DAN PONTIAN", value: "jhr03" },
			{ name: "BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR", value: "jhr04" },
		],
	},
	{
		parent: "Melaka",
		children: [{ name: "Seluruh Negeri Melaka", value: "mlk01" }],
	},
	{
		parent: "Negeri Sembilan",
		children: [
			{ name: "JEMPOL DAN TAMPIN", value: "ngs01" },
			{
				name: "PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU",
				value: "ngs02",
			},
		],
	},
	{
		parent: "Pahang",
		children: [
			{ name: "PULAU TIOMAN", value: "phg01" },
			{ name: "ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN", value: "phg02" },
			{
				name: "MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT",
				value: "phg03",
			},
			{ name: "BENTONG, RAUB DAN LIPIS", value: "phg04" },
			{
				name: "BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK",
				value: "phg05",
			},
			{
				name: "CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS",
				value: "phg06",
			},
		],
	},
	{
		parent: "Perak",
		children: [
			{ name: "TAPAH, SLIM RIVER DAN TANJUNG MALIM", value: "prk01" },
			{
				name: "IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR",
				value: "prk02",
			},
			{ name: "PENGKALAN HULU, GERIK DAN LENGGONG", value: "prk03" },
			{ name: "TEMENGOR DAN BELUM", value: "prk04" },
			{
				name: "TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR",
				value: "prk05",
			},
			{
				name: "SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR",
				value: "prk06",
			},
			{ name: "BUKIT LARUT", value: "prk07" },
		],
	},
	{
		parent: "Perlis",
		children: [{ name: "Seluruh negeri Perlis", value: "pls01" }],
	},
	{
		parent: "Pulau Pinang",
		children: [{ name: "Seluruh negeri Pulau Pinang", value: "png01" }],
	},
	{
		parent: "Sabah",
		children: [
			{
				name: "BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN",
				value: "sbh01",
			},
			{
				name: "BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID",
				value: "sbh02",
			},
			{
				name: "BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA",
				value: "sbh03",
			},
			{
				name: "BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN",
				value: "sbh04",
			},
			{
				name: "BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI",
				value: "sbh05",
			},
			{ name: "GUNUNG KINABALU", value: "sbh06" },
			{
				name: "BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU",
				value: "sbh07",
			},
			{
				name: "BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN",
				value: "sbh08",
			},
			{
				name: "BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA",
				value: "sbh09",
			},
		],
	},
	{
		parent: "Sarawak",
		children: [
			{ name: "LIMBANG, SUNDAR, TRUSAN DAN LAWAS", value: "swk01" },
			{ name: "NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI", value: "swk02" },
			{
				name: "TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU",
				value: "swk03",
			},
			{
				name: "IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG",
				value: "swk04",
			},
			{
				name: "BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG",
				value: "swk05",
			},
			{
				name: "KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU",
				value: "swk06",
			},
			{
				name: "SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM",
				value: "swk07",
			},
			{ name: "KUCHING, BAU, LUNDU DAN SEMATAN", value: "swk08" },
			{ name: "KAMPUNG PATARIKAN", value: "swk09" },
		],
	},
	{
		parent: "Selangor",
		children: [
			{
				name: "HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG",
				value: "sgr01",
			},
			{ name: "SABAK BERNAM DAN KUALA SELANGOR", value: "sgr02" },
			{ name: "KLANG DAN KUALA LANGAT", value: "sgr03" },
		],
	},
	{
		parent: "Terengganu",
		children: [
			{ name: "KUALA TERENGGANU, MARANG DAN KUALA NERUS", value: "trg01" },
			{ name: "BESUT DAN SETIU", value: "trg02" },
			{ name: "HULU TERENGGANU", value: "trg03" },
			{ name: "DUNGUN DAN KEMAMAN", value: "trg04" },
		],
	},
	{
		parent: "Wilayah Persekutuan",
		children: [
			{ name: "Kuala Lumpur dan Putrajaya", value: "wly01" },
			{ name: "Labuan", value: "wly02" },
		],
	},
];

export default function ZoneSelector() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const handleSelectZone = (zoneValue) => {
		navigate(`/times/${zoneValue}`);
	};

	const filteredZones = useMemo(() => {
		if (!searchTerm) return ALL_ZONES;

		const term = searchTerm.toLowerCase();

		return ALL_ZONES.map((zone) => {
			const parentMatches = zone.parent.toLowerCase().includes(term);

			const matchingChildren = zone.children.filter((child) =>
				child.name.toLowerCase().includes(term),
			);

			if (parentMatches) {
				return zone;
			} else if (matchingChildren.length > 0) {
				return { ...zone, children: matchingChildren };
			}
			return null;
		}).filter(Boolean);
	}, [searchTerm]);

	return (
		<div className="w-full bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-800">
			{/* Search Header */}
			<div className="p-6 bg-linear-to-r from-acre-600 to-teal-600">
				<label
					htmlFor="search"
					className="block text-white text-sm font-semibold mb-2"
				>
					Cari Kawasan Atau Negeri
				</label>
				<div className="relative">
					<input
						id="search"
						type="text"
						className="w-full px-4 py-3 rounded-xl border-none ring-2 ring-acre-500 focus:ring-acre-300 focus:outline-none shadow-sm bg-slate-800 text-white border-slate-700 placeholder-slate-400"
						placeholder="Contoh: Gombak, Shah Alam, Melaka..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						autoComplete="off"
					/>
					<div className="absolute right-3 top-3 text-slate-400">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<title>Search</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
				</div>
			</div>

			{/* Results List */}
			<div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 bg-slate-900s/50">
				{filteredZones.length === 0 ? (
					<div className="text-center py-10 text-slate-400">
						<p>Tiada kawasan dijumpai.</p>
					</div>
				) : (
					filteredZones.map((zone) => (
						<div
							key={zone.parent}
							className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden"
						>
							<div className="px-4 py-2 bg-slate-100/50 border-b border-slate-800">
								<h3 className="font-bold text-slate-200 text-sm uppercase tracking-wide">
									{zone.parent}
								</h3>
							</div>
							<div className="divide-y divide-slate-50">
								{zone.children.map((child) => (
									<button
										type="button"
										key={child.value}
										onClick={() => handleSelectZone(child.value)}
										className="w-full text-left px-4 py-3 hover:bg-acre-50 hover:text-acre-700 transition-colors duration-200 flex items-center justify-between group"
									>
										<span className="text-sm font-medium text-slate-300 group-hover:text-acre-700 normal-case leading-relaxed">
											{child.name
												.toLowerCase()
												.replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
										</span>
										<span className="text-slate-300 group-hover:text-acre-400">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<title>Select</title>
												<path
													fillRule="evenodd"
													d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										</span>
									</button>
								))}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
