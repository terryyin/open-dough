// Dashboard fixtures get a private HOME, fake GitHub, and synthetic hosts.
// Boundary mode can mount in the worker. Live servers run the boundary
// program or Vite. A caller can keep a machine directory across starts.

import { installFakeCodex, type FakeCodex } from "./fakeCodex.ts";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFakeClaude, type FakeClaudeControls } from "./fakeClaude.ts";
import { dashboardServerEnvironment } from "./dashboardServerEnvironment.ts";
import { routeUnroutedGitHubAway } from "./fixtureOriginRoute.ts";
import { fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { readPid } from "./processGroup.ts";
import {
  everyRepository,
  startFakeGitHub,
  type FakeGitHub,
} from "./fakeGitHub.ts";
import { defaultBaseCiRevision } from "./baseCiActions.ts";
import { publishes } from "./publishedRepository.ts";
import { dashboardFixtureLifetime } from "./dashboardFixtureLifetime.ts";
import {
  launchMountedDashboard,
  withMountedDashboard,
} from "./mountedDashboardServer.ts";
import { standInCursorRunner } from "./cursorRunnerStandIn.ts";
import { testServerPort } from "./testServerPort.ts";
import {
  serverLaunch,
  startOnOwnAddress,
  type DashboardServerMode,
} from "./serverAddress.ts";
import {
  configureDevelopmentProjects,
  projectEnvironmentOf,
} from "./projectConfiguration.ts";
import type { DashboardServerOptions } from "./dashboardServerOptions.ts";
import { sharedServerBundle } from "./serverBundle.ts";
import {
  installServerTimeControls,
  type ServerTimeControls,
} from "./serverTimeControls.ts";

// Callers find the shared-build resolver and the modes beside the server.
export { sharedDashboardBuild } from "./dashboardBuild.ts";
export type { DashboardServerMode };
export type {
  DashboardCursorRunner,
  DashboardServerOptions,
} from "./dashboardServerOptions.ts";

// The boundary server in the development project environment, for a
// boundary spec whose fact belongs to that environment, not to Vite's dev
// server. A page journey starts a dev server only for a fact of the
// development environment; every other one runs under the built preview.
export const developmentBoundary = {
  mode: "boundary",
  environment: "development",
} as const;

export type DashboardServer = {
  readonly baseURL: string;
  readonly origin: string;
  readonly pid: number;
  readonly outDir: string | undefined;
  readonly serverBundle: string | undefined;
  readonly github: FakeGitHub;
  readonly codex: FakeCodex;
  output(): string;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  close(): Promise<void>;
} & ServerTimeControls &
  FakeClaudeControls;

export function startDashboardServer(
  options: DashboardServerOptions,
): Promise<DashboardServer> {
  return options.mode === "boundary" &&
    options.mountBoundary &&
    options.liveServer === undefined
    ? withMountedDashboard(() => start(options, true))
    : start(options, false);
}

async function start(
  options: DashboardServerOptions,
  mounted: boolean,
): Promise<DashboardServer> {
  const previewBuild =
    options.mode === "preview" ? options.prebuilt : undefined;
  const prebuilt =
    typeof previewBuild === "function" ? await previewBuild() : previewBuild;
  const serverBundle =
    mounted || options.mode === "dev" ? undefined : await sharedServerBundle();
  const ownsMachine = options.machine === undefined;
  const cursorRunner = options.cursorRunner ?? "real";
  if (!mounted && cursorRunner === "stand-in" && !ownsMachine) {
    throw new Error(
      "A Cursor runner stand-in needs a harness-owned machine; caller-owned restart machines keep the real runner.",
    );
  }
  const port = options.port ?? (await testServerPort());
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-dashboard-"));
  const ownsGitHub = options.github === undefined;
  const github = options.github ?? (await startFakeGitHub());
  if (ownsGitHub) {
    github.serve(
      everyRepository,
      publishes({ revision: defaultBaseCiRevision }),
    );
  }
  const gh = installFakeGh(tempRoot, { transport: options.ghTransport });
  const ghEnv = fakeGhEnv(gh, github.url);
  const claude = installFakeClaude(
    tempRoot,
    { binDir: gh.binDir, path: ghEnv["PATH"] ?? "" },
    options,
  );
  routeUnroutedGitHubAway(claude.controls.home);
  const environment = projectEnvironmentOf(options.mode, options.environment);
  if (
    environment === "development" &&
    options.configureDevelopmentProjects !== false
  )
    configureDevelopmentProjects(claude.controls.home);
  const codex =
    options.codexProtocol ??
    (await installFakeCodex(
      tempRoot,
      claude.env["PATH"] ?? "",
      options.codex ?? false,
    ));
  const env = dashboardServerEnvironment(
    options,
    ghEnv,
    claude.env,
    codex,
    github.url,
  );
  for (const [key, value] of [
    ["DOUGH_READ_TIMEOUT_MS", options.readTimeoutMs],
    ["DOUGH_LIMIT_BACKOFF_MS", options.limitBackoffMs],
    ["DOUGH_RETAINED_ANSWERS_BYTES", options.retainedAnswersBytes],
  ] as const) {
    if (value !== undefined) env[key] = String(value);
  }
  env["DOUGH_REVISION_CHECK_REUSE_MS"] = String(
    options.revisionCheckReuseMs ?? 0,
  );
  env["DOUGH_REVISION_OBSERVATION_TRACE"] = mounted ? "0" : "1";
  const time = installServerTimeControls(tempRoot, options);
  Object.assign(env, time.env);

  const resources = {
    tempRoot,
    home: claude.controls.home,
    ownsMachine,
    ownedAttaches: claude.ownedAttaches,
    codex: options.codexProtocol === undefined ? codex : undefined,
    gh,
    github: ownsGitHub ? github : undefined,
  };
  // Install before listening so ensureCursorRunner accepts the stand-in.
  const standIn =
    mounted || cursorRunner === "stand-in"
      ? await standInCursorRunner(resources.home).catch(
          async (error: unknown) => {
            await dashboardFixtureLifetime({
              ...resources,
              ownsMachine: false,
              standIn: undefined,
            })();
            throw error;
          },
        )
      : undefined;
  const closeOwned = dashboardFixtureLifetime({ ...resources, standIn });

  const launchLive = async () => {
    const { spawn, outDir } = await serverLaunch(
      {
        mode: options.mode,
        restartable: options.restartable,
        port,
        environment,
        prebuilt,
        buildDir: path.join(tempRoot, "dist"),
        serverBundle,
      },
      env,
    );
    const { launched: server, url: baseURL } = await startOnOwnAddress(
      port,
      spawn,
      `The ${options.mode} server this test started could not start`,
    );
    return {
      baseURL,
      outDir,
      pid: () => server.child.pid ?? 0,
      output: () => server.output(),
      async close() {
        await server.stop();
        await closeOwned();
      },
    };
  };
  const server = mounted
    ? await launchMountedDashboard({ environment, env, port }, closeOwned)
    : await launchLive().catch(async (error: unknown) => {
        await closeOwned();
        throw error;
      });

  const dashboard: DashboardServer = {
    baseURL: server.baseURL,
    origin: server.baseURL,
    get pid() {
      return server.pid();
    },
    outDir: server.outDir,
    serverBundle,
    github,
    codex,
    output: () => server.output(),
    ghCalls() {
      return github.calls.map((call) => [...call.argv]);
    },
    ghPid() {
      return readPid(gh.pidPath);
    },
    ghExitedBy() {
      try {
        return readFileSync(`${gh.pidPath}.exited`, "utf8").trim();
      } catch {
        return undefined;
      }
    },
    ...time.controls,
    ...claude.controls,
    close: () => server.close(),
  };
  // Mounted callers can copy the ordinary controls without reading a PID.
  if (mounted) Object.defineProperty(dashboard, "pid", { enumerable: false });
  return dashboard;
}
