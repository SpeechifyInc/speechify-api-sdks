import { defineConfig } from "vitest/config";

// This has to be a separate file, vitest playwright tests do not work otherwise
export default defineConfig({
	define: {
		"process.env": JSON.stringify({
			SPEECHIFY_API_KEY: process.env.SPEECHIFY_API_KEY,
		}),
	},
	server: {
		proxy: {
			// Proxy requests to GitHub through vitest local server
			"/github-assets": {
				target: "https://github.com",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/github-assets/, ""),
			},
		},
	},
});
