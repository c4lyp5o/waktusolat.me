import { useState, useEffect } from "react";
import { useParams } from "react-router";
import useSWR from "swr";

import { nameConverter } from "../lib/helper.jsx";

import Spin from "../components/Spin";
import LoadFailed from "../components/LoadFailed.jsx";

import "../styles/prayertimes.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Zone() {
	const { zone } = useParams();
	const [timeNow, setTimeNow] = useState(new Date());

	const { data, error } = useSWR(
		`/api/v1/waktusolat/today/${zone.toLowerCase()}`,
		fetcher,
		{
			suspense: true,
		},
	);

	useEffect(() => {
		const startTimer = () => {
			const timer = setInterval(() => {
				setTimeNow(new Date());
			}, 1000);

			return () => clearInterval(timer);
		};

		startTimer();
	}, []);

	if (!zone || !data) return <Spin />;
	if (error) return <LoadFailed />;

	return (
		<>
			<title>{data.zone}</title>
			<meta name="description" content={data.zone} />
			<link rel="icon" href="/favicon.ico" />

			<main className="container">
				<section>
					<hgroup>
						<h1>{timeNow.toLocaleTimeString()}</h1>
						<h6>{data.today.day}</h6>
						<h6>
							{data.today.hijri.split(" / ")[1]},{" "}
							{data.today.date.split(" / ")[1]}
						</h6>
						<h6>{data.zone}</h6>
						<h6>
							{nameConverter[data.nextSolat.name]} akan masuk dalam{" "}
							{data.nextSolat.hours === 0
								? `${data.nextSolat.minutes} minit`
								: `${data.nextSolat.hours} jam ${data.nextSolat.minutes} minit`}
						</h6>
					</hgroup>
				</section>
				<section>
					<div className="center-all">
						<div className="grid">
							<div
								id={`${data.nextSolat.name === "fajr" ? "breath-light" : ""}`}
							>
								<kbd>Subuh</kbd>
								<h4>{data.data[0].fajr.slice(0, 5)}</h4>
							</div>
							<div
								id={`${data.nextSolat.name === "isyraq" ? "breath-light" : ""}`}
							>
								<kbd>Syuruk</kbd>
								<h4>{data.data[0].syuruk.slice(0, 5)}</h4>
							</div>
							<div
								id={`${data.nextSolat.name === "dhuhr" ? "breath-light" : ""}`}
							>
								<kbd>Zuhur</kbd>
								<h4>{data.data[0].dhuhr.slice(0, 5)}</h4>
							</div>
							<div
								id={`${data.nextSolat.name === "asr" ? "breath-light" : ""}`}
							>
								<kbd>Asar</kbd>
								<h4>{data.data[0].asr.slice(0, 5)}</h4>
							</div>
							<div
								id={`${data.nextSolat.name === "maghrib" ? "breath-light" : ""}`}
							>
								<kbd>Maghrib</kbd>
								<h4>{data.data[0].maghrib.slice(0, 5)}</h4>
							</div>
							<div
								id={`${data.nextSolat.name === "isha" ? "breath-light" : ""}`}
							>
								<kbd>Isha</kbd>
								<h4>{data.data[0].isha.slice(0, 5)}</h4>
							</div>
						</div>
					</div>
				</section>
			</main>
		</>
	);
}
