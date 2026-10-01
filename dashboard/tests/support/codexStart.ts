// Real Git/start/formatter setup; only native Codex transport is substituted.
import { test as base } from "./codexLaunch.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
export { expect, stored } from "./codexLaunch.ts";
export const test = base.extend<{ origin: StartOrigin }>({
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin(
      "terryyin/open-dough",
      "open-dough",
      "codex",
    );
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: 30_000 });
