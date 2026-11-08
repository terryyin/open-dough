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
// Specs that do not prove Cursor operations may select `cursorRunner:
// "stand-in"` (./cursorRunnerStandIn.ts) so ensureCursorRunner finds an
// accepting address without a real runner; that stand-in is owned here and
// never stopped through the real runner path. Caller-owned restart machines
// keep the real runner. Every page journey gets its own server this way
// (../dashboardTest.ts), and the boundary specs (../../backend-tests/) start
// their own, so PATH/env mutation and each fake GitHub's answers never leak
// between tests.

import { installFakeCodex } from "./fakeCodex.ts";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { installFakeClaude } from "./fakeClaude.ts";
import { requestOwnerEnvironmentAt } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { readPid } from "./processGroup.ts";
import { everyRepository, startFakeGitHub } from "./fakeGitHub.ts";
import { defaultBaseCiRevision } from "./baseCiActions.ts";
import { publishes } from "./publishedRepository.ts";
import { dashboardFixtureLifetime } from "./dashboardFixtureLifetime.ts";
import { standInCursorRunner } from "./cursorRunnerStandIn.ts";
import { serverLaunch, startOnOwnAddress } from "./serverAddress.ts";
import {
  configureDevelopmentProjects,
  projectEnvironmentOf,
} from "./projectConfiguration.ts";
import type {
  DashboardServer,
  StartDashboardServerOptions,
} from "./dashboardServerTypes.ts";

// Callers find the run's build, and the modes, where they find the server.
export { builtDashboardDir } from "./dashboardBuild.ts";
export {
  developmentBoundary,
  type DashboardCursorRunner,
  type DashboardServer,
  type DashboardServerMode,
  type StartDashboardServerOptions,
} from "./dashboardServerTypes.ts";

export async function startDashboardServer(
  options: StartDashboardServerOptions,
): Promise<DashboardServer> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-dashboard-"));
  const ownsMachine = options.machine === undefined;
  const cursorRunner = options.cursorRunner ?? "real";
  if (cursorRunner === "stand-in" && !ownsMachine) {
    throw new Error(
      "A Cursor runner stand-in needs a harness-owned machine; caller-owned restart machines keep the real runner.",
    );
  }
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

  const { spawn, outDir } = serverLaunch(
    {
      mode: options.mode,
      restartable: options.restartable,
      port: options.port,
      environment,
      prebuilt: options.prebuilt,
      buildDir: path.join(tempRoot, "dist"),
    },
    env,
  );

  // Install before listening so ensureCursorRunner accepts the stand-in.
  const standIn =
    cursorRunner === "stand-in"
      ? await standInCursorRunner(claude.controls.home)
      : undefined;

  const closeOwned = dashboardFixtureLifetime({
    tempRoot,
    home: claude.controls.home,
    ownsMachine,
    ownedAttaches: claude.ownedAttaches,
    codex: options.codexProtocol === undefined ? codex : undefined,
    gh,
    github: ownsGitHub ? github : undefined,
    standIn,
  });

  const { launched: server, url: baseURL } = await startOnOwnAddress(
    options.port,
    spawn,
    `The ${options.mode} server this test started could not start`,
  ).catch(async (error: unknown) => {
    await closeOwned();
    throw error;
  });

  return {
    baseURL,
    origin: baseURL,
    pid: server.child.pid ?? 0,
    outDir,
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
