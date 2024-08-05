interface VoiceLanguage {
	// Language code, i.e. en-US.
	locale: string;
	// Voice audio preview URL.
	preview_audio?: string | null;
}

interface VoiceModel {
	name: "simba-english" | "simba-multilingual" | "simba-turbo";
	languages: VoiceLanguage[];
}

interface VoiceBaseProps {
	id: string;
	type: "shared" | "personal";
	display_name: string;
	models: VoiceModel[];
}

export interface VoicesListEntry extends VoiceBaseProps {
	// Voice avatar image URL.
	avatar_image?: string | null;
	gender?: "male" | "female" | "notSpecified";
}

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

export type VoicesCreateResponse = VoiceBaseProps;
