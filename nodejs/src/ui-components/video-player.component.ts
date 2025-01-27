import type { Speechify } from "../index.ts";

interface ISpeechifyPlayerProps {
	content: string;
	"voice-id": string;
	"generation-type": "audio" | "stream";
}

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
}: Pick<Speechify, "audioGenerate" | "audioStream">) => {
	class VideoPlayer extends HTMLElement {
		private playButton: HTMLButtonElement;
		private videoDuration = 0;

		private content: string;
		private videoElement: HTMLVideoElement;
		private isPlaying = false;
		private isLoading = true;
		private playIcon = `<svg viewBox="0 0 24 24" height="24" width="24" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: rgb(20, 82, 225);" class="icon icon--play">
    <path d="M8 5v14l11-7z"></path>
  </svg>`;

		private pauseIcon = `<svg viewBox="0 0 24 24" height="24" width="24" aria-hidden="true" focusable="false" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="color: rgb(20, 82, 225);" class="icon icon--pause">
    <rect width="24" height="24" fill="none"></rect>
    <path d="M6 6h4v12H6V6zm8 0h4v12h-4V6z"></path>
  </svg>`;

		private loadingIcon = `<div class="loading-spinner" style="width: 24px; height: 24px; border: 4px solid rgba(20, 82, 225, 0.3); border-top: 4px solid rgb(20, 82, 225); border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <style>
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>`;

		constructor() {
			super();
			this.content = this.getAttribute("content") || "";

			this.attachShadow({ mode: "open" });
			this.shadowRoot!.innerHTML = this.getTemplate();

			this.playButton = this.getElement<HTMLButtonElement>(
				"#speechify-btn-inline-play",
			);
			this.videoElement = this.createVideoElement();

			this.addEventListeners();
			this.initializeAudio(
				this.getAttribute("generation-type") as "audio" | "stream",
				this.getAttribute("voice-id") || "",
			);
		}

		private getTemplate(): string {
			return `
        <div id="speechify-root">
          <div>
            <style data-styled="active" data-styled-version="5.3.1">
              ${this.getStyles()}
            </style>
            ${this.getPlayerTemplate()}
          </div>
        </div>
      `;
		}

		private getStyles(): string {
			return `
        .icon { display: inline-block; vertical-align: middle; overflow: hidden; }
        .player-controls { display: flex; align-items: center; }
        .mobile-web-ui .player-container { width: 110%; margin-left: -5%; margin-bottom: 12px; }
        .progress-bar-container { position: relative; flex: 1; margin: 0 16px; height: 20px; display: flex; align-items: center; cursor: pointer; }
        .progress-bar-input { opacity: 0; position: absolute; top: 0; left: 0; height: 100%; width: 100%; cursor: pointer; margin: 0; }
        .progress-bar-track { background-color: rgba(0, 0, 0, 0.08); flex: 1; transition: all 0.2s; cursor: pointer; }
        .progress-bar-fill { height: 2px; background-color: #000; }
        .mobile-web-ui .progress-bar-fill { height: 3px; }
        .progress-bar-handle { height: 10px; width: 10px; position: absolute; background-color: #000; top: 5px; border-radius: 5px; }
        .time-display { font-size: 12px; color: #757575; font-weight: 500; min-width: 33px; flex-shrink: 0; user-select: none; }
        .time-display:not(:last-child):not(:first-child) { text-align: center; }
        .mobile-web-ui .time-display:first-child { transform: translate(36px, 16px); }
        .mobile-web-ui .time-display:last-child { text-align: right; transform: translate(-36px, 16px); }
        .mobile-web-ui .time-display { font-weight: 500; }
        .control-button { width: 40px; height: 40px; color: #000; cursor: pointer; opacity: 0.9; transition: all 0.2s; }
        .control-button:hover { opacity: 1; }
        .player-wrapper { border: 1px solid rgba(0, 0, 0, 0.1); padding: 10px 16px 8px 8px; border-radius: 8px; background-color: transparent; display: flex; align-items: center; overflow: hidden; }
        .player-info { padding: 0 4px 0 8px; flex: 1; }
        .player-title { font-size: 12px; font-weight: 500; color: var(--color-glass-500); }
        .player-controls-container { margin-top: 3px; }
        .speechify-logo { color: #000; display: block; margin-left: 12px; cursor: pointer; opacity: 0.8; transition: opacity 0.2s; }
        .speechify-logo:hover { opacity: 1; }
        * { --color-default-blue: #2137FC; --color-electric-300: #6A79FD; --color-electric-250: #B4BBFE; --color-electric-200: #E6E8FF; --color-electric-150: #F1F4F9; --color-electric-100: #F5F6FF; --color-glass-300: #E4EAF1; --color-glass-500: #587393; --color-glass-600: #364A63; --color-glass-700: #1C2C40; --color-glass-800: #14202E; --color-glass-900: #05070B; --color-pill-player: #006341; --color-skim-paragraph-start: #CE1625; }
        .player-root { margin-top: 32px; font-variant: normal; font-feature-settings: normal; font-family: 'ABC Diatype', 'sohne', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; }
      `;
		}

		private getPlayerTemplate(): string {
			return `
        <div id="player" class="player-root">
          <div style="background-color: rgb(255, 255, 255);" class="player-wrapper">
            <div id="speechify-btn-inline-play" style="display: ${this.isLoading ? "none" : "block"};">
              ${this.playIcon}
            </div>
            <div id="loading" style="display: ${this.isLoading ? "block" : "none"}; text-align: center;">
              ${this.loadingIcon}
            </div>
            <div class="player-info">
              <div class="player-title">Listen with <div style="display: inline-block; text-decoration: underline; cursor: pointer;" onclick="window.open('https://speechify.com', '_blank');">Speechify</div></div>
              <div class="player-controls-container">
                <div class="player-controls">
                  <div style="color: var(--color-glass-500);" class="time-display" id="current-progress">0:00</div>
                  <div class="progress-bar-container">
                    <div class="progress-bar-track">
                      <div style="width: calc(0% - 5px); background-color: rgb(20, 82, 225);" class="progress-bar-fill"></div>
                      <div style="left: calc(0% - 5px); background-color: rgb(20, 82, 225);" class="progress-bar-handle"></div>
                    </div>
                    <div class="progress-bar-input"></div>
                  </div>
                  <div style="color: var(--color-glass-500);" class="time-display" id="total-duration">0:00</div>
                </div>
              </div>
            </div>
            <div style="cursor: pointer;" onclick="window.open('https://speechify.com/text-to-speech-api', '_blank');">
              <svg width="34" height="19" viewBox="0 0 34 19" xmlns="http://www.w3.org/2000/svg" fill="currentColor" style="color: rgb(20, 82, 225);" class="speechify-logo">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M7.13085 6.43475L7.97166 5.34716C8.35281 4.85414 8.97964 4.6224 9.58737 4.74983C10.0579 4.84849 10.3599 5.31228 10.2618 5.78572C10.2537 5.8249 10.2429 5.86348 10.2296 5.90119C9.53109 7.87216 9.30873 9.17396 9.5625 9.80659C10.6072 8.55759 15.9444 0.413118 17.6313 0.0265105C18.1945 -0.102562 18.755 0.252173 18.8833 0.818834C18.9267 1.01055 18.9159 1.21067 18.852 1.3965C17.2581 6.03365 16.5832 8.8376 16.8275 9.80836C17.6693 8.61652 18.9197 7.01242 20.5787 4.99605C21.2018 4.23866 22.1959 3.89924 23.1485 4.11866C23.9861 4.31161 24.5097 5.15124 24.3179 5.99404C24.3166 5.99958 24.3154 6.00511 24.3141 6.01064C23.7368 8.42634 23.5228 9.83969 23.6722 10.2507C23.738 10.2002 23.8048 10.1485 23.8728 10.0954C24.6337 9.50119 25.5864 9.21161 26.547 9.28254L34 9.83284L29.0621 10.3978C27.6835 10.5555 26.421 11.2496 25.5442 12.3316L24.3626 13.7898C23.9757 14.2672 23.3813 14.5242 22.7708 14.478C22.1644 14.432 21.663 13.9844 21.5455 13.384C21.2568 11.9092 21.2106 10.1684 21.4069 8.16161C19.9241 10.3907 18.6376 13.5967 17.5473 17.7793C17.3599 18.4985 16.7139 19 15.975 19C15.2693 19 14.6913 18.436 14.6696 17.7263L14.3429 7.03113L11.1828 13.2973C10.8539 13.9494 10.1302 14.2974 9.41932 14.1453C8.6662 13.9841 8.04316 13.4545 7.75942 12.7343L7.40531 11.8354C6.90425 10.5636 5.77337 9.65224 4.43045 9.438C2.95363 9.2024 1.47681 8.96681 0 8.73121L3.28955 8.4971C4.80287 8.3894 6.19938 7.63963 7.13085 6.43475Z"></path>
              </svg>
            </div>
          </div>
        </div>
      `;
		}

		private getElement<T extends HTMLElement>(selector: string): T {
			const element = this.shadowRoot!.querySelector<T>(selector);
			if (!element) {
				throw new Error(`Element with selector "${selector}" not found.`);
			}
			return element;
		}

		private createVideoElement(): HTMLVideoElement {
			const videoElement = document.createElement("video");
			videoElement.controls = true;
			videoElement.style.width = "100%";
			videoElement.style.height = "auto";
			videoElement.style.display = "none";
			return videoElement;
		}

		private addEventListeners() {
			this.videoElement.addEventListener(
				"timeupdate",
				this.updateProgressBar.bind(this),
			);
			this.videoElement.addEventListener("ended", this.onVideoEnd.bind(this));
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
			const currentTime = this.videoElement.currentTime;
			const duration = this.videoElement.duration;
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

			this.videoElement.currentTime = percentage * this.videoDuration;
		}

		private onProgressBarMouseDown(event: MouseEvent) {
			const progressContainer = this.getElement<HTMLDivElement>(
				".progress-bar-container",
			);
			const onMouseMove = (moveEvent: MouseEvent) => {
				const rect = progressContainer.getBoundingClientRect();
				const offsetX = moveEvent.clientX - rect.left;
				const totalWidth = rect.width;
				const percentage = Math.min(Math.max(offsetX / totalWidth, 0), 1);

				this.videoElement.currentTime = percentage * this.videoDuration;
			};

			const onMouseUp = () => {
				document.removeEventListener("mousemove", onMouseMove);
				document.removeEventListener("mouseup", onMouseUp);
			};

			document.addEventListener("mousemove", onMouseMove);
			document.addEventListener("mouseup", onMouseUp);
		}

		private onVideoEnd() {
			this.isPlaying = false;
			this.updatePlayButtonIcon();
		}

		private async generateAudio(voiceId: string) {
			const audio = await audioGenerate({ input: this.content, voiceId });
			const audioBlob = audio.audioData;
			const audioUrl = URL.createObjectURL(audioBlob);
			this.videoElement.src = audioUrl;

			this.videoElement.onloadedmetadata = () => {
				this.videoDuration = this.videoElement.duration;
				this.getElement<HTMLDivElement>("#total-duration").innerHTML =
					this.formatTime(this.videoDuration);
				this.isLoading = false;
				this.toggleLoadingSpinner(false);
			};
		}

		private async generateAudioStream(voiceId: string) {
			const response = await audioStream({ input: this.content, voiceId });
			const mediaSource = new MediaSource();
			const audioUrl = URL.createObjectURL(mediaSource);
			this.videoElement.src = audioUrl;
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
				sourceBuffer.onupdateend = (ev: Event) => {
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
			const metaVideoElement = document.createElement("video");
			metaVideoElement.style.display = "none";
			metaVideoElement.src = audioUrl;

			metaVideoElement.onloadedmetadata = () => {
				this.videoDuration = metaVideoElement.duration;
				this.getElement<HTMLDivElement>("#total-duration").innerHTML =
					this.formatTime(this.videoDuration);
			};

			this.videoElement.currentTime = this.videoElement.currentTime;
			void this.videoElement.play();
		}

		private formatTime(seconds: number): string {
			const minutes = Math.floor(seconds / 60);
			const secs = Math.floor(seconds % 60);
			return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
		}

		connectedCallback() {
			this.playButton.addEventListener(
				"click",
				this.togglePlayPause.bind(this),
			);
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
				await this.videoElement.play();
			} else {
				this.videoElement.pause();
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
				this.videoElement.src = newValue;
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
		customElements.define(`speechify-player`, VideoPlayer);
	}
};
