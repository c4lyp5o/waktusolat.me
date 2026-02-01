import { NavLink, useLocation } from "react-router";

export default function Navbar() {
	const location = useLocation();

	function ActiveLink({ root, to, title }) {
		const isPathActive = root
			? location.pathname.startsWith(root)
			: location.pathname === to;

		const baseClasses =
			"whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border";

		// Active: Emerald Green (keeps the pop)
		const activeClasses =
			"bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-900/20 transform scale-105";

		// Inactive: Dark Slate background, gray text
		const inactiveClasses =
			"bg-transparent text-slate-400 border-transparent hover:bg-slate-800 hover:text-emerald-400";

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
		<header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
			<div className="max-w-4xl mx-auto px-4">
				<nav className="flex items-center h-16">
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
