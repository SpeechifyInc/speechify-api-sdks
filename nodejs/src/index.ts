import { queryAPI, fetchJSON } from "./fetch.js";
import type {
	VoicesCreateRequest,
	VoicesCreateResponse,
	VoicesListResponse,
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

	#checkEnvironment(isApiKeySet: boolean) {
		const isBrowser = typeof window !== "undefined";

		/* @todo handle more known clients like Electron apps if we can */
		const isPublicClient = isBrowser;

		if (!isPublicClient || !isApiKeySet) {
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

	async #queryAPI(url: string, options?: RequestInit) {
		return queryAPI({
			baseUrl: this.#apiUrl,
			url,
			token: this.#getToken(),
			options,
		});
	}

	async #fetchJSON(url: string, options?: RequestInit) {
		return fetchJSON({
			baseUrl: this.#apiUrl,
			url,
			token: this.#getToken(),
			options,
		});
	}

	// Get the list of available voices.
	// [API Reference](https://docs.sws.speechify.com/reference/getvoices-1)
	voicesList() {
		return this.#fetchJSON("/v1/voices") as Promise<VoicesListResponse>;
	}

	// Create a new voice.
	// [API Reference](https://docs.sws.speechify.com/reference/createvoice)
	voicesCreate(req: VoicesCreateRequest) {
		const formData = new FormData();
		formData.append("name", req.name);
		formData.append("sample", req.sample);
		formData.append("consent", JSON.stringify(req.consent));

		return this.#fetchJSON("/v1/voices", {
			method: "POST",
			body: formData,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}) as Promise<VoicesCreateResponse>;
	}

	// Delete a voice.
	// [API Reference](https://docs.sws.speechify.com/reference/deletevoice)
	async voicesDelete(voiceId: string) {
		const response = await this.#queryAPI(`/v1/voices/${voiceId}`, {
			method: "DELETE",
		});
		if (response.status === 404) {
			throw new Error("Voice not found");
		}
		if (response.status !== 204) {
			throw new Error("Failed to delete voice");
		}
	}
}
