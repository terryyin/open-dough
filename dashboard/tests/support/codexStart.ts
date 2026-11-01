// Real Git/start/formatter setup; only native Codex transport is substituted.
import { test as base } from "./codexLaunch.ts";
import { launchWaitMs } from "./launchWait.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
export { expect, stored } from "./codexLaunch.ts";
export const test = base.extend<{ origin: StartOrigin }>({
  // Option defaults here, not a module-level test.use, which would reach only
  // the first file a worker loads this module for. A file's test.use still wins.
  projectFolders: ["open-dough"],
  launchTimeoutMs: launchWaitMs,
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
