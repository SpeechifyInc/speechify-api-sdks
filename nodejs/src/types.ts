export interface VoiceLanguageServer {
	// Language code, i.e. en-US.
	locale: string;
	// Voice audio preview URL.
	preview_audio?: string | null;
}

export interface VoiceLanguage {
	// Language code, i.e. en-US.
	locale: VoiceLanguageServer["locale"];
	// Voice audio preview URL.
	previewAudio: VoiceLanguageServer["preview_audio"];
}

export interface VoiceModelServer {
	name: "simba-english" | "simba-multilingual" | "simba-turbo";
	languages: VoiceLanguageServer[];
}

export interface VoiceModel {
	name: VoiceModelServer["name"];
	languages: VoiceLanguage[];
}

export interface VoiceBasePropsServer {
	id: string;
	type: "shared" | "personal";
	display_name: string;
	models: VoiceModelServer[];
}

export interface VoiceBaseProps {
	id: VoiceBasePropsServer["id"];
	type: VoiceBasePropsServer["type"];
	displayName: VoiceBasePropsServer["display_name"];
	models: VoiceModel[];
}

export interface VoicesListEntryServer extends VoiceBasePropsServer {
	// Voice avatar image URL.
	avatar_image?: string | null;
	gender?: "male" | "female" | "notSpecified";
}

export interface VoicesListEntry extends VoiceBaseProps {
	avatarImage: VoicesListEntryServer["avatar_image"];
	gender: VoicesListEntryServer["gender"];
}

export type VoicesListResponseServer = VoicesListEntryServer[];

export type VoicesListResponse = VoicesListEntry[];

export interface VoicesCreateRequest {
	// The name of the voice.
	name: string;
	// The audio sample file to be used for the voice.
	sample: Blob | File;
	// The user consent that the voice belongs to you, or to someone you represent.
	consent: {
		// The full name of the person who gave the consent.
		fullName: string;
		// The email of the person who gave the consent.
		email: string;
	};
}

export type VoicesCreateResponseServer = VoiceBasePropsServer;

export interface VoicesCreateResponse extends VoiceBaseProps {}

export type AccessTokenScope =
	| "audio:speech"
	| "audio:stream"
	| "audio:all"
	| "voices:read"
	| "voices:create"
	| "voices:delete"
	| "voices:all";

export interface AccessTokenServerResponse {
	// The access token.
	access_token: string;
	// Token expiration time in seconds.
	expires_in: number;
	// The space-delimited list of scopes granted by the token.
	scope: string;
	// The token type, always "bearer".
	token_type: "bearer";
}

export interface AccessTokenResponse {
	// The access token.
	accessToken: string;
	// Token expiration time in seconds.
	expiresIn: number;
	// The list of scopes granted by the token.
	scopes: AccessTokenScope[];
	// The token type, always "bearer".
	tokenType: "bearer";
}
