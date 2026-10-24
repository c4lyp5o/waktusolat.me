import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Fonts are bundled (no Google Fonts request), so pages, and the TV display
// in particular, render offline and without a third-party call. The TV's
// Takwim and Songket fonts load with their theme only (tv/themes/).
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/noto-naskh-arabic/wght.css";
import "./main.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</StrictMode>,
);
