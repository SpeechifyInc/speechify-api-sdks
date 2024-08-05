export interface SpeechifyOptions {
	strict?: boolean;
	apiKey?: string;
}

export class Speechify {
	#strict: boolean;
	#apiKey: string | undefined;

	constructor(options: SpeechifyOptions) {
		this.#strict = options.strict ?? true;

		this.#checkEnvironment(!!options.apiKey);
		this.#apiKey = options.apiKey;
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
}
