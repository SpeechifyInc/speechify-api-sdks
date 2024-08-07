import fs from "node:fs";
import path from "node:path";
import { test, describe, expect, beforeAll } from "vitest";

export default function testSuite(Speechify, SpeechifyAccessTokenManager) {
	let speechify;

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

	describe("voices", () => {
		test("list", async () => {
			const voices = await speechify.voicesList();

			expect(voices).toBeInstanceOf(Array);

			const george = voices.find((voice) => voice.id === "george");

			expect(george).toBeDefined();

			expect(george?.displayName).toBe("George");
		});

		test("create with Blob", async () => {
			const file = fs.readFileSync(
				path.resolve(
					import.meta.dirname,
					"./test-fixtures/donald-duck-america.mp3"
				)
			);

			const blob = new Blob([file], { type: "audio/mpeg" });

			const voice = await speechify.voicesCreate({
				name: "Donald Duck",
				sample: blob,
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

		test("create with Buffer", async () => {
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

		test("delete", async () => {
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

	describe("access token", () => {
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

	describe("audio", () => {
		test("generate", async () => {
			const speech = await speechify.audioGenerate({
				input: "Hello, world!",
				audioFormat: "mp3",
				voiceId: "george",
			});

			expect(speech.audioData).toBeInstanceOf(Buffer);
		});

		test("generate with SSML", async () => {
			const speech = await speechify.audioGenerate({
				input: "<speak>Hello, world!</speak>",
				audioFormat: "mp3",
				voiceId: "george",
			});

			expect(speech.audioData).toBeInstanceOf(Buffer);
		});

		test("stream", async () => {
			const stream = await speechify.audioStream({
				input: "Hello, world!",
				voiceId: "george",
			});

			expect(stream).toBeInstanceOf(ReadableStream);
		});
	});

	describe("SpeechifyAccessTokenManager", () => {
		test("works with raw server response", async () => {
			let callCounter = 0;

			const getToken = async () => {
				callCounter += 1;

				return {
					access_token: "a.b.c",
					expires_in: 1,
					scope: "audio:speech",
					token_type: "bearer",
				};
			};

			const manager = new SpeechifyAccessTokenManager(speechify, getToken);

			manager.setIsAuthenticated(true);

			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(callCounter).toBe(1);

			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(callCounter).toBe(2);

			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(callCounter).toBe(3);

			manager.setIsAuthenticated(false);

			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(callCounter).toBe(3);
		});

		test("works with SDK server response", async () => {
			let callCounter = 0;

			const getToken = async () => {
				callCounter += 1;

				return {
					accessToken: "a.b.c",
					expiresIn: 1,
					scopes: ["audio:speech"],
					tokenType: "bearer",
				};
			};

			const manager = new SpeechifyAccessTokenManager(speechify, getToken);

			manager.setIsAuthenticated(true);

			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(callCounter).toBe(1);

			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(callCounter).toBe(2);

			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(callCounter).toBe(3);

			manager.setIsAuthenticated(false);

			await new Promise((resolve) => setTimeout(resolve, 500));

			expect(callCounter).toBe(3);
		});
	});
}
