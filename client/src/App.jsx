import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { useEffect } from "react";

import Landing from "./pages/Landing";
import ZonePrayerTimes from "./pages/ZonePrayerTimes";
import QuranSurahSelect from "./pages/QuranSurahSelect";
import QuranWithSurah from "./pages/QuranWithSurah";
import Hadith from "./pages/Hadith";
import Radio from "./pages/Radio";
import Chat from "./pages/Chat";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import Navbar from "./components/Navbar";

// Top-level routes that count as a "visit". Deep links (e.g. a bookmarked
// /times/wly01) arrive here as a hard load — the beacon fires on whatever
// path the user actually landed on, not just the landing page.
const VISIT_PREFIXES = [
	"/times/",
	"/quran",
	"/hadith",
	"/radio",
	"/chat",
	"/about",
];

function isTrackedVisit(pathname) {
	if (pathname === "/") return true;
	return VISIT_PREFIXES.some((p) => pathname.startsWith(p));
}

// Fires the visit beacon on mount and on any top-level route change.
// The server dedups by IP within a 15-min window, so SPA nav across pages
// (quran -> chat -> about) still counts as one visit for that sitting.
function VisitTracker() {
	const { pathname } = useLocation();
	useEffect(() => {
		if (!isTrackedVisit(pathname)) return;
		fetch("/api/v1/thanks").catch(() => {});
	}, [pathname]);
	return null;
}

function App() {
	return (
		<BrowserRouter>
			{import.meta.env.MODE !== "production" && (
				<div
					style={{
						position: "fixed",
						top: "1rem",
						right: "1rem",
						zIndex: 1000,
					}}
				>
					<span
						className="contrast"
						style={{
							padding: "0.25rem 0.75rem",
							fontFamily: "monospace",
							fontSize: "0.85rem",
							fontWeight: 600,
						}}
					>
						{import.meta.env.MODE}
					</span>
				</div>
			)}
			<Navbar />
			<VisitTracker />
			<Routes>
				<Route index element={<Landing />} />

				<Route path="/times/:zone" element={<ZonePrayerTimes />} />
				<Route path="/quran" element={<QuranSurahSelect />} />
				<Route path="/quran/:surah" element={<QuranWithSurah />} />
				<Route path="/hadith" element={<Hadith />} />
				<Route path="/radio" element={<Radio />} />
				<Route path="/chat" element={<Chat />} />
				<Route path="/about" element={<About />} />

				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
