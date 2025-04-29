import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import Spin from "../components/Spin";

import styles from "../styles/pages.module.css";

export default function QuranSurahSelect() {
	const navigate = useNavigate();
	const [surah, setSurah] = useState(null);
	const [randomAyat, setRandomAyat] = useState(null);

	async function handleSubmit(e) {
		e.preventDefault();
		const value = e.target.surah.value;
		navigate(`/quran/${Number.parseInt(value) + 1}`);
	}

	useEffect(() => {
		const getRandomAyat = async () => {
			const response = await fetch("api/v1/quran/random");
			const data = await response.json();
			return data;
		};

		const getSurah = async () => {
			const response = await fetch("api/v1/quran");
			const data = await response.json();
			return data;
		};

		Promise.all([getRandomAyat(), getSurah()]).then(
			([randomAyatData, surahData]) => {
				setRandomAyat(randomAyatData);
				setSurah(surahData);
			},
		);
	}, []);

	if (!surah || !randomAyat) return <Spin />;

	return (
		<>
			<title>Al Quran</title>
			<meta name="description" content="Al Quran" />
			<link rel="icon" href="/favicon.ico" />
			<form onSubmit={handleSubmit}>
				<select className="button" id="surah" name="surah">
					<option value="">Sila pilih surah...</option>
					{surah.data.map((singleSurah, index) => (
						<option key={singleSurah.transliteration} value={index}>
							{singleSurah.transliteration}
						</option>
					))}
				</select>
				<button type="submit" value="Submit">
					Pilih
				</button>
			</form>
			<hgroup>
				<h1 className={styles.quranicIntro}>{randomAyat.data.arabic}</h1>
				<p className={styles.translationIntro}>
					{randomAyat.data.malayTranslation}
				</p>
				<div className={styles.translationIntro}>
					<small>{randomAyat.data.fromSurah}</small>
					{", "}
					<small>{randomAyat.data.ayatNumber}</small>
				</div>
			</hgroup>
		</>
	);
}
