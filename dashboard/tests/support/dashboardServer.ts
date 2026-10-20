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
// boundary specs (../boundary/) start their own, so PATH/env mutation and each
// fake GitHub's answers never leak between tests.

import { installFakeCodex, type FakeCodex } from "./fakeCodex.ts";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  installFakeClaude,
  type FakeClaudeControls,
  type FakeClaudeOptions,
} from "./fakeClaude.ts";
import { requestOwnerEnvironmentAt } from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { readPid } from "./processGroup.ts";
import { startFakeGitHub, type FakeGitHub } from "./fakeGitHub.ts";
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
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";

// Callers find the run's build, and the modes, where they find the server.
export { builtDashboardDir } from "./dashboardBuild.ts";
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
  readonly github: FakeGitHub;
  readonly codex: FakeCodex;
  output(): string;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  close(): Promise<void>;
} & FakeClaudeControls;

export async function startDashboardServer(
  options: FakeClaudeOptions & {
    // `boundary` starts the local boundaries alone, on a plain HTTP server,
    // for a spec that never opens a page (../boundary/); `dev` and `preview`
    // start Vite.
    readonly mode: DashboardServerMode;
    // Boundary only: the project environment the server keeps its project
    // list in (./projectConfiguration.ts); production when unset. Dev is
    // always development and preview always production.
    readonly environment?: ProjectEnvironment | undefined;
    // A development-environment server gets its known projects, as existing
    // dev journeys expect; false observes a genuine empty first start.
    // Existing files are always kept, including empty lists.
    readonly configureDevelopmentProjects?: boolean;
    readonly codex?: boolean;
    readonly codexProtocol?: FakeCodex | undefined;
    // The server's own bound when unset.
    readonly readTimeoutMs?: number | undefined;
    // The server's first wait after a rate limit that directs none
    // (`github-request-admission.mjs`); one minute when unset.
    readonly limitBackoffMs?: number | undefined;
    // The byte budget of answers retained on this machine
    // (`../../server/retainedAnswers.ts`); 64 MiB when unset.
    readonly retainedAnswersBytes?: number | undefined;
    // The fake GitHub this server's `gh` asks; a fresh one, closed with the
    // server, when omitted.
    readonly github?: FakeGitHub;
    // The request owner endpoint this server asks GitHub through, shared
    // with whatever else the test points there and ended by the test; an
    // endpoint and owner of this server's own, ended with it, when omitted.
    readonly requestOwnerRoot?: string | undefined;
    // Preview only: serve this already-built directory instead of building a
    // private copy.
    readonly prebuilt?: string | undefined;
    // Extra environment for the spawned server process only, merged over the
    // harness's own PATH/fake-`gh` wiring below. A test uses this to place a
    // credential-shaped value somewhere the production code's own subprocess
    // invocation (`../../server/ghRead.ts`, which forwards its whole
    // environment to `gh`) would see it, without touching this process's own
    // real environment.
    readonly extraEnv?: Readonly<Record<string, string>>;
    // Directories placed ahead of the harness binaries on PATH.
    readonly pathPrefix?: readonly string[];
    // This port, which must be free, instead of any free one: a server
    // restarted on a closed one's port answers the page that server opened.
    readonly port?: number | undefined;
  },
): Promise<DashboardServer> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-dashboard-"));
  const ownsMachine = options.machine === undefined;
  const ownsGitHub = options.github === undefined;
  const github = options.github ?? (await startFakeGitHub());
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
  if (options.readTimeoutMs !== undefined) {
    env["DOUGH_READ_TIMEOUT_MS"] = String(options.readTimeoutMs);
  }
  if (options.limitBackoffMs !== undefined) {
    env["DOUGH_LIMIT_BACKOFF_MS"] = String(options.limitBackoffMs);
  }
  if (options.retainedAnswersBytes !== undefined) {
    env["DOUGH_RETAINED_ANSWERS_BYTES"] = String(options.retainedAnswersBytes);
  }

  const { spawn, outDir } = serverLaunch(
    {
      mode: options.mode,
      port: options.port,
      environment,
      prebuilt: options.prebuilt,
      buildDir: path.join(tempRoot, "dist"),
    },
    env,
  );

  const closeOwned = dashboardFixtureLifetime({
    tempRoot,
    home: claude.controls.home,
    ownsMachine,
    ownedAttaches: claude.ownedAttaches,
    codex: options.codexProtocol === undefined ? codex : undefined,
    gh,
    github: ownsGitHub ? github : undefined,
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
    ...claude.controls,
    async close() {
      await server.stop();
      await closeOwned();
    },
  };
}
