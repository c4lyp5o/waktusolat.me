import styles from "../styles/pages.module.css";

export default function Spin() {
	return (
		<div className={styles.centerAll}>
			<h1 aria-busy="true">Fetching for you</h1>
		</div>
	);
}
