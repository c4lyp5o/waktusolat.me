import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import { isTvPath } from "./lib/routes.js";
import About from "./pages/About";
import Chat from "./pages/Chat";
import Hadith from "./pages/Hadith";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import QuranSurahSelect from "./pages/QuranSurahSelect";
import QuranWithSurah from "./pages/QuranWithSurah";
import Radio from "./pages/Radio";
import ZonePrayerTimes from "./pages/ZonePrayerTimes";

// The mosque TV display: its own chunk (three.js, motion and fonts load only
// there), rendered without the site chrome.
const TvApp = lazy(() => import("./tv/TvApp.jsx"));
const MosqueTv = lazy(() => import("./tv/MosqueTv.jsx"));
// The mosque pages: few visitors, so out of the main bundle.
const MosqueNew = lazy(() => import("./pages/MosqueNew.jsx"));
const MosqueEditor = lazy(() => import("./pages/MosqueEditor.jsx"));

// Top-level routes that count as a "visit". Deep links (e.g. a bookmarked
// /times/wly01) arrive here as a hard load — the beacon fires on whatever
// path the user actually landed on, not just the landing page.
const VISIT_PREFIXES = ["/times/", "/quran", "/hadith", "/radio", "/chat", "/about", "/tv/", "/m/"];

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

// Navbar and the dev-mode badge, on every route except the TV display.
function SiteChrome() {
	const { pathname } = useLocation();
	if (isTvPath(pathname)) return null;
	return (
		<>
			{import.meta.env.MODE !== "production" && (
				<div
					style={{
						// Bottom-left, above the phone bottom bar, and click-through:
						// it used to sit on top of the theme toggle.
						position: "fixed",
						bottom: "4.5rem",
						left: "0.75rem",
						zIndex: 1000,
						pointerEvents: "none",
						opacity: 0.8,
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
		</>
	);
}

function App() {
	return (
		<BrowserRouter>
			<SiteChrome />
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
				<Route
					path="/m/baru"
					element={
						<Suspense fallback={null}>
							<MosqueNew />
						</Suspense>
					}
				/>
				<Route
					path="/m/:id"
					element={
						<Suspense fallback={null}>
							<MosqueTv />
						</Suspense>
					}
				/>
				<Route
					path="/m/:id/edit"
					element={
						<Suspense fallback={null}>
							<MosqueEditor />
						</Suspense>
					}
				/>
				<Route
					path="/tv/:zone"
					element={
						<Suspense fallback={null}>
							<TvApp />
						</Suspense>
					}
				/>

				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
