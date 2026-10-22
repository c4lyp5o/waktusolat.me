import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Inter is bundled (no Google Fonts request), so pages, and the TV display
// in particular, render offline and without a third-party call.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/inter/900.css";
import "./main.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<ErrorBoundary>
			<App />
		</ErrorBoundary>
	</StrictMode>,
);
