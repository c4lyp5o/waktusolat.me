import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import { TEMAS, WEB_TEMAS } from "../shared/temas.js";

// One zone list for the whole project: the server's registry.
const zonesFile = fileURLToPath(new URL("../controllers/zones.js", import.meta.url));
// One tema registry for the whole project (client and server).
const sharedDir = fileURLToPath(new URL("../shared", import.meta.url));
// The pre-paint script needs the site temas without importing a module; the
// ids are injected at build and dev, from the same registry.
const temaIds = () => ({
	name: "tema-ids",
	transformIndexHtml: (html) =>
		html.replace(
			"<!--tema-ids-->",
			// id and mode: a `fixed` tema ignores the system dark setting, and the
			// browser must know that before the first paint.
			`<script>window.__TEMAS__=${JSON.stringify(TEMAS.map(({ id, mode }) => ({ id, mode })))};window.__WEB_TEMAS__=${JSON.stringify(WEB_TEMAS)}</script>`,
		),
});

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: { "@zones": zonesFile },
	},
	server: {
		port: 3000,
		// Serve the shared files from outside the client root (dev only).
		fs: { allow: [searchForWorkspaceRoot(process.cwd()), zonesFile, sharedDir] },
		proxy: {
			"/api/v1": {
				target: "http://localhost:5000",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: "../public",
		emptyOutDir: true,
	},
	plugins: [react(), tailwindcss(), temaIds()],
});
