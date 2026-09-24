// Launches one isolated Vite dev or preview server process with the
// synthetic `gh` (../fixtures/fake-gh, via ./fakeGh.ts) first on that
// process's PATH, answering from a fake GitHub (./fakeGitHub.ts). Every page
// journey gets its own server this way (../dashboardTest.ts), and the
// boundary specs start their own, so PATH/env mutation and each fake
// GitHub's answers never leak between tests.

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer, type AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { fakeGhEnv, installFakeGh, readPid } from "./fakeGh";
import { startFakeGitHub, type FakeGitHub } from "./fakeGitHub";

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
  // The directory this preview-mode server serves, so a test can inspect the
  // actual static assets -- for example, to confirm no credential-like
  // marker was ever written into them. `undefined` in dev mode, which serves
  // source on the fly and writes no build output at all.
  readonly outDir: string | undefined;
  readonly github: FakeGitHub;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  close(): Promise<void>;
};

async function freePort(): Promise<number> {
  const probe = createServer();
  await new Promise<void>((resolve) => {
    probe.listen(0, "127.0.0.1", resolve);
  });
  const { port } = probe.address() as AddressInfo;
  await new Promise<void>((resolve) => {
    probe.close(() => {
      resolve();
    });
  });
  return port;
}

async function waitUntilListening(
  baseURL: string,
  deadlineMs: number,
): Promise<void> {
  const start = Date.now();
  let lastError: unknown;
  while (Date.now() - start < deadlineMs) {
    try {
      await fetch(baseURL);
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  throw new Error(
    `Server at ${baseURL} did not answer within ${String(deadlineMs)}ms: ${String(lastError)}`,
  );
}

async function terminate(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }
  await new Promise<void>((resolve) => {
    const onExit = () => {
      resolve();
    };
    child.once("exit", onExit);
    child.kill("SIGTERM");
    setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL");
      }
    }, 5_000);
  });
}

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

export async function startDashboardServer(options: {
  readonly mode: "dev" | "preview";
  // A fixed port, or any free one.
  readonly port?: number;
  readonly readTimeoutMs?: number;
  // The fake GitHub this server's `gh` asks; a fresh one, closed with the
  // server, when omitted.
  readonly github?: FakeGitHub;
  // Preview only: serve this already-built directory instead of building a
  // private copy.
  readonly prebuilt?: string;
  // Extra environment for the spawned Vite process only, merged over the
  // harness's own PATH/fake-`gh` wiring below. A test uses this to place a
  // credential-shaped value somewhere the production code's own subprocess
  // invocation (`../../server/ghRead.ts`, which forwards its whole
  // environment to `gh`) would see it, without touching this process's own
  // real environment.
  readonly extraEnv?: Readonly<Record<string, string>>;
}): Promise<DashboardServer> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-dashboard-"));
  const ownsGitHub = options.github === undefined;
  const github = options.github ?? (await startFakeGitHub());
  const gh = installFakeGh(tempRoot);
  const port = options.port ?? (await freePort());

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    ...fakeGhEnv(gh, github.url),
    ...options.extraEnv,
  };
  if (options.readTimeoutMs !== undefined) {
    env["DOUGH_READ_TIMEOUT_MS"] = String(options.readTimeoutMs);
  }

  let args: string[];
  let outDir: string | undefined;
  if (options.mode === "dev") {
    // Dev mode compiles on the fly; it never reads or writes `dist`.
    args = [
      "--config",
      "dashboard/vite.config.mts",
      "--port",
      String(port),
      "--strictPort",
    ];
  } else {
    outDir = options.prebuilt;
    if (outDir === undefined) {
      outDir = path.join(tempRoot, "dist");
      buildDashboardTo(outDir);
    }
    args = [
      "preview",
      "--config",
      "dashboard/vite.config.mts",
      "--port",
      String(port),
      "--strictPort",
      "--outDir",
      outDir,
    ];
  }

  const child = spawn(viteBin, args, {
    cwd: repoRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const stderr: Buffer[] = [];
  child.stderr.on("data", (chunk: Buffer) => {
    stderr.push(chunk);
  });
  child.stdout.resume();
  const baseURL = `http://127.0.0.1:${String(port)}`;

  const closeOwned = async () => {
    if (ownsGitHub) {
      await github.close();
    }
    rmSync(tempRoot, { recursive: true, force: true });
  };

  try {
    await waitUntilListening(baseURL, 20_000);
  } catch (error) {
    await terminate(child);
    await closeOwned();
    throw new Error(`stderr:\n${Buffer.concat(stderr).toString("utf8")}`, {
      cause: error,
    });
  }

  return {
    baseURL,
    origin: baseURL,
    outDir,
    github,
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
    async close() {
      await terminate(child);
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
