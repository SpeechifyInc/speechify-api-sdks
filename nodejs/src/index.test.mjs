import { describe } from "vitest";

import testSuite from "./test-helper.mjs";
import { Speechify, SpeechifyAccessTokenManager } from "../lib/esm/index.js";

describe("SDK > ESM", () => testSuite(Speechify, SpeechifyAccessTokenManager));
