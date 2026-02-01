import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	server: {
		port: 3000,
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
