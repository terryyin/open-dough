// The dashboard's two Vite servers, the dev server and the preview of the
// build, mount the same local boundaries (../../server/localBoundaries.ts, each
// through ../../server/localBoundaryPlugin.ts's dev and preview hooks), so the
// same request gets the same answer from either. This is the suite's one
// proof of that: every other journey runs under the built preview, and every
// variant of how a boundary answers is a boundary test (this directory;
// ../README.md "Two tiers") against the boundary server, which mounts the same
// list by construction (./boundary-server.spec.ts). Both real
// servers run here on their own machines; one request per boundary is sent
// to each, and the status, headers and body (not timing) are compared. Only
// the dev server has Vite's own HMR socket, so its check runs there alone.

import WebSocket from "ws";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
  type DashboardServerMode,
} from "../support/dashboardServer.ts";
import { accept, launchRequest } from "../agentLaunchBoundary.ts";
import { refusedResponse, terminalUrl } from "../agentTerminalBoundary.ts";
import { agentLaunchEndpoint } from "../../src/agentLaunch.ts";
import { everyRepository, publishes } from "../support/fakeGitHub.ts";
import {
  otherProjectEnvironment,
  projectConfigurationFile,
  projectEnvironmentOf,
} from "../support/projectConfiguration.ts";
import { rawRequest, type RawResponse } from "../support/rawHttp.ts";
import { liveRunner, runnerCommand } from "../support/cursorRunnerJourney.ts";
import { repoRoot } from "../support/repositoryRoot.ts";
import { serverBundleVariable } from "../support/serverBundle.ts";

type ViteMode = Extract<DashboardServerMode, "dev" | "preview">;
const modes = ["dev", "preview"] as const;
const revision = "ab".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";

// The same answer from both servers: status, caching header and the body,
// parsed when it is JSON (it names no machine-specific path) and kept as text
// otherwise, so a server answering a page where the other answers a boundary
// shows that difference.
type Answer = {
  readonly status: number;
  readonly cacheControl: string | string[] | undefined;
  readonly body: unknown;
};

function answerOf(response: RawResponse): Answer {
  let body: unknown = response.body;
  try {
    body = JSON.parse(response.body);
  } catch {
    // Not JSON: compared as the text it is.
  }
  return {
    status: response.status,
    cacheControl: response.headers["cache-control"],
    body,
  };
}

// The answer without the moment it was asked, which each server stamps
// itself; both must stamp it.
function timeless(answer: Answer): Answer {
  const { askedAt, ...body } = answer.body as { askedAt?: unknown };
  expect(typeof askedAt).toBe("string");
  return { ...answer, body };
}

test.describe("serving modes mount the same boundaries", () => {
  test.describe.configure({ mode: "serial" });
  const servers = {} as Record<ViteMode, DashboardServer>;

  test.beforeAll(async () => {
    const started = await Promise.all(
      modes.map(async (mode) => {
        const server = await startDashboardServer({
          mode,
          projectFolders: ["open-dough"],
          prebuilt: builtDashboardDir,
        });
        server.github.serve(everyRepository, publishes({ revision, backlog }));
        return [mode, server] as const;
      }),
    );
    for (const [mode, server] of started) servers[mode] = server;
  });

  test.afterAll(async () => {
    await Promise.all(Object.values(servers).map((server) => server.close()));
  });

  // Sends the same request to each server and returns both answers, the
  // request having seen only its own server.
  async function asked(
    request: (server: DashboardServer) => Promise<RawResponse>,
  ): Promise<{ dev: Answer; preview: Answer }> {
    const [dev, preview] = await Promise.all([
      request(servers.dev),
      request(servers.preview),
    ]);
    return { dev: answerOf(dev), preview: answerOf(preview) };
  }

  test("the launch boundary refuses the same request and lists the same sessions in both", async () => {
    const hostCallsBefore = modes.map(
      (mode) => servers[mode].claudeCalls().length,
    );
    const refused = await asked((server) =>
      accept(server, { ...launchRequest, source: "not-a-real-project" }),
    );
    expect(refused.dev.status).toBe(404);
    expect(refused.dev.body).toEqual({ error: expect.any(String) as unknown });
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
    expect(runnerCommand(devRunner.pid)).toBe(
      [
        process.execPath,
        "--experimental-transform-types",
        "--no-warnings",
        path.join(repoRoot, "dashboard/server/hosts/cursor/runnerMain.ts"),
      ].join(" "),
    );
    const previewRunner = await liveRunner(servers.preview.home);
    expect(runnerCommand(previewRunner.pid)).toBe(
      [
        process.execPath,
        path.join(process.env[serverBundleVariable] ?? "", "runnerMain.mjs"),
      ].join(" "),
    );
  });

  test("the authenticated read boundary answers the same published read and the same refusal in both", async () => {
    const read = await asked((server) =>
      rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=open-dough`,
        headers: { Origin: server.origin },
      }),
    );
    expect(read.dev.status).toBe(200);
    expect(read.dev.body).toMatchObject({ revision });
    expect(timeless(read.preview)).toEqual(timeless(read.dev));
    for (const server of Object.values(servers)) {
      expect(server.ghCalls()[0]).toEqual([
        "api",
        "--include",
        "repos/terryyin/open-dough/commits/main",
        "--jq",
        ".sha",
      ]);
    }

    const refused = await asked((server) =>
      rawRequest({
        url: `${server.baseURL}/__authenticated-read?source=open-dough`,
        headers: { Origin: "http://evil.example" },
      }),
    );
    expect(refused.dev.status).toBe(403);
    expect(refused.preview).toEqual(refused.dev);
  });

  test("the project configuration boundary answers the same list in both, each from its own environment's file", async () => {
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
  });

  test("the terminal upgrade guard refuses the same upgrade in both", async () => {
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
  });

  test("the upgrade guard leaves Vite's own HMR socket working, which only the dev server has", async () => {
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
  });
});
