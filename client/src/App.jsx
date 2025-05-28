import { BrowserRouter, Routes, Route } from "react-router";

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

function App() {
	return (
		<BrowserRouter>
			{import.meta.env.MODE !== "production" && (
				<div className="fixed top-0 right-0 bg-yellow-500 text-black px-2 py-1 text-xs font-mono">
					{import.meta.env.MODE}
				</div>
			)}
			<Navbar />
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
