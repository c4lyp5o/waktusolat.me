/**
 * Generic Fetch Wrapper with Error Handling
 * @param {string} url
 * @param {object} options
 */
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

/**
 * Fetch the list of Surahs
 */
export async function getTheQuran() {
	return await fetchData("/api/v1/quran");
}

/**
 * Fetch Specific Surah details or Audio
 * Note: This hits an external API (sutanlab.id)
 */
export async function giveTheQuran(surah, type = "verses") {
	// Convert 0-index to 1-index if necessary, or ensure string input is parsed
	const nextSurah = Number(surah) + 1;
	const url = `https://api.quran.sutanlab.id/surah/${nextSurah}`;
	const data = await fetchData(url);
	return data.data[type];
}

/**
 * Fetch list of available Hadith Books (Kutub Sittah)
 * - Splits the comma-separated string into an array
 */
export async function getTheKeetab() {
	const data = await fetchData("/api/v1/hadis");

	// Robustness check: Ensure msg is a string before splitting
	if (data?.msg && typeof data.msg === "string") {
		data.msg = data.msg.split(", ");
	} else if (!Array.isArray(data.msg)) {
		// Fallback if data is weird
		data.msg = [];
	}

	return data;
}

/**
 * Fetch a random/specific Hadith from a specific Book
 * @param {string} id - The book ID (e.g., 'bukhari')
 */
export async function giveTheKeetab(id) {
	if (!id) throw new Error("Book ID is required");
	const url = `/api/v1/hadis/${id.toLowerCase()}`;
	return await fetchData(url);
}

/**
 * Mapping for Prayer Times (API Key -> Display Name)
 */
export const nameConverter = {
	fajr: "Subuh",
	isyraq: "Syuruk",
	dhuhr: "Zuhur",
	asr: "Asar",
	maghrib: "Maghrib",
	isha: "Isyak",
};
