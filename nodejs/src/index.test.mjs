import { describe } from "vitest";

import testSuite from "./test-helper.mjs";
import { Speechify } from "../lib/esm/index.js";

describe("SDK > ESM", () => testSuite(Speechify));
