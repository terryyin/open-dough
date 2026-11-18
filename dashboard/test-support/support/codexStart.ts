// Real Git/start/formatter setup; only native Codex transport is substituted.
import { test as base } from "./codexLaunch.ts";
import { launchWaitMs } from "./launchWait.ts";
import {
  queuedOriginRepository,
  startOrigin,
  type StartOriginFixtures,
} from "./startOrigin.ts";
export { expect, stored } from "./codexLaunch.ts";
export const test = base.extend<StartOriginFixtures>({
  // Option defaults here, not a module-level test.use, which would reach only
  // the first file a worker loads this module for. A file's test.use still wins.
  projectFolders: ["open-dough"],
  launchTimeoutMs: launchWaitMs,
  originRepository: queuedOriginRepository,
  origin: async ({ originRepository }, use) => {
    const origin = await startOrigin(originRepository, { host: "codex" });
    await use(origin);
    origin.cleanup();
  },
  machine: async ({ origin }, use) => {
    await use(origin.machine);
  },
});
