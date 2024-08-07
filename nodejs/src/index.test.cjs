import { describe } from "vitest";

import testSuite from "./test-helper.mjs";
const {
	Speechify,
	SpeechifyAccessTokenManager,
} = require("../lib/cjs/index.js");

describe("SDK > CommonJS", () =>
	testSuite(Speechify, SpeechifyAccessTokenManager));
