// Reusable Fetch Helper
async function fetchData(url, options = {}) {
	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching data from ${url}:`, error);
		throw error;
	}
}

// Fetch Quran Data
export async function getTheQuran() {
	return await fetchData("/api/v1/quran");
}

// Fetch Specific Surah or Audio
export async function giveTheQuran(surah, type = "verses") {
	const nextSurah = surah + 1;
	const url = `https://api.quran.sutanlab.id/surah/${nextSurah}`;
	const data = await fetchData(url);
	return data.data[type];
}

// Fetch Hadith Books
export async function getTheKeetab() {
	const data = await fetchData("/api/v1/hadis");
	data.msg = data.msg.split(", ");
	return data;
}

// Fetch Specific Hadith
export async function giveTheKeetab(id) {
	const url = `/api/v1/hadis/${id.toLowerCase()}`;
	return await fetchData(url);
}

// Name Converter
export const nameConverter = {
	fajr: "Subuh",
	isyraq: "Syuruk",
	dhuhr: "Zohor",
	asr: "Asar",
	maghrib: "Maghrib",
	isha: "Isyak",
};
