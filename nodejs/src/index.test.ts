import { describe } from "vitest";

import testSuite from "./test-helper.mjs";
import { Speechify } from "./index.js";

describe("SDK > TS", () => testSuite(Speechify));
