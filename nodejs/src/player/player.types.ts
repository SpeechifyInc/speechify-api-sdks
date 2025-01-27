import type { Speechify } from "../index.ts";

export interface ISpeechifyPlayerProps {
	content: string;
	"voice-id": string;
	"generation-type": "audio" | "stream";
}

export type InitializeSpeechifyPlayerInput = Pick<
	Speechify,
	"audioGenerate" | "audioStream"
>;
