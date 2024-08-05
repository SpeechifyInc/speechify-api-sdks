export interface CreateVoiceOptions {
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
