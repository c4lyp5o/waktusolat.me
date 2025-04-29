import { useParams } from "react-router";
import { useState } from "react";
import useSWR from "swr";

import Pagination from "./Pagination";
import Spin from "./Spin";
import LoadFailed from "./LoadFailed";

import styles from "../styles/pages.module.css";

const fetcher = (url) => fetch(url).then((res) => res.json());

function QuranData(props) {
	// const { text, audio, translation, number, verses } = props.data;
	const { text, translation, id } = props.data;
	return (
		<hgroup>
			<h5 className={styles.quranic}>
				{text} ({id})
			</h5>
			<p>{translation}</p>
			{/* <audio controls>
      <source src={audio.primary} />
      Your browser does not support the audio element.
    </audio> */}
		</hgroup>
	);
}

export default function Verses() {
	const { surah } = useParams();
	const [page, setPage] = useState(1);
	const { data, error } = useSWR(`/api/v1/quran/my/${surah}`, fetcher, {
		suspense: true,
	});

	if (!surah || !data) return <Spin />;
	if (error) return <LoadFailed />;

	return (
		<>
			<title>{data.data.transliteration}</title>
			<meta name="description" content="Al Quran" />
			<link rel="icon" href="/favicon.ico" />

			<main>
				<div className={styles.centerAll}>
					{surah !== "1" && page < 2 ? (
						<p className={styles.quranic}>بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</p>
					) : (
						""
					)}
					<Pagination
						data={data.data.verses}
						page={page}
						setPage={setPage}
						RenderComponent={QuranData}
						// pageLimit={5}
						// dataLimit={10}
					/>
				</div>
			</main>
		</>
	);
}
