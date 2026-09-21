// Launches one isolated Vite dev or preview server process for the
// private-read-boundary tests, with a synthetic `gh` (../fixtures/fake-gh,
// via ./fakeGh.ts) placed first on that process's PATH. This is a separate
// OS process from this suite's shared webServer (playwright.config.ts, port
// 4188) that the parallel public-origin tests use, so PATH/env mutation and
// the fake `gh`'s shared control/log files never leak into those tests, and
// vice versa. The fixture/control-file concern lives in `./fakeGh.ts`; this
// module is only the process-spawning harness built on top of it.

import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  installFakeGh,
  readGhCalls,
  readPid,
  writeControl,
  type FakeGhControl,
} from "./fakeGh";

// Playwright runs this suite from the repository root (as `npm run
// test:dashboard` and the command above both do); paths are built from that
// rather than from `import.meta.url`, since Playwright's own TypeScript
// transform loads test files as CommonJS, where `import.meta` is unavailable.
const repoRoot = process.cwd();
const viteBin = path.join(repoRoot, "node_modules", ".bin", "vite");

export type PrivateReadServer = {
  readonly baseURL: string;
  readonly origin: string;
  // The isolated directory `vite build` wrote into for this one preview-mode
  // server, so a test can inspect the actual static assets served -- for
  // example, to confirm no credential-like marker was ever written into
  // them. `undefined` in dev mode, which serves source on the fly and writes
  // no build output at all.
  readonly outDir: string | undefined;
  setControl(control: FakeGhControl): void;
  ghCalls(): string[][];
  ghPid(): number | undefined;
  ghExitedBy(): string | undefined;
  close(): Promise<void>;
};

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
      await new Promise((resolve) => setTimeout(resolve, 100));
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

// Builds into `outDir` rather than the default `dashboard/dist`. The shared
// suite webServer (playwright.config.ts) builds and serves that default
// directory for every other spec file for the whole suite run; rebuilding it
// here, concurrently, would truncate or replace assets `vite preview` is
// concurrently serving to those unrelated tests (`fullyParallel: true`).
// Each isolated preview server below gets its own `outDir` instead, so this
// module never touches the shared one.
function buildDashboardTo(outDir: string): void {
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
      `npm run build:dashboard failed for the isolated preview server:\n${result.stdout}\n${result.stderr}`,
    );
  }
}

export async function startPrivateReadServer(options: {
  readonly mode: "dev" | "preview";
  readonly port: number;
  readonly readTimeoutMs?: number;
  // Extra environment for the spawned Vite process only, merged over the
  // harness's own PATH/fake-`gh` wiring below. A test uses this to place a
  // credential-shaped value somewhere the production code's own subprocess
  // invocation (`../../server/ghRead.ts`, which forwards its whole
  // environment to `gh`) would see it, without touching this process's own
  // real environment.
  readonly extraEnv?: Readonly<Record<string, string>>;
}): Promise<PrivateReadServer> {
  const tempRoot = mkdtempSync(path.join(tmpdir(), "dough-private-read-"));
  const gh = installFakeGh(tempRoot);
  writeControl(gh.controlPath, {});

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PATH: `${gh.binDir}${path.delimiter}${process.env["PATH"] ?? ""}`,
    FAKE_GH_LOG: gh.logPath,
    FAKE_GH_CONTROL: gh.controlPath,
    FAKE_GH_PIDFILE: gh.pidPath,
    ...options.extraEnv,
  };
  if (options.readTimeoutMs !== undefined) {
    env["DOUGH_PRIVATE_READ_TIMEOUT_MS"] = String(options.readTimeoutMs);
  }

  let args: string[];
  let outDir: string | undefined;
  if (options.mode === "dev") {
    // Dev mode compiles on the fly; it never reads or writes `dist`, so it
    // needs no isolated `outDir`.
    args = [
      "--config",
      "dashboard/vite.config.mts",
      "--port",
      String(options.port),
      "--strictPort",
    ];
  } else {
    // Isolated per test run: built fresh into this call's own `tempRoot`,
    // never the shared `dashboard/dist` (see `buildDashboardTo` above).
    outDir = path.join(tempRoot, "dist");
    buildDashboardTo(outDir);
    args = [
      "preview",
      "--config",
      "dashboard/vite.config.mts",
      "--port",
      String(options.port),
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
  const baseURL = `http://127.0.0.1:${String(options.port)}`;

  try {
    await waitUntilListening(baseURL, 20_000);
  } catch (error) {
    await terminate(child);
    rmSync(tempRoot, { recursive: true, force: true });
    throw new Error(`stderr:\n${Buffer.concat(stderr).toString("utf8")}`, {
      cause: error,
    });
  }

  return {
    baseURL,
    origin: baseURL,
    outDir,
    setControl(control) {
      writeControl(gh.controlPath, control);
    },
    ghCalls() {
      return readGhCalls(gh.logPath);
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
      rmSync(tempRoot, { recursive: true, force: true });
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
