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

	describe.skip("voices", () => {
		test("list", async () => {
			const voices = await speechify.voicesList();

			expect(voices).toBeInstanceOf(Array);

			const george = voices.find((voice) => voice.id === "george");

			expect(george).toBeDefined();

			expect(george?.displayName).toBe("George");
		});

		test.skip("create with Blob", async () => {
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

		test.skip("create with Buffer", async () => {
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

		test.skip("delete", async () => {
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

			const id = voice.id;

			await speechify.voicesDelete(id);
		});
	});

	describe.skip("access token", () => {
		test("issue", async () => {
			const token = await speechify.accessTokenIssue("audio:speech");

			expect(token).toMatchObject({
				accessToken: expect.any(String),
				expiresIn: 3600,
				scopes: ["audio:speech"],
				tokenType: "bearer",
			});
		});

		test("issue with multiple scopes", async () => {
			const token = await speechify.accessTokenIssue([
				"audio:speech",
				"voices:read",
			]);

			expect(token).toMatchObject({
				accessToken: expect.any(String),
				expiresIn: 3600,
				scopes: ["audio:speech", "voices:read"],
				tokenType: "bearer",
			});
		});

		test("use", async () => {
			const token = await speechify.accessTokenIssue("audio:speech");

			speechify.setAccessToken(token.accessToken);

			const speech = await speechify.audioGenerate({
				input: "Hello, world!",
				audioFormat: "mp3",
				voiceId: "george",
			});

			expect(speech.audioData).toBeInstanceOf(Buffer);

			speechify.setAccessToken(undefined);
		});

		test("use with wrong scope", async () => {
			const token = await speechify.accessTokenIssue("audio:speech");

			speechify.setAccessToken(token.accessToken);

			await expect(speechify.voicesList()).rejects.toThrowError(
				/none of the sufficient scopes found/
			);

			speechify.setAccessToken(undefined);
		});

		test("use, then remove: API key is used again", async () => {
			const token = await speechify.accessTokenIssue("audio:speech");

			speechify.setAccessToken(token.accessToken);

			await expect(speechify.voicesList()).rejects.toThrowError();

			speechify.setAccessToken(undefined);

			const voices = await speechify.voicesList();

			expect(voices).toBeInstanceOf(Array);
		});
	});
});
