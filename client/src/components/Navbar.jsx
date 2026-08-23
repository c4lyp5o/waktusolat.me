import { NavLink, useLocation } from "react-router";

/** Brand mark: a crescent + 4-point star, kept tiny so it reads as a utility mark. */
function BrandMark() {
	return (
		<NavLink
			to="/"
			className="flex items-center gap-2 mr-2 shrink-0"
			aria-label="Waktu Solat Malaysia — Laman Utama"
		>
			<span className="grid place-items-center h-9 w-9 rounded-xl bg-acre-500/15 border border-acre-500/30">
				<svg
					className="h-5 w-5 text-acre-400"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
					<path d="M9.5 7.5 10 9l1.5.5-1.5.5-.5 1.5-.5-1.5L7.5 9.5 9 9l.5-1.5Z" />
				</svg>
			</span>
			<span className="hidden sm:inline text-sm font-bold tracking-tight text-slate-50">
				Waktu Solat
			</span>
		</NavLink>
	);
}

export default function Navbar() {
	const location = useLocation();

	function ActiveLink({ root, to, title }) {
		const isPathActive = root
			? location.pathname.startsWith(root)
			: location.pathname === to;

		const baseClasses =
			"whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border shrink-0";

		// Active: emerald (acre) — keeps the pop on dark
		const activeClasses =
			"bg-acre-500 text-night-950 border-acre-500 shadow-lg shadow-acre-900/20 scale-105";

		// Inactive: transparent, gray text
		const inactiveClasses =
			"bg-transparent text-slate-400 border-transparent hover:bg-night-800 hover:text-acre-300";

		return (
			<NavLink
				to={to}
				className={({ isActive }) =>
					isActive || isPathActive
						? `${baseClasses} ${activeClasses}`
						: `${baseClasses} ${inactiveClasses}`
				}
			>
				{title}
			</NavLink>
		);
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b border-night-800 bg-night-900/80 backdrop-blur-md">
			<div className="max-w-4xl mx-auto px-4">
				<nav className="flex items-center h-16">
					<BrandMark />
					<ul className="flex flex-nowrap items-center gap-2 overflow-x-auto w-full pb-0 no-scrollbar sm:justify-center">
						<ActiveLink root="/times" to="/" title="Waktu Solat" />
						<ActiveLink root="/quran" to="/quran" title="Al Quran" />
						<ActiveLink to="/hadith" title="Hadis" />
						<ActiveLink to="/radio" title="Radio" />
						<ActiveLink to="/chat" title="Chat" />
						<ActiveLink to="/about" title="About" />
					</ul>
				</nav>
			</div>
		</header>
	);
}