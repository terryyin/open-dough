// The existing kept-start page journey shares the real installed script,
// bare origin and protocol-only vendor fixture for both hosts.
import {
  fixtureExtraEnv,
  fixtureServerMode,
  test as base,
} from "../dashboardTest.ts";
import { startDashboardServer } from "./dashboardServer.ts";
import { installFakeCodex } from "./fakeCodex.ts";
import { launchWaitMs } from "./launchWait.ts";
import { serveOriginBaseCi } from "./serveOriginBaseCi.ts";
import {
  queuedOriginRepository,
  startOrigin,
  type StartOriginFixtures,
} from "./startOrigin.ts";
export { expect } from "../dashboardTest.ts";
export const test = base.extend<
  StartOriginFixtures & {
    preparationHost: "claude" | "codex";
  }
>({
  preparationHost: ["claude", { option: true }],
  originRepository: queuedOriginRepository,
  origin: async ({ originRepository, preparationHost }, use) => {
    const origin = await startOrigin(originRepository, {
      host: preparationHost,
    });
    await use(origin);
    origin.cleanup();
  },
  codexProtocol: async ({ origin, preparationHost }, use) => {
    const native =
      preparationHost === "codex"
        ? await installFakeCodex(
            origin.machine,
            process.env["PATH"] ?? "",
            true,
          )
        : undefined;
    await use(native);
    await native?.close();
  },
  dashboard: async (
    {
      github,
      origin,
      codexProtocol,
      extraEnv,
      pathPrefix,
      startTimeoutMs,
      serverMode,
    },
    use,
  ) => {
    serveOriginBaseCi(github, origin);
    const server = await startDashboardServer({
      ...fixtureServerMode(serverMode),
      github,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: launchWaitMs,
      codexProtocol,
      ...(pathPrefix === undefined ? {} : { pathPrefix }),
      extraEnv: fixtureExtraEnv(extraEnv, startTimeoutMs),
    });
    await use(server);
    await server.close();
  },
});

// These reading journeys use the queued Claude preview inputs before their
// private origin, without moving any preparation out of suite elapsed.
export const queuedClaudePreviewTest = test.extend({
  originRepository: async (
    { queuedClaudePreviewReady, originRepository },
    use,
  ) => {
    await Promise.resolve(queuedClaudePreviewReady);
    await use(originRepository);
  },
});

// Codex reading journeys need their own queued installation plus the same preview.
export const queuedCodexPreviewTest = test.extend({
  originRepository: async (
    { queuedCodexPreviewReady, originRepository },
    use,
  ) => {
    await Promise.resolve(queuedCodexPreviewReady);
    await use(originRepository);
  },
});
