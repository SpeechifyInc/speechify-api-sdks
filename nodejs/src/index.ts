import {
	queryAPI,
	fetchJSON,
	mapModel,
	mapVoice,
	audioFormatToMime,
} from "./fetch.js";
import type {
	AccessTokenResponse,
	AccessTokenScope,
	AccessTokenServerResponse,
	AudioSpeechRequest,
	AudioSpeechResponse,
	AudioSpeechResponseServer,
	VoicesCreateRequest,
	VoicesCreateResponse,
	VoicesCreateResponseServer,
	VoicesListResponse,
	VoicesListResponseServer,
} from "./types.js";

export type { SpeechifyError } from "./fetch.js";
export type * from "./types.js";

export interface SpeechifyOptions {
	// Strict mode will throw an error if the API key is used in the browser environment.
	// Otherwise, it will only log a warning.
	strict?: boolean;
	// API Key can be used for server-side usage. It is the simplest form, but it's not suitable for
	// the public client environment.
	// Access Token is recommended for the public client environment.
	// Read more about this at https://docs.sws.speechify.com/docs/authentication
	apiKey?: string;
	// API URL is the base URL for the Speechify API. It is optional and defaults to the production URL,
	// which is https://api.sws.speechify.com.
	// If you know what you're doing, you can use this option to point to a different environment, like staging or development.
	apiUrl?: string;
}

const defaultOptions = {
	strict: true,
	apiKey: undefined,
	apiUrl: "https://api.sws.speechify.com",
} as const satisfies SpeechifyOptions;

export class Speechify {
	#strict: boolean;
	#apiKey: string | undefined;
	#apiUrl: string;
	#accessToken: string | undefined;

	constructor(options: SpeechifyOptions) {
		this.#strict = options.strict ?? defaultOptions.strict;

		this.#checkEnvironment(!!options.apiKey);
		this.#apiKey = options.apiKey ?? defaultOptions.apiKey;

		this.#apiUrl = options.apiUrl ?? defaultOptions.apiUrl;
		if (!this.#apiUrl) {
			throw new Error("API URL is required");
		}
	}

	#checkEnvironment(expectServer: boolean) {
		const isBrowser = typeof window !== "undefined";

		/* @todo handle more known clients like Electron apps if we can */
		const isPublicClient = isBrowser;

		if (!isPublicClient || !expectServer) {
			return;
		}

		const message = `
			You are using the API key in the browser environment.
			This is strictly not recommended, as it is exposing your Speechify account for anyone to use.
			Instead, use the API key in a server environment or use the Access Token in the browser.
			Read more about this at https://docs.sws.speechify.com/docs/authentication`;

		if (this.#strict) {
			throw new Error(message);
		}
		console.warn(message);
	}

	// Set the [access token](https://docs.sws.speechify.com/docs/authentication#access-tokens) for the client.
	setAccessToken(token: string) {
		this.#accessToken = token;
	}

	// Set the [API key](https://docs.sws.speechify.com/docs/authentication#api-keys) for the client.
	setApiKey(key: string) {
		this.#checkEnvironment(!!key);
		this.#apiKey = key;
	}

	#getToken() {
		const token = this.#accessToken ?? this.#apiKey;
		if (!token) {
			throw new Error("API Key or Access Token is required");
		}
		return token;
	}

	async #queryAPI(
		url: string,
		jsonPayload?: Record<string, unknown>,
		options?: RequestInit
	) {
		return queryAPI({
			baseUrl: this.#apiUrl,
			url,
			token: this.#getToken(),
			jsonPayload,
			options,
		});
	}

	async #fetchJSON(
		url: string,
		jsonPayload?: Record<string, unknown>,
		options?: RequestInit
	) {
		return fetchJSON({
			baseUrl: this.#apiUrl,
			url,
			token: this.#getToken(),
			jsonPayload,
			options,
		});
	}

	// Get the list of available voices.
	// [API Reference](https://docs.sws.speechify.com/reference/getvoices-1)
	async voicesList() {
		const response = (await this.#fetchJSON(
			"/v1/voices"
		)) as VoicesListResponseServer;

		return response.map(
			mapVoice
		) satisfies VoicesListResponse as VoicesListResponse;
	}

	// Create a new voice.
	// [API Reference](https://docs.sws.speechify.com/reference/createvoice)
	async voicesCreate(req: VoicesCreateRequest) {
		const formData = new FormData();
		formData.append("name", req.name);
		formData.append("sample", req.sample);
		formData.append("consent", JSON.stringify(req.consent));

		const response = (await this.#fetchJSON("/v1/voices", undefined, {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		})) as VoicesCreateResponseServer;

		return {
			id: response.id,
			type: response.type,
			displayName: response.display_name,
			models: response.models.map(mapModel),
		} satisfies VoicesCreateResponse as VoicesCreateResponse;
	}

	// Delete a voice.
	// [API Reference](https://docs.sws.speechify.com/reference/deletevoice)
	async voicesDelete(voiceId: string) {
		const response = await this.#queryAPI(`/v1/voices/${voiceId}`, undefined, {
			method: "DELETE",
		});
		if (response.status === 404) {
			throw new Error("Voice not found");
		}
		if (response.status !== 204) {
			throw new Error("Failed to delete voice");
		}
	}

	// Issue a short-living access token to be used by the public-client.
	// [API Reference](https://docs.sws.speechify.com/reference/createaccesstoken)
	// This method must only be called server-side, and the resultant token should be passed to the client.
	// Read more about this at https://docs.sws.speechify.com/docs/authentication#access-tokens
	async issueAccessToken(scope: AccessTokenScope | AccessTokenScope[]) {
		const scopeString = Array.isArray(scope) ? scope.join(" ") : scope;

		const params = new URLSearchParams({
			grant_type: "client_credentials",
			scope: scopeString,
		});

		const response = await (this.#fetchJSON("/v1/auth/token", undefined, {
			body: params,
			method: "POST",
		}) as Promise<AccessTokenServerResponse>);

		return {
			accessToken: response.access_token,
			expiresIn: response.expires_in,
			tokenType: response.token_type,
			scopes: response.scope.split(" ") as AccessTokenScope[],
		} satisfies AccessTokenResponse as AccessTokenResponse;
	}

	// Generate audio from text.
	// [API Reference](https://docs.sws.speechify.com/reference/getspeech)
	async audioGenerate(req: AudioSpeechRequest) {
		const body = {
			input: req.input,
			voice_id: req.voiceId,
			audio_format: req.audioFormat ?? "mp3",
			language: req.language,
			model: req.model,
			options: req.options
				? { loudness_normalization: req.options.enableLoudnessNormalization }
				: undefined,
		};

		const response = (await this.#fetchJSON("/v1/audio/speech", body, {
			method: "POST",
		})) as AudioSpeechResponseServer;

		return {
			audioData: Buffer.from(response.audio_data, "base64"),
			audioFormat: response.audio_format,
			billableCharactersCount: response.billable_characters_count,
			speech_marks: response.speech_marks,
		} satisfies AudioSpeechResponse as AudioSpeechResponse;
	}

	// Stream audio from text.
	// [API Reference](https://docs.sws.speechify.com/reference/getstream)
	async audioStream(req: AudioSpeechRequest) {
		const body = {
			input: req.input,
			voice_id: req.voiceId,
			language: req.language,
			model: req.model,
			options: req.options
				? { loudness_normalization: req.options.enableLoudnessNormalization }
				: undefined,
		};

		const response = await this.#queryAPI("/v1/audio/stream", body, {
			method: "POST",
			headers: {
				Accept: audioFormatToMime(req.audioFormat ?? "mp3"),
			},
		});

		if (!response.body) {
			throw new Error("Response body is empty");
		}

		return response.body.getReader();
	}
}
