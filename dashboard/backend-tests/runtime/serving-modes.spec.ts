// Dev and preview mount the same local boundaries through
// ../../server/localBoundaryPlugin.ts. Only dev has Vite's HMR socket.

import WebSocket from "ws";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
  type DashboardServerMode,
} from "../../test-support/support/dashboardServer.ts";
import {
  accept,
  launchRequest,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  refusedResponse,
  terminalUrl,
} from "../../test-support/agentTerminalBoundary.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { defaultRepository } from "../../test-support/publishedOriginBasics.ts";
import { publishes } from "../../test-support/support/fakeGitHub.ts";
import {
  expectServedHomesReach,
  routeServedHomesToPublication,
} from "../../test-support/support/fixtureOriginRoute.ts";
import {
  otherProjectEnvironment,
  projectConfigurationFile,
  projectEnvironmentOf,
} from "../../test-support/support/projectConfiguration.ts";
import {
  boundaryAnswerOf,
  rawRequest,
  type BoundaryAnswer,
  type RawResponse,
} from "../../test-support/support/rawHttp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  checkedAt,
  readUrl,
  revisionCheck,
} from "../../test-support/support/sharedReads.ts";
import { describedBacklog } from "../../test-support/describedRevisions.ts";
import {
  liveRunner,
  runnerCommand,
} from "../../test-support/support/cursorRunnerJourney.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { expectSuppliedIcons } from "../../test-support/support/brandIcons.ts";

type ViteMode = Extract<DashboardServerMode, "dev" | "preview">;
const modes = ["dev", "preview"] as const;
// An empty project's backlog.
const backlog = describedBacklog(makeMe.aRepository.please());
const published = publishes({ backlog });
const { revision } = published;

// Both servers start in whichever case first asks for them, within that
// case's time limit, and close after the file's last case. Any case may run
// first, so each allows for the start.
let started: Promise<Record<ViteMode, DashboardServer>> | undefined;
const startAllowance = 30_000;

function servingModes(): Promise<Record<ViteMode, DashboardServer>> {
  started ??= Promise.all(
    modes.map(async (mode) => {
      const server = await startDashboardServer({
        mode,
        projectFolders: ["open-dough"],
        prebuilt: sharedDashboardBuild,
      });
      server.github.serve(defaultRepository, published);
      routeServedHomesToPublication(server.github, defaultRepository);
      return [mode, server] as const;
    }),
  ).then(
    (servers) =>
      Object.fromEntries(servers) as Record<ViteMode, DashboardServer>,
  );
  return started;
}

describe("serving modes mount the same boundaries", () => {
  afterAll(async () => {
    if (started === undefined) return;
    const servers = await started;
    await Promise.all(Object.values(servers).map((server) => server.close()));
  });

  // Sends the same request to each server and returns both answers, the
  // request having seen only its own server.
  async function asked(
    request: (server: DashboardServer) => Promise<RawResponse>,
  ): Promise<{ dev: BoundaryAnswer; preview: BoundaryAnswer }> {
    const servers = await servingModes();
    const [dev, preview] = await Promise.all([
      request(servers.dev),
      request(servers.preview),
    ]);
    return { dev: boundaryAnswerOf(dev), preview: boundaryAnswerOf(preview) };
  }

  test(
    "the launch boundary refuses the same request and lists the same sessions in both",
    async () => {
      const servers = await servingModes();
      const hostCallsBefore = modes.map(
        (mode) => servers[mode].claudeCalls().length,
      );
      const refused = await asked((server) =>
        accept(server, { ...launchRequest, source: "not-a-real-project" }),
      );
      expect(refused.dev.status).toBe(404);
      expect(refused.dev.body).toEqual({
        error: expect.any(String) as unknown,
      });
      expect(refused.preview).toEqual(refused.dev);

      const listed = await asked((server) =>
        rawRequest({
          url: `${server.baseURL}${agentLaunchEndpoint}`,
          headers: { Origin: server.origin },
        }),
      );
      expect(listed.dev.status).toBe(200);
      expect(listed.dev.body).toMatchObject({ records: [] });
      expect(listed.preview).toEqual(listed.dev);
      expect(modes.map((mode) => servers[mode].claudeCalls().length)).toEqual(
        hostCallsBefore,
      );
      const devRunner = await liveRunner(servers.dev.home);
      expect(servers.dev.serverBundle).toBeUndefined();
      expect(runnerCommand(devRunner.pid)).toBe(
        [
          process.execPath,
          "--experimental-transform-types",
          "--no-warnings",
          path.join(repoRoot, "dashboard/server/hosts/cursor/runnerMain.ts"),
        ].join(" "),
      );
      const previewRunner = await liveRunner(servers.preview.home);
      const bundle = servers.preview.serverBundle ?? "";
      expect(path.basename(bundle)).toMatch(/^\.dough-server-bundle-/);
      expect(runnerCommand(servers.preview.pid)).toContain(
        `--configLoader native --config ${path.join(bundle, "vite.config.mjs")}`,
      );
      expect(runnerCommand(previewRunner.pid)).toBe(
        [process.execPath, path.join(bundle, "runnerMain.mjs")].join(" "),
      );
    },
    startAllowance,
  );

  test(
    "the authenticated read boundary answers the same published read and the same refusal in both",
    async () => {
      const servers = await servingModes();
      const read = await asked((server) => {
        expectServedHomesReach(server.github, defaultRepository, revision);
        return checkedAt(server);
      });
      expect(read.dev.status).toBe(200);
      expect(read.dev.body).toMatchObject({ revision });
      expect(read.preview).toEqual(read.dev);
      for (const server of Object.values(servers)) {
        expect(server.ghCalls()[0]).toEqual([
          "api",
          "--include",
          "repos/terryyin/open-dough/git/matching-refs/heads/",
        ]);
      }

      const refused = await asked((server) =>
        rawRequest({
          url: readUrl(server.baseURL, revisionCheck),
          headers: { Origin: "http://evil.example" },
        }),
      );
      expect(refused.dev.status).toBe(403);
      expect(refused.preview).toEqual(refused.dev);
    },
    startAllowance,
  );

  test(
    "the project configuration boundary answers the same list in both, each from its own environment's file",
    async () => {
      const servers = await servingModes();
      const listed = await asked((server) =>
        rawRequest({
          url: `${server.baseURL}/__project-configuration`,
          headers: { "Sec-Fetch-Site": "same-origin" },
        }),
      );
      const ids = (list: unknown) =>
        (list as { id: string }[]).map(({ id }) => id);
      expect(listed.dev.status).toBe(200);
      expect(ids(listed.dev.body)).toEqual([
        "open-dough",
        "doughnut",
        "pygardon",
        "terry-talks",
      ]);
      expect(listed.preview).toEqual(listed.dev);
      for (const mode of modes) {
        const environment = projectEnvironmentOf(mode);
        const own = projectConfigurationFile(servers[mode].home, environment);
        const other = projectConfigurationFile(
          servers[mode].home,
          otherProjectEnvironment(environment),
        );
        expect(ids(JSON.parse(readFileSync(own, "utf8")))).toEqual(
          ids(listed[mode].body),
        );
        expect(existsSync(other)).toBe(false);
      }
    },
    startAllowance,
  );

  test(
    "the terminal upgrade guard refuses the same upgrade in both",
    async () => {
      const servers = await servingModes();
      const [dev, preview] = await Promise.all(
        modes.map((mode) =>
          refusedResponse(
            terminalUrl(servers[mode], "not-a-real-project", undefined),
            { origin: servers[mode].origin },
          ),
        ),
      );
      expect(dev).toMatchObject({ status: 404 });
      expect(preview).toEqual(dev);
    },
    startAllowance,
  );

  test(
    "both serve Open Dough's declared icon exports",
    async () => {
      const servers = await servingModes();
      for (const { baseURL } of Object.values(servers)) {
        await expectSuppliedIcons(baseURL);
      }
    },
    startAllowance,
  );

  test(
    "the upgrade guard leaves Vite's own HMR socket working, which only the dev server has",
    async () => {
      const servers = await servingModes();
      // Without an Origin, Vite's HMR asks for no page token.
      const hmr = new WebSocket(
        servers.dev.baseURL.replace(/^http/, "ws"),
        "vite-hmr",
      );
      try {
        const first = await new Promise<string>((resolve, reject) => {
          hmr.once("message", (data: Buffer) => {
            resolve(data.toString("utf8"));
          });
          hmr.once("error", reject);
        });
        expect(JSON.parse(first)).toMatchObject({ type: "connected" });
      } finally {
        hmr.close();
      }
    },
    startAllowance,
  );
});
