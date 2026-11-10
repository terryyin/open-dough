// The server a test launches -- Vite, directly (./dashboardServer.ts) or
// through the public npm command (./dashboardCommand.ts), or the boundary
// server (../../server/boundaryServer.ts), which reports its address the way
// Vite does: the port it is told to bind, and the address it reports having
// bound.

import path from "node:path";
import { stripVTControlCharacters } from "node:util";
import { startOnChosenPort } from "../../server/chosenPort.mjs";
import {
  endGroup,
  spawnGroupLeader,
  type GroupLeader,
} from "./processGroup.ts";
import { repoRoot } from "./repositoryRoot.ts";
import type { ProjectEnvironment } from "../../server/projectConfiguration.ts";
import { buildDashboardTo } from "./dashboardBuild.ts";

// Which server a test launches: Vite's dev server, Vite's preview of a
// build, or the boundary server.
export type DashboardServerMode = "dev" | "preview" | "boundary";

const viteBin = path.join(repoRoot, "node_modules", ".bin", "vite");
// Vite's dev server through its API, with a private optimizer cache and an
// optional in-place SIGUSR2 restart.
const devServerFixture = path.join(
  repoRoot,
  "dashboard",
  "tests",
  "fixtures",
  "dev-server.mjs",
);
const boundaryServerEntry = path.join(
  repoRoot,
  "dashboard",
  "server",
  "boundaryServer.ts",
);

// Any free port, chosen by Vite itself (`--port 0`), which probes one and then
// binds it, failing with "Port N is already in use" if another listener took
// it in between; or the named `port`, which Vite then fails to start on rather
// than take another.
export function listenArgs(port: number | undefined): string[] {
  return port === undefined
    ? ["--port", "0"]
    : ["--port", String(port), "--strictPort"];
}

// Vite in its own process group, so stopping it can wait for every `gh` it
// launched.
export function spawnVite(args: readonly string[], env: NodeJS.ProcessEnv) {
  return spawnServer(viteBin, args, env);
}

function spawnServer(
  command: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv,
) {
  const child = spawnGroupLeader(command, args, { cwd: repoRoot, env });
  const output: Buffer[] = [];
  const collect = (chunk: Buffer) => {
    output.push(chunk);
  };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  return {
    child,
    output: () => Buffer.concat(output).toString("utf8"),
    stop: () => endGroup(child),
  };
}

type Launch = {
  readonly child: GroupLeader;
  output(): string;
  stop(): Promise<void>;
};

// What a server of `mode` launches as, and the directory a preview serves:
// the boundary entry in its project environment, Vite's dev server (one a
// test restarts in place when `restartable`), or Vite's preview of
// `prebuilt`, else of a build of its own made now in `buildDir`.
export async function serverLaunch(
  options: {
    readonly mode: DashboardServerMode;
    readonly restartable?: boolean | undefined;
    readonly port: number | undefined;
    readonly environment: ProjectEnvironment;
    readonly prebuilt: string | undefined;
    readonly buildDir: string;
    readonly serverBundle: string | undefined;
  },
  env: NodeJS.ProcessEnv,
): Promise<{
  readonly spawn: () => Launch;
  readonly outDir: string | undefined;
}> {
  const listen = listenArgs(options.port);
  const bundle = options.serverBundle;
  if (options.mode === "boundary") {
    // A custom configuration without a run owner uses transformed source.
    const entry =
      bundle === undefined
        ? [
            "--experimental-transform-types",
            "--disable-warning=ExperimentalWarning",
            boundaryServerEntry,
          ]
        : [path.join(bundle, "boundaryServer.mjs")];
    const args = [...entry, ...listen, "--environment", options.environment];
    return {
      spawn: () => spawnServer(process.execPath, args, env),
      outDir: undefined,
    };
  }
  if (options.mode === "dev") {
    // Dev mode compiles on the fly. Its optimizer cache belongs to this
    // server's temporary root, including across an in-place restart.
    return {
      spawn: () =>
        spawnServer(
          process.execPath,
          [
            devServerFixture,
            ...listen,
            "--cache-dir",
            path.join(path.dirname(options.buildDir), "vite-cache"),
            ...(options.restartable === true ? ["--restartable"] : []),
          ],
          env,
        ),
      outDir: undefined,
    };
  }
  const viteArgs =
    bundle === undefined
      ? ["--config", "dashboard/vite.config.mts", ...listen]
      : [
          "--configLoader",
          "native",
          "--config",
          path.join(bundle, "vite.config.mjs"),
          ...listen,
        ];
  const outDir = options.prebuilt ?? options.buildDir;
  if (options.prebuilt === undefined) await buildDashboardTo(outDir);
  return {
    spawn: () => spawnVite(["preview", ...viteArgs, "--outDir", outDir], env),
    outDir,
  };
}

// A launch on `port` with the address it reports. A launch that fails to
// report one is stopped and the start fails with its output, after starting
// again when it only lost a port Vite chose (../../server/chosenPort.mjs).
export async function startOnOwnAddress<L extends Launch>(
  port: number | undefined,
  launch: () => L,
  failure: string,
): Promise<{ launched: L; url: string }> {
  return startOnChosenPort(port, async () => {
    const launched = launch();
    try {
      return {
        launched,
        url: await ownAddress(launched.child, () => launched.output(), 20_000),
      };
    } catch (error) {
      await launched.stop();
      throw new Error(`${failure}:\n${launched.output()}`, { cause: error });
    }
  });
}

// The server reports the address it bound on stdout, as Vite's `Local:`
// line, which the boundary server prints too. Only this server's own report
// counts: if the process exits or stays silent, the start fails with its
// output rather than letting a test run against whatever else answers.
async function ownAddress(
  child: GroupLeader,
  output: () => string,
  deadlineMs: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const settle = (finish: () => void) => {
      clearTimeout(timer);
      child.stdout.off("data", onData);
      child.off("exit", onExit);
      finish();
    };
    const onData = () => {
      const local = /Local:\s+(http:\/\/\S+)/.exec(
        stripVTControlCharacters(output()),
      );
      if (local?.[1] !== undefined) {
        const origin = new URL(local[1]).origin;
        settle(() => {
          resolve(origin);
        });
      }
    };
    const onExit = (code: number | null, signal: string | null) => {
      settle(() => {
        reject(
          new Error(
            `The server exited (${signal ?? `code ${String(code)}`}) before reporting its address`,
          ),
        );
      });
    };
    const timer = setTimeout(() => {
      settle(() => {
        reject(
          new Error(
            `The server did not report its address within ${String(deadlineMs)}ms`,
          ),
        );
      });
    }, deadlineMs);
    child.stdout.on("data", onData);
    child.on("exit", onExit);
  });
}
