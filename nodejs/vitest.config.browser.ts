import { defineConfig } from "vitest/config";

export default defineConfig({
	define: {
		"process.env": JSON.stringify({
			SPEECHIFY_API_KEY: process.env.SPEECHIFY_API_KEY,
		}),
	},
});
