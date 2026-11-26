// mosques.js — one well-known mosque per state, shown on the zone page.
// Real, openly licensed photographs from Wikimedia Commons; each is
// credited under its picture and listed on /about (credits.json holds the
// source page, creator and licence as recorded at download).
import credits from "../assets/mosques/credits.json";

const urls = import.meta.glob("../assets/mosques/*.webp", { eager: true, import: "default" });
// 480 px versions for the state tiles on the zone search page.
const thumbs = import.meta.glob("../assets/mosques/thumbs/*.webp", {
	eager: true,
	import: "default",
});

// negeri (as in controllers/zones.js) -> file stem and the mosque's name.
const BY_STATE = {
	Johor: ["johor", "Masjid Sultan Abu Bakar, Johor Bahru"],
	Kedah: ["kedah", "Masjid Zahir, Alor Setar"],
	Kelantan: ["kelantan", "Masjid Muhammadi, Kota Bharu"],
	Melaka: ["melaka", "Masjid Selat Melaka"],
	"Negeri Sembilan": ["negeri-sembilan", "Masjid Negeri, Seremban"],
	Pahang: ["pahang", "Masjid Negeri Sultan Ahmad Shah, Kuantan"],
	Perak: ["perak", "Masjid Ubudiah, Kuala Kangsar"],
	Perlis: ["perlis", "Masjid Alwi, Kangar"],
	"Pulau Pinang": ["pulau-pinang", "Masjid Kapitan Keling, George Town"],
	Sabah: ["sabah", "Masjid Bandaraya Kota Kinabalu"],
	Sarawak: ["sarawak", "Masjid Bandaraya Kuching"],
	Selangor: ["selangor", "Masjid Sultan Salahuddin Abdul Aziz Shah, Shah Alam"],
	Terengganu: ["terengganu", "Masjid Tengku Tengah Zaharah, Kuala Terengganu"],
	"Wilayah Persekutuan Kuala Lumpur": [
		"wilayah-persekutuan-kuala-lumpur",
		"Masjid Negara, Kuala Lumpur",
	],
	"Wilayah Persekutuan Labuan": ["wilayah-persekutuan-labuan", "Masjid An-Nur, Labuan"],
};

const creditFor = (stem) => credits.find((c) => c.file.endsWith(`/${stem}.webp`));

// { src, name, creator, license, licenseUrl, page } or null.
export function mosqueFor(negeri) {
	const entry = BY_STATE[negeri];
	if (!entry) return null;
	const [stem, name] = entry;
	const src = urls[`../assets/mosques/${stem}.webp`];
	const c = creditFor(stem);
	if (!src || !c) return null;
	return {
		src,
		thumb: thumbs[`../assets/mosques/thumbs/${stem}.webp`],
		name,
		width: c.width,
		height: c.height,
		creator: c.creator,
		license: c.license,
		licenseUrl: c.licenseUrl,
		page: c.page,
	};
}

// Every photo with its credit, for /about.
export const MOSQUE_CREDITS = Object.entries(BY_STATE)
	.map(([negeri]) => ({ negeri, ...mosqueFor(negeri) }))
	.filter((m) => m.src);
