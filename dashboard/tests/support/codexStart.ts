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
// The service's bounded launch wait. A start's answer comes after a real
// Take publication (push, workspace, formatter) and the native exchange, which
// under machine load can take several seconds, so a page waiting on that
// answer waits as long as the start itself may.
export const launchWaitMs = 30_000;
test.use({ projectFolders: ["open-dough"], launchTimeoutMs: launchWaitMs });
