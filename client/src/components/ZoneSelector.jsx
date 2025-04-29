import { useNavigate } from "react-router";
import { useState } from "react";

export default function ZoneSelector() {
	const navigate = useNavigate();
	const [searchTerm, setSearchTerm] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		const singleZone = e.target.zone.value;
		navigate(`/times/${singleZone}`);
	};

	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value.toLowerCase());
	};

	const allZones = [
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
					name: "JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)",
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

	const filteredZones = allZones
		.map((zone) => ({
			...zone,
			children: zone.children.filter((child) =>
				child.name.toLowerCase().includes(searchTerm),
			),
		}))
		.filter((zone) => zone.children.length > 0);

	return (
		<form onSubmit={handleSubmit}>
			<select id="zone" name="zone" required>
				<option value="">Sila pilih zon...</option>
				{filteredZones.map((zone) => (
					<optgroup key={zone.parent} label={zone.parent}>
						{zone.children.map((child) => (
							<option key={child.value} value={child.value}>
								{child.name}
							</option>
						))}
					</optgroup>
				))}
			</select>
			<button type="submit">Pilih</button>
		</form>
	);
}
