// The repository root, taken from this file's own location so the suite finds
// the repository whichever directory Playwright starts in.

import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));
