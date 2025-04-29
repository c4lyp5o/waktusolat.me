import { useEffect } from "react";

import Zones from "../components/ZoneSelector";

export default function Landing() {
	useEffect(() => {
		const visit = async () => {
			try {
				await fetch("/api/v1/thanks");
				// console.log("Thanks for visiting!");
			} catch (error) {
				// console.log(error);
			}
		};

		visit();
	}, []);

	return (
		<>
			<title>Waktu Solat Malaysia</title>
			<meta
				name="description"
				content="Waktu Solat Untuk Malaysia Straight Dari JAKIM"
			/>
			<meta name="keywords" content="Waktu Solat, Malaysia, JAKIM" />
			<meta name="author" content="c4lyp5o" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<link rel="icon" href="/favicon.ico" />
			<Zones />
		</>
	);
}
