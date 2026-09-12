import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	// Required for GitHub Pages project sites (served from
	// https://<user>.github.io/Chroma/, not the domain root) — without this,
	// every asset link in the built index.html resolves incorrectly and the
	// deployed site loads blank.
	base: "/Chroma/",
});
