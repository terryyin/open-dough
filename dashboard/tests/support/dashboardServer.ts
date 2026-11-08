// Launches one isolated dashboard server process -- a Vite dev or preview
// server, or in boundary mode the local boundaries alone on a plain HTTP
// server (../../server/boundaryServer.ts), without Vite or a build, in the
// project environment the test names (production unless it asks for
// development) -- with the synthetic `gh` (../fixtures/fake-gh, via ./fakeGh.ts) first on that
// process's PATH, answering from a fake GitHub (./fakeGitHub.ts), and the
// synthetic `claude` (../fixtures/fake-claude, via ./fakeClaude.ts) before
// it, in a temporary HOME holding only the project folders a test chooses.
// A test that restarts a server on the same machine state passes a `machine`
// directory it owns, which holds HOME and the fake `claude`'s state and
// outlives each server, and, to keep an open page's address, the `port` the
// closed server had. The Cursor runner listens from that HOME and is not in
// this server's process group, so closing the server leaves it. When this
// helper owns the machine directory, close stops that runner before the
// directory is removed; a test that owns the directory stops the runner
// itself. A runner still running when the test process exits, because a
// teardown past its timeout never reached close, is stopped then, as is the
// server's own group (./processGroup.ts). A closed server leaves no such stop.
// Every page journey gets its own server this way (../dashboardTest.ts), and the
// boundary specs (../../backend-tests/) start their own, so PATH/env mutation and each
// fake GitHub's answers never leak between tests.

import { installFakeCodex, type FakeCodex } from "./fakeCodex.ts";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFakeClaude, type FakeClaudeControls } from "./fakeClaude.ts";
import { requestOwnerEnvironmentAt } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
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

// Callers find the shared-build resolver and the modes beside the server.
export { sharedDashboardBuild } from "./dashboardBuild.ts";
export type { DashboardServerMode };

// The boundary server in the dev server's environment: what a spec that
// moved off a dev server starts, keeping the environment it observed there
// (../README.md, "Two tiers").
export const developmentBoundary = {
  mode: "boundary",
  environment: "development",
} as const;

export type DashboardServer = {
  readonly baseURL: string;
  readonly origin: string;
  // The server process. Its process group is the one `close` ends.
  readonly pid: number;
  // The directory this preview-mode server serves, so a test can inspect the
  // actual static assets -- for example, to confirm no credential-like
  // marker was ever written into them. `undefined` in dev mode, which serves
  // source on the fly and writes no build, and in boundary mode, no assets.
  readonly outDir: string | undefined;
  readonly serverBundle: string | undefined;
  readonly github: FakeGitHub;
  readonly codex: FakeCodex;
  output(): string;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  // Runs the clock this server measures shared-observation reuse windows by
  // (../../server/observationClock.ts) `ms` further ahead; only on a server
  // started with `observationClock`.
  advanceObservationClock(ms: number): void;
  close(): Promise<void>;
} & FakeClaudeControls;

export async function startDashboardServer(
  options: DashboardServerOptions,
): Promise<DashboardServer> {
  const previewBuild =
    options.mode === "preview" ? options.prebuilt : undefined;
  const prebuilt =
    typeof previewBuild === "function" ? await previewBuild() : previewBuild;
  const serverBundle =
    options.mode === "dev" ? undefined : await sharedServerBundle();
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-dashboard-"));
  const ownsMachine = options.machine === undefined;
  const ownsGitHub = options.github === undefined;
  const github = options.github ?? (await startFakeGitHub());
  if (ownsGitHub) {
    github.serve(
      everyRepository,
      publishes({ revision: defaultBaseCiRevision }),
    );
  }
  const gh = installFakeGh(tempRoot);
  const ghEnv = fakeGhEnv(gh, github.url);
  const claude = installFakeClaude(
    tempRoot,
    { binDir: gh.binDir, path: ghEnv["PATH"] ?? "" },
    options,
  );
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
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...ghEnv,
    ...claude.env,
    ...codex.env,
    PATH: [
      ...(options.pathPrefix ?? []),
      codex.binDir,
      claude.env["PATH"] ?? "",
    ].join(path.delimiter),
    // Avatars are fetched from the same fake GitHub, never GitHub itself.
    DOUGH_AVATAR_ORIGIN: github.url.replace(/\/$/, ""),
    ...(options.requestOwnerRoot === undefined
      ? {}
      : requestOwnerEnvironmentAt(options.requestOwnerRoot)),
    ...options.extraEnv,
  };
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
  const clockAheadFile = options.observationClock
    ? path.join(tempRoot, "observation-clock-ahead")
    : undefined;
  let clockAheadMs = 0;
  if (clockAheadFile !== undefined) {
    writeFileSync(clockAheadFile, "0");
    env["DOUGH_TEST_OBSERVATION_CLOCK_AHEAD_FILE"] = clockAheadFile;
  }

  const closeOwned = dashboardFixtureLifetime({
    tempRoot,
    home: claude.controls.home,
    ownsMachine,
    ownedAttaches: claude.ownedAttaches,
    codex: options.codexProtocol === undefined ? codex : undefined,
    gh,
    github: ownsGitHub ? github : undefined,
  });

  const launch = async () => {
    const { spawn, outDir } = await serverLaunch(
      {
        mode: options.mode,
        restartable: options.restartable,
        port: options.port,
        environment,
        prebuilt,
        buildDir: path.join(tempRoot, "dist"),
        serverBundle,
      },
      env,
    );
    return {
      ...(await startOnOwnAddress(
        options.port,
        spawn,
        `The ${options.mode} server this test started could not start`,
      )),
      outDir,
    };
  };
  const {
    launched: server,
    url: baseURL,
    outDir,
  } = await launch().catch(async (error: unknown) => {
    await closeOwned();
    throw error;
  });

  return {
    baseURL,
    origin: baseURL,
    pid: server.child.pid ?? 0,
    outDir,
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
    advanceObservationClock(ms) {
      if (clockAheadFile === undefined) {
        throw new Error("This server was not started with `observationClock`.");
      }
      clockAheadMs += ms;
      writeFileSync(clockAheadFile, String(clockAheadMs));
    },
    ...claude.controls,
    async close() {
      await server.stop();
      await closeOwned();
    },
  };
}
