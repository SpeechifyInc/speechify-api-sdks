# Speechify API Node.js SDK

This is the official Node.js SDK for the Speechify API.

Read the SDK full reference [here](https://speechifyinc.github.io/speechify-api-sdks/nodejs).

Read the REST API documentation [here](https://docs.sws.speechify.com/docs/overview).

## Installation

```bash
npm install @speechify/api-sdk
```

## Usage

### Server-Side Audio Generation

```typescript
import { Speechify } from "@speechify/api-sdk";

const speechify = new Speechify({
	apiKey: "YOUR_API_KEY",
});

const text = "Hello, world!";
const response = await speechify.audioGenerate({
	input: text,
	voiceId: "george",
	audioFormat: "mp3",
});
const audio = response.audioData;

someStorage.saveFile("audio.mp3", audio);
```

### Server-Side Auth Token Generation

```typescript
import { Speechify } from "@speechify/api-sdk";

const speechify = new Speechify({
	apiKey: "YOUR_API_KEY",
});

webServer.post("/speechify-token", async (req, res) => {
	const user = req.user;
	if (!user) {
		res.status(401).send("Unauthorized");
		return;
	}
	const tokenResponse = await speechify.accessTokenIssue("audio:all");
	res.json(tokenResponse);
});
```

### Client-Side Audio Generation

```typescript
import { Speechify } from "@speechify/api-sdk";

const speechify = new Speechify();

authSystem.on("login", async () => {
	const res = await fetch("/speechify-token", {
		method: "POST",
	});
	const tokenResponse = await res.json();

	speechify.setAccessToken(tokenResponse.accessToken);
});

generateButton.addEventListener("click", async () => {
	const text = "Hello, world!";
	const response = await speechify.audioGenerate({
		input: text,
		voiceId: "george",
		audioFormat: "mp3",
	});
	const audio = response.audioData;

	const audioElement = new Audio();
	audioElement.src = URL.createObjectURL(
		new Blob([audio], { type: "audio/mpeg" }),
	);
	audioElement.play();
});
```

### Client-Side Access Token Auto-Management

You can use the provided `SpeechifyAccessTokenManager` class to have the access token fully managed, including the auto-refresh before it expires.

```typescript
import { Speechify, SpeechifyAccessTokenManager } from "@speechify/api-sdk";

const speechify = new Speechify();

const getToken = async () => {
	const res = await fetch("/speechify-token", {
		method: "POST",
	});
	return res.json();
};

const tokenManager = new SpeechifyAccessTokenManager(speechify, getToken, {
	isAuthenticated: authSystem.isAuthenticated,
});

authSystem.on("login", () => {
	tokenManager.setIsAuthenticated(true);
});

authSystem.on("logout", () => {
	tokenManager.setIsAuthenticated(false);
});
```

With this setup in place, you can use the `speechify` client without worrying about the access token management.

### Speechify Embeddable UI Package

The Speechify Embeddable UI package provides an intuitive player component that lets you add text-to-speech functionality to your web application with minimal setup. By initializing the Speechify client from the API SDK and then calling the player’s setup function, you can embed a customizable <speechify-player> element into your HTML. This player supports both traditional speech generation and real-time streaming, offering flexibility with attributes such as content, voice-id, and generation type.

Here is a complete example of how to integrate the Speechify player into your application:

```typescript
import { initializePlayer } from "@speechify/embeddable-ui";

// call init function with speechify sdk instance
initializePlayer(speechify);
```

```html
<speechify-player
	content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
	voice-id="george"
	generation-type="stream"
/>
```

Please, refer to the [Speechify Embeddable UI package](https://www.npmjs.com/package/@speechify/embeddable-ui) for more information.
