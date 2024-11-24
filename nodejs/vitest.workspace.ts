import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
	{
		test: {
			include: ["src/**/*.node.test.*"],
			name: "node",
			environment: "node",
		},
	},
	{
		extends: "vitest.config.browser.ts",
		test: {
			include: ["src/**/*.browser.test.*"],
			name: "browser",
			browser: {
				enabled: true,
				provider: "playwright",
				name: "chromium",
				headless: !process.env.TEST_VISIBLE,
			},
		},
	},
]);
