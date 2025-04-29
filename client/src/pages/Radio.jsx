import React from "react";
import { Link } from "react-router";

import styles from "../styles/pages.module.css";

export default function Radio() {
	return (
		<>
			<title>Radio</title>
			<meta
				name="description"
				content="Beberapa stesen radio internet islamik"
			/>
			<link rel="icon" href="/favicon.ico" />

			<main className="container">
				<div className={styles.flexContainer}>
					<ul>
						<li className={styles.radiolist}>
							<span className="radiotext">
								<Link
									to="https://radioonline.co.id/#rodja"
									title="Radio Rodja (Bogor)"
								>
									<img
										className="cover"
										src="https://cdn.webrad.io/images/logos/radioonline-co-id/rodja.png"
										alt="Radio Rodja (Bogor)"
										height="66"
										width="96"
									/>
								</Link>
							</span>
							{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
							<audio controls>
								<source src="https://radioislamindonesia.com/rodja.mp3?_=2" />
							</audio>
						</li>
						<li className={styles.radiolist}>
							<span className="radiotext">
								<Link
									to="https://radioonline.co.id/#muslim"
									title="Radio Muslim"
								>
									<img
										className="cover"
										src="https://cdn.webrad.io/images/logos/radioonline-co-id/muslim.png"
										alt="Radio Muslim"
										height="66"
										width="96"
									/>
								</Link>
							</span>
							{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
							<audio controls>
								<source src="https://cp.phpmystream.com/radioSSLnew/s/75" />
							</audio>
						</li>
						<li className={styles.radiolist}>
							<span>
								<Link
									to="https://radioonline.co.id/#bass-salatiga"
									title="Radio Bass (Salatiga)"
								>
									<img
										className="cover"
										src="https://cdn.webrad.io/images/logos/radioonline-co-id/bass-salatiga.png"
										alt="Radio Bass (Salatiga)"
										height="66"
										width="96"
									/>
								</Link>
							</span>
							{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
							<audio controls>
								<source src="http://live.bassfm.id/;" type="audio/mp3" />
							</audio>
						</li>
					</ul>
				</div>
			</main>
		</>
	);
}
