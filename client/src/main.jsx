import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Fonts are bundled (no Google Fonts request), so pages, and the TV display
// in particular, render offline and without a third-party call. A non-default
// tema's fonts load with its theme only (tv/themes/).
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/noto-naskh-arabic/wght.css";
// Every site tema's palette (S5b). Small files: each is tokens plus one or two
// type rules, so all three can travel with the app and `?tema=` never flashes.
import "./web/themes/langit.css";
import "./web/themes/takwim.css";
import "./web/themes/papan.css";
import "./web/themes/malam.css";
import "./web/themes/jalur.css";
import "./web/themes/dail.css";
import "./web/themes/kaca.js";
import "./web/themes/siang.css";
import "./web/themes/poster.css";
import "./web/themes/editorial.css";
import "./web/themes/mihrab.css";
import "./web/themes/kad.css";
import "./web/almanak.css";
import "./web/ribbon.css";
import "./web/dial.css";
import "./main.css";

import App from "./App.jsx";
import { initTema } from "./lib/tema.js";

// The inline script in index.html has already set data-tema before paint; this
// is the same rule again for a blocked storage or a script that did not run.
initTema();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</StrictMode>,
);
