import { describe } from "vitest";

import testSuite from "./test-helper.mjs";
const { Speechify } = require("../lib/cjs/index.js");

describe("SDK > CommonJS", () => testSuite(Speechify));
