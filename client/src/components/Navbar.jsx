// Navbar.jsx — wordmark, plain links (active by brightness), theme toggle.
// On phones the destinations move to a bottom bar, within thumb reach.
// The top band is painted in the sky over the visitor's zone (useZoneSky).
import { NavLink, useLocation } from "react-router";
import ThemeToggle from "./ThemeToggle.jsx";
import useZoneSky, { skyZone } from "./useZoneSky.js";

const LINKS = [
	{ to: "/", label: "Waktu Solat", match: (p) => p === "/" || p.startsWith("/times") },
	{ to: "/quran", label: "Al-Quran", match: (p) => p.startsWith("/quran") },
	{ to: "/hadith", label: "Hadis" },
	{ to: "/radio", label: "Radio" },
	{ to: "/chat", label: "Chat" },
	{ to: "/about", label: "Tentang" },
	{ to: "/m/baru", label: "Untuk Masjid", match: (p) => p.startsWith("/m/") },
];

function Wordmark() {
	return (
		<NavLink
			to="/"
			className="flex items-center gap-2 font-semibold text-ink"
			aria-label="Waktu Solat, laman utama"
		>
			<svg className="h-6 w-6 text-accent-fill" viewBox="0 0 24 24" aria-hidden="true">
				<path fill="currentColor" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
			</svg>
			<span className="text-[17px] tracking-tight">Waktu Solat</span>
		</NavLink>
	);
}

export default function Navbar() {
	const { pathname } = useLocation();
	const active = (l) => (l.match ? l.match(pathname) : pathname === l.to);
	const tone = (l) => (active(l) ? "text-ink font-semibold" : "text-faint hover:text-ink");
	const sky = useZoneSky(skyZone(pathname));

	return (
		<>
			<header className={sky ? "sky" : "bg-ground"} data-sky={sky ?? undefined}>
				<nav
					className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4 md:h-16 md:px-6"
					aria-label="Utama"
				>
					<Wordmark />
					<ul className="ml-auto hidden items-center gap-1 md:flex">
						{LINKS.map((l) => (
							<li key={l.to}>
								<NavLink
									to={l.to}
									aria-current={active(l) ? "page" : undefined}
									className={`rounded-lg px-3 py-2 text-[15px] transition-colors ${tone(l)}`}
								>
									{l.label}
								</NavLink>
							</li>
						))}
					</ul>
					<NavLink
						to="/m/baru"
						className={`ml-auto rounded-lg px-3 py-2 text-[15px] md:hidden ${tone(LINKS[6])}`}
					>
						Masjid
					</NavLink>
					<NavLink
						to="/about"
						className={`rounded-lg px-3 py-2 text-[15px] md:hidden ${tone(LINKS[5])}`}
					>
						Tentang
					</NavLink>
					<ThemeToggle />
				</nav>
			</header>

			<nav
				className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ground pb-[env(safe-area-inset-bottom)] md:hidden"
				aria-label="Utama (telefon)"
			>
				<ul className="grid h-14 grid-cols-5">
					{LINKS.slice(0, 5).map((l) => (
						<li key={l.to} className="flex">
							<NavLink
								to={l.to}
								aria-current={active(l) ? "page" : undefined}
								className={`flex flex-1 items-center justify-center text-[14px] ${tone(l)}`}
							>
								{l.label === "Waktu Solat" ? "Waktu" : l.label}
							</NavLink>
						</li>
					))}
				</ul>
			</nav>
		</>
	);
}
