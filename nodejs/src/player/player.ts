import type { InitializeSpeechifyPlayerInput } from "./player.types.ts";
import type { ISpeechifyPlayerProps } from "./player.types.ts";

declare global {
	// for React
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace JSX {
		interface IntrinsicElements {
			"speechify-player": ISpeechifyPlayerProps;
		}
	}

	// for plain js and Angular
	interface HTMLElementTagNameMap {
		"speechify-player": ISpeechifyPlayerProps;
	}

	// for Vue.js
	interface GlobalComponents {
		"speechify-player": ISpeechifyPlayerProps;
	}
}

export const initializePlayer = ({
	audioGenerate,
	audioStream,
}: InitializeSpeechifyPlayerInput) => {
	class AudioPlayer extends HTMLElement {
		private audioDuration = 0;

		private content: string;
		private audioElement: HTMLAudioElement;
		private isPlaying = false;
		private playIcon = `<svg viewBox="0 0 24 24" height="24" width="24" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: rgb(20, 82, 225);" class="icon icon--play">
    <path d="M8 5v14l11-7z"></path>
  </svg>`;

		private pauseIcon = `<svg viewBox="0 0 24 24" height="24" width="24" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: rgb(20, 82, 225);" class="icon icon--pause">
    <rect width="24" height="24" fill="none"></rect>
    <path d="M6 6h4v12H6V6zm8 0h4v12h-4V6z"></path>
  </svg>`;

		get playButton() {
			return this.getElement<HTMLButtonElement>("#speechify-btn-inline-play");
		}

		constructor() {
			super();
			this.content = this.getAttribute("content") ?? "";

			this.attachShadow({ mode: "open" });
			this.audioElement = this.createAudioElement();
			void this.loadTemplate().then(() => {
				this.addEventListeners();
				this.initializeAudio(
					this.getAttribute("generation-type") as "audio" | "stream",
					this.getAttribute("voice-id") ?? "",
				);
				this.playButton.addEventListener(
					"click",
					this.togglePlayPause.bind(this),
				);
			});
		}

		private async loadTemplate() {
			const response = await fetch(new URL("./player.html", import.meta.url));
			const template = await response.text();
			this.shadowRoot!.innerHTML = template;
		}

		private getElement<T extends HTMLElement>(selector: string): T {
			const element = this.shadowRoot!.querySelector<T>(selector);
			if (!element) {
				throw new Error(`Element with selector "${selector}" not found.`);
			}
			return element;
		}

		private createAudioElement(): HTMLAudioElement {
			const audioElement = document.createElement("audio");
			audioElement.controls = true;
			audioElement.style.width = "100%";
			audioElement.style.display = "none";
			return audioElement;
		}

		private addEventListeners() {
			this.audioElement.addEventListener(
				"timeupdate",
				this.updateProgressBar.bind(this),
			);
			this.audioElement.addEventListener("ended", this.onAudioEnd.bind(this));
			this.getElement<HTMLDivElement>(
				".progress-bar-container",
			).addEventListener("click", this.onProgressBarClick.bind(this));
			this.getElement<HTMLDivElement>(
				".progress-bar-container",
			).addEventListener("mousedown", this.onProgressBarMouseDown.bind(this));
		}

		private initializeAudio(
			generationType: "audio" | "stream",
			voiceId: string,
		) {
			if (generationType === "stream") {
				void this.generateAudioStream(voiceId);
			} else {
				void this.generateAudio(voiceId);
			}
		}

		private updateProgressBar() {
			const currentProgress =
				this.getElement<HTMLDivElement>("#current-progress");
			const progressBar = this.getElement<HTMLDivElement>(".progress-bar-fill");
			const progressPoint = this.getElement<HTMLDivElement>(
				".progress-bar-handle",
			);
			const currentTime = this.audioElement.currentTime;
			const duration = this.audioElement.duration;
			const progressPercentage = (currentTime / duration) * 100;

			currentProgress.innerHTML = this.formatTime(currentTime);
			progressBar.style.width = `${progressPercentage}%`;
			progressPoint.style.left = `${progressPercentage}%`;
		}

		private onProgressBarClick(event: MouseEvent) {
			const progressContainer = this.getElement<HTMLDivElement>(
				".progress-bar-container",
			);
			const rect = progressContainer.getBoundingClientRect();
			const offsetX = event.clientX - rect.left;
			const totalWidth = rect.width;
			const percentage = offsetX / totalWidth;

			this.audioElement.currentTime = percentage * this.audioDuration;
		}

		private onProgressBarMouseDown(_event: MouseEvent) {
			const progressContainer = this.getElement<HTMLDivElement>(
				".progress-bar-container",
			);
			const onMouseMove = (moveEvent: MouseEvent) => {
				const rect = progressContainer.getBoundingClientRect();
				const offsetX = moveEvent.clientX - rect.left;
				const totalWidth = rect.width;
				const percentage = Math.min(Math.max(offsetX / totalWidth, 0), 1);

				this.audioElement.currentTime = percentage * this.audioDuration;
			};

			const onMouseUp = () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		}

		private onAudioEnd() {
			this.isPlaying = false;
			this.updatePlayButtonIcon();
		}

		private async generateAudio(voiceId: string) {
			const audio = await audioGenerate({ input: this.content, voiceId });
			const audioBlob = audio.audioData;
			const audioUrl = URL.createObjectURL(audioBlob);
			this.audioElement.src = audioUrl;

			this.audioElement.onloadedmetadata = () => {
				this.audioDuration = this.audioElement.duration;
				this.getElement<HTMLDivElement>("#total-duration").innerHTML =
					this.formatTime(this.audioDuration);
				this.toggleLoadingSpinner(false);
			};
		}

		private async generateAudioStream(voiceId: string) {
			const response = await audioStream({ input: this.content, voiceId });
			const mediaSource = new MediaSource();
			const audioUrl = URL.createObjectURL(mediaSource);
			this.audioElement.src = audioUrl;
			this.toggleLoadingSpinner(false);

			mediaSource.addEventListener("sourceopen", async () => {
				const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
				const reader = response.getReader();
				const chunks: Uint8Array[] = [];

				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						mediaSource.endOfStream();
						this.handleAudioEnd(chunks);
						break;
					} else {
						await this.appendBuffer(sourceBuffer, value, chunks);
					}
				}
			});
		}

		private toggleLoadingSpinner(isLoading: boolean) {
			this.getElement<HTMLDivElement>("#loading").style.display = isLoading
				? "block"
				: "none";
			this.playButton.style.display = isLoading ? "none" : "block";
		}

		private async appendBuffer(
			sourceBuffer: SourceBuffer,
			value: Uint8Array,
			chunks: Uint8Array[],
		) {
			const promise = new Promise<void>((resolve) => {
				sourceBuffer.onupdateend = (_ev: Event) => {
					resolve();
				};
			});
			sourceBuffer.appendBuffer(value);
			chunks.push(value);
			await promise;
		}

		private handleAudioEnd(chunks: Uint8Array[]) {
			const audioBlob = new Blob(chunks, { type: "audio/mpeg" });
			const audioUrl = URL.createObjectURL(audioBlob);
			const metaAudioElement = document.createElement("audio");
			metaAudioElement.style.display = "none";
			metaAudioElement.src = audioUrl;

			metaAudioElement.onloadedmetadata = () => {
				this.audioDuration = metaAudioElement.duration;
				this.getElement<HTMLDivElement>("#total-duration").innerHTML =
					this.formatTime(this.audioDuration);
			};

			this.audioElement.currentTime = this.audioElement.currentTime;
		}

		private formatTime(seconds: number): string {
			const minutes = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
		}

		disconnectedCallback() {
			this.playButton.removeEventListener(
				"click",
				this.togglePlayPause.bind(this),
			);
		}

		private async togglePlayPause() {
			this.isPlaying = !this.isPlaying;
			this.updatePlayButtonIcon();
			if (this.isPlaying) {
				await this.audioElement.play();
			} else {
				this.audioElement.pause();
			}
		}

		private updatePlayButtonIcon() {
			this.playButton.innerHTML = this.isPlaying
				? this.pauseIcon
				: this.playIcon;
		}

		static get observedAttributes() {
			return [
				"src",
				"width",
				"height",
				"content",
				"generation-type",
				"voice-id",
			];
		}

		attributeChangedCallback(
			name: string,
			oldValue: string | null,
			newValue: string | null,
		) {
			if (name === "src" && newValue !== null) {
				this.audioElement.src = newValue;
			} else if (name === "width" && newValue !== null) {
				this.style.width = newValue;
			} else if (name === "height" && newValue !== null) {
				this.style.height = newValue;
			} else if (name === "content" && newValue !== null) {
				this.content = newValue;
			}
		}
	}

	if (
		typeof window !== "undefined" &&
		!customElements.get(`speechify-player`)
	) {
		customElements.define(`speechify-player`, AudioPlayer);
	}
};
