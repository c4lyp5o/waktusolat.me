import { NavLink } from "react-router";

import styles from "../styles/pages.module.css";

export default function Navbar() {
	function ActiveLink({ root, to, title }) {
		const activeStyle = {
			color: "#fdd835",
		};

		const defaultStyle = {
			color: "#039be5",
		};

		return (
			<NavLink
				to={to}
				style={({ isActive }) =>
					isActive || (root && window.location.pathname.startsWith(root))
						? activeStyle
						: defaultStyle
				}
			>
				<span>
					<strong>{title}</strong>
				</span>
			</NavLink>
		);
	}

	return (
		<header className="container">
			<nav className={styles.navbar}>
				<ul>
					<li>
						<ActiveLink root="/times" to="/" title="Waktu Solat" />
					</li>
					<li>
						<ActiveLink root="/quran/surah" to="/quran" title="Al Quran" />
					</li>
					<li>
						<ActiveLink to="/hadith" title="Hadis" />
					</li>
					<li>
						<ActiveLink to="/radio" title="Radio" />
					</li>
					<li>
						<ActiveLink to="/chat" title="Chat" />
					</li>
					<li>
						<ActiveLink to="/about" title="About Us" />
					</li>
				</ul>
			</nav>
			<hr />
		</header>
	);
}
