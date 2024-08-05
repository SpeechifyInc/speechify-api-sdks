import * as fs from "node:fs";
import * as path from "node:path";
import { test, describe, expect, beforeAll } from "vitest";

import { Speechify } from "./index.js";

describe("SDK > TS", () => {
	let speechify: Speechify;

	beforeAll(() => {
		const apiKey = process.env.SPEECHIFY_API_KEY;
		if (!apiKey) {
			throw new Error("SPEECHIFY_API_KEY is not set");
		}
		speechify = new Speechify({
			apiKey,
			apiUrl: "https://api.sws.speechify.dev",
		});
	});

	test("voices list", async () => {
		const voices = await speechify.voicesList();

		expect(voices).toBeInstanceOf(Array);

		const george = voices.find((voice) => voice.id === "george");

		expect(george).toBeDefined();

		expect(george?.displayName).toBe("George");
	});

	test("voice create with Blob", async () => {
		const file = await fs.openAsBlob(
			path.resolve(
				import.meta.dirname,
				"./test-fixtures/donald-duck-america.mp3"
			)
		);

		const voice = await speechify.voicesCreate({
			name: "Donald Duck",
			sample: file,
			consent: {
				fullName: "Donald Duck",
				email: "donald.duck@snaydi.moc",
			},
		});

		expect(voice).toMatchObject({
			displayName: "Donald Duck",
			type: "personal",
		});
	});

	test("voice create with Buffer", async () => {
		const file = fs.readFileSync(
			path.resolve(
				import.meta.dirname,
				"./test-fixtures/donald-duck-america.mp3"
			)
		);

		const voice = await speechify.voicesCreate({
			name: "Donald Duck",
			sample: file,
			consent: {
				fullName: "Donald Duck",
				email: "donald.duck@snaydi.moc",
			},
		});

		expect(voice).toMatchObject({
			displayName: "Donald Duck",
			type: "personal",
		});
	});
});
