import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, searchForWorkspaceRoot } from "vite";

// One zone list for the whole project: the server's registry.
const zonesFile = fileURLToPath(new URL("../controllers/zones.js", import.meta.url));

// https://vite.dev/config/
export default defineConfig({
	resolve: {
		alias: { "@zones": zonesFile },
	},
	server: {
		port: 3000,
		// Serve the shared zones file from outside the client root (dev only).
		fs: { allow: [searchForWorkspaceRoot(process.cwd()), zonesFile] },
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
	plugins: [react(), tailwindcss()],
});
