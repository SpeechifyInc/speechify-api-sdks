import { defineConfig } from "vitest/config";

export default defineConfig({
	define: {
		"process.env": JSON.stringify({
			SPEECHIFY_API_KEY: process.env.SPEECHIFY_API_KEY,
		}),
	},
	server: {
		proxy: {
			// Proxy requests to GitHub through your local server
			"/github-assets": {
				target: "https://github.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/github-assets/, ""),
			},
		},
	},
});
