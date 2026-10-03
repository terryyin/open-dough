// Launches one isolated Vite dev or preview server process with the
// synthetic `gh` (../fixtures/fake-gh, via ./fakeGh.ts) first on that
// process's PATH, answering from a fake GitHub (./fakeGitHub.ts), and the
// synthetic `claude` (../fixtures/fake-claude, via ./fakeClaude.ts) before
// it, in a temporary HOME holding only the project folders a test chooses.
// A test that restarts a server on the same machine state passes a `machine`
// directory it owns, which holds HOME and the fake `claude`'s state and
// outlives each server, and, to keep an open page's address, the `port` the
// closed server had. The Cursor runner listens from that HOME and is not in
// this server's process group, so closing the server leaves it. When this
// helper owns the machine directory, close stops that runner before the
// directory is removed.
// Every page journey gets its own server this way (../dashboardTest.ts), and the
// boundary specs start their own, so PATH/env mutation and each fake
// GitHub's answers never leak between tests.

import { installFakeCodex, type FakeCodex } from "./fakeCodex.ts";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  installFakeClaude,
  type FakeClaudeControls,
  type FakeClaudeOptions,
} from "./fakeClaude.ts";
import { fakeGhEnv, installFakeGh, readPid } from "./fakeGh.ts";
import { startFakeGitHub, type FakeGitHub } from "./fakeGitHub.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { endGroup, spawnGroupLeader } from "./processGroup.ts";
import { listenArgs, ownAddress } from "./viteAddress.ts";
import { configureDevelopmentProjects } from "./projectConfiguration.ts";

// Playwright runs this suite from the repository root (as `npm run
// test:dashboard` does); paths are built from that rather than from
// `import.meta.url`, since Playwright's own TypeScript transform loads test
// files as CommonJS, where `import.meta` is unavailable.
const repoRoot = process.cwd();
const viteBin = path.join(repoRoot, "node_modules", ".bin", "vite");

// Built once per suite run by ./globalSetup.ts; every preview server that is
// not asked to build its own serves it read-only.
export const builtDashboardDir = path.join(repoRoot, "dashboard", "dist");

export type DashboardServer = {
  readonly baseURL: string;
  readonly origin: string;
  // The Vite process. Its process group is the one `close` ends.
  readonly pid: number;
  // The directory this preview-mode server serves, so a test can inspect the
  // actual static assets -- for example, to confirm no credential-like
  // marker was ever written into them. `undefined` in dev mode, which serves
  // source on the fly and writes no build output at all.
  readonly outDir: string | undefined;
  readonly github: FakeGitHub;
  readonly codex: FakeCodex;
  output(): string;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  close(): Promise<void>;
} & FakeClaudeControls;

// Builds into `outDir` rather than the shared `dashboard/dist`, which other
// tests' preview servers may be serving concurrently (`fullyParallel: true`).
export function buildDashboardTo(outDir: string): void {
  const result = spawnSync(
    "npm",
    ["run", "build:dashboard", "--", "--outDir", outDir],
    {
      cwd: repoRoot,
      stdio: "pipe",
      encoding: "utf8",
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `npm run build:dashboard failed:\n${result.stdout}\n${result.stderr}`,
    );
  }
}

export async function startDashboardServer(
  options: FakeClaudeOptions & {
    readonly mode: "dev" | "preview";
    // Existing dev journeys get their known projects; false observes a genuine
    // empty first start. Existing files are always kept, including empty lists.
    readonly configureDevelopmentProjects?: boolean;
    readonly codex?: boolean;
    readonly codexProtocol?: FakeCodex | undefined;
    // The server's own bound when unset.
    readonly readTimeoutMs?: number | undefined;
    // The fake GitHub this server's `gh` asks; a fresh one, closed with the
    // server, when omitted.
    readonly github?: FakeGitHub;
    // Preview only: serve this already-built directory instead of building a
    // private copy.
    readonly prebuilt?: string | undefined;
    // Extra environment for the spawned Vite process only, merged over the
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
  if (options.mode === "dev" && options.configureDevelopmentProjects !== false)
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
    ...options.extraEnv,
  };
  if (options.readTimeoutMs !== undefined) {
    env["DOUGH_READ_TIMEOUT_MS"] = String(options.readTimeoutMs);
  }

  const serverArgs = [
    "--config",
    "dashboard/vite.config.mts",
    ...listenArgs(options.port),
  ];
  let args: string[];
  let outDir: string | undefined;
  if (options.mode === "dev") {
    // Dev mode compiles on the fly; it never reads or writes `dist`.
    args = serverArgs;
  } else {
    outDir = options.prebuilt;
    if (outDir === undefined) {
      outDir = path.join(tempRoot, "dist");
      buildDashboardTo(outDir);
    }
    args = ["preview", ...serverArgs, "--outDir", outDir];
  }

  // Its own process group, so closing can wait for every `gh` it launched.
  const child = spawnGroupLeader(viteBin, args, { cwd: repoRoot, env });
  const output: Buffer[] = [];
  const collect = (chunk: Buffer) => {
    output.push(chunk);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  const outputText = () => Buffer.concat(output).toString("utf8");

  const closeOwned = async () => {
    if (ownsMachine) await stopCursorRunner(claude.controls.home);
    if (options.codexProtocol === undefined) await codex.close();
    if (ownsGitHub) {
      await github.close();
    }
    rmSync(tempRoot, { recursive: true, force: true });
  };

  let baseURL: string;
  try {
    baseURL = await ownAddress(child, outputText, 20_000);
  } catch (error) {
    await endGroup(child);
    await closeOwned();
    throw new Error(
      `The ${options.mode} server this test started could not start:\n${outputText()}`,
      { cause: error },
    );
  }

  return {
    baseURL,
    origin: baseURL,
    pid: child.pid ?? 0,
    outDir,
    github,
    codex,
    output: outputText,
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
      await endGroup(child);
      await closeOwned();
    },
  };
}

export async function waitUntil(
  condition: () => boolean,
  { timeoutMs, intervalMs = 50 }: { timeoutMs: number; intervalMs?: number },
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return condition();
}
