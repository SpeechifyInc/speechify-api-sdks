export interface QueryParams {
	baseUrl: string;
	url: string;
	token: string;
	options?: RequestInit;
	jsonPayload?: Record<string, unknown>;
}

export class SpeechifyError extends Error {
	constructor(message: string, public statusCode: number) {
		super(message);
	}
}

export const queryAPI = async ({
	baseUrl,
	url,
	token,
	jsonPayload,
	options = {},
}: QueryParams) => {
	const headers = new Headers(options.headers);
	options.headers = headers;

	headers.set("Authorization", `Bearer ${token}`);

	if (jsonPayload) {
		options.body = JSON.stringify(jsonPayload);
	}
	if (!headers.get("Content-Type") && jsonPayload) {
		headers.set("Content-Type", "application/json");
	}

	const fullUrl = new URL(url, baseUrl);

	const response = await fetch(fullUrl.toString(), options);

	if (!response.ok) {
		const error = await response.text();
		throw new SpeechifyError(
			`Speechify API Error ${response.statusText}: ${error || "Unknown error"}`,
			response.status
		);
	}

	return response;
};

export const fetchJSON = async ({
	baseUrl,
	url,
	token,
	jsonPayload,
	options = {},
}: QueryParams) => {
	const response = await queryAPI({
		baseUrl,
		url,
		token,
		jsonPayload,
		options,
	});

	const contentType = response.headers.get("content-type");
	const parseJson = contentType?.includes("application/json");

	if (!parseJson) {
		throw new Error("Response is not JSON");
	}

	if (parseJson) {
		return response.json();
	}
};
