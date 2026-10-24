// ThemeToggle.jsx — light/dark switch; the choice is remembered (lib/theme.js).
import { useState } from "react";
import { currentTheme, setTheme } from "../lib/theme.js";

export default function ThemeToggle() {
	const [theme, setState] = useState(currentTheme);
	const next = theme === "dark" ? "light" : "dark";
	const label = next === "dark" ? "Tukar ke mod gelap" : "Tukar ke mod cerah";
	return (
		<button
			type="button"
			onClick={() => {
				setTheme(next);
				setState(next);
			}}
			aria-label={label}
			title={label}
			className="grid h-10 w-10 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-ink"
		>
			<svg
				className="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				aria-hidden="true"
			>
				{theme === "dark" ? (
					<>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
					</>
				) : (
					<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
				)}
			</svg>
		</button>
	);
}
