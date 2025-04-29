import { useState, useEffect } from "react";

import { getTheKeetab, giveTheKeetab } from "../lib/helper";
import Spin from "../components/Spin";

export default function Hadith() {
	const [showSalam, setShowSalam] = useState(true);
	const [hadith, setHadith] = useState([]);
	const [search, setSearch] = useState("");
	const [keetab, setKeetab] = useState([]);
	const [display, setDisplay] = useState(false);

	useEffect(() => {
		const downloadKeetabList = async () => {
			const { msg } = await getTheKeetab();
			setKeetab(msg);
		};

		downloadKeetabList();
	}, []);

	async function handleSubmit(event) {
		event.preventDefault();

		setDisplay(true);
		setHadith(null);

		try {
			const allKeetab = await giveTheKeetab(search);
			setHadith(allKeetab);
			setShowSalam(false);
			setDisplay(true);
		} catch (error) {
			// console.log(error);
			setHadith("Harap Maaf, Sila Cuba Lagi");
		} finally {
			setDisplay(false);
		}
	}

	return (
		<>
			<title>Hadith</title>
			<meta
				name="description"
				content="Koleksi hadis dari kutubussittah dalam bahasa Melayu"
			/>
			<link rel="icon" href="/favicon.ico" />

			<main className="container">
				<div className="grid">
					<div>
						<form onSubmit={handleSubmit}>
							<select
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								required
							>
								<option value="">Sila pilih kitab...</option>
								{keetab.map((singleKeetab) => (
									<option key={singleKeetab} value={singleKeetab.id}>
										{singleKeetab.toUpperCase()}
									</option>
								))}
							</select>
							<button type="submit" value="Submit">
								Pilih
							</button>
						</form>
					</div>
					<div />
					<div>
						<h1>Hadith</h1>
					</div>
				</div>
				{display ? <Spin /> : hadith.hadis}
				{showSalam && <p className="centered">Assalamualaikum</p>}
			</main>
		</>
	);
}
