// The existing kept-start page journey shares the real installed script,
// bare origin and protocol-only vendor fixture for both hosts.
import { fixtureServerMode, test as base } from "../dashboardTest.ts";
import { startDashboardServer } from "./dashboardServer.ts";
import { installFakeCodex } from "./fakeCodex.ts";
import { launchWaitMs } from "./launchWait.ts";
import { startOrigin, type StartOrigin } from "./startOrigin.ts";
export { expect } from "../dashboardTest.ts";
export const test = base.extend<{
  origin: StartOrigin;
  preparationHost: "claude" | "codex";
}>({
  preparationHost: ["claude", { option: true }],
  origin: async ({ preparationHost }, use) => {
    const origin = await startOrigin(
      "terryyin/open-dough",
      "open-dough",
      preparationHost,
    );
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
    { github, origin, codexProtocol, pathPrefix, startTimeoutMs, serverMode },
    use,
  ) => {
    const server = await startDashboardServer({
      ...fixtureServerMode(serverMode),
      github,
      machine: origin.machine,
      projectFolders: ["open-dough"],
      launchTimeoutMs: launchWaitMs,
      codexProtocol,
      ...(pathPrefix === undefined ? {} : { pathPrefix }),
      ...(startTimeoutMs === undefined
        ? {}
        : { extraEnv: { DOUGH_START_TIMEOUT_MS: String(startTimeoutMs) } }),
    });
    await use(server);
    await server.close();
  },
});
