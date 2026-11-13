// Installs the synthetic `gh` (../fixtures/fake-gh) on a temp PATH directory. What that `gh` answers comes from
// the test's own fake GitHub (./fakeGitHub.ts); nothing here launches a Vite
// dev/preview server (./dashboardServer.ts does). Every process given this
// `gh` asks it through a GitHub request owner (github-request-owner.mjs) at
// an endpoint of this installation's own, so no test shares another's owner,
// rate-limit wait or turns, nor this machine's real one.

import "./fakeGhPreload.mjs";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import {
  endRequestOwners,
  privateRequestOwner,
  requestOwnerEnvironmentAt,
  withdrawRequestOwners,
} from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import { endAtExit, endRunningProcesses } from "./processGroup.ts";

export type FakeGhTransport = "cli" | "in-process";

export type FakeGhPaths = {
  transport: FakeGhTransport;
  binDir: string;
  pidPath: string;
  // Kept short and apart from `tempRoot`: it holds the owner's socket path.
  requestOwnerRoot: string;
};

// Exported so a test that wants the plugin's own hooks directly (rather than
// a spawned Vite process) can install the same synthetic `gh`.
export function installFakeGh(
  tempRoot: string,
  { transport = "cli" }: { transport?: FakeGhTransport | undefined } = {},
): FakeGhPaths {
  const binDir = path.join(tempRoot, "bin");
  installFixtureExecutable("fake-gh", binDir, "gh");
  const { root: requestOwnerRoot } = privateRequestOwner();
  // An owner a teardown never reached is ended, and its endpoint removed,
  // when this process exits.
  ownerEndsAtExit.set(
    requestOwnerRoot,
    endAtExit(() => {
      withdrawRequestOwners(requestOwnerRoot);
      rmSync(requestOwnerRoot, { recursive: true, force: true });
    }),
  );
  return {
    binDir,
    pidPath: path.join(tempRoot, "gh.pid"),
    requestOwnerRoot,
    transport,
  };
}

const ownerEndsAtExit = new Map<string, () => void>();

const callRecordName = /^call\.\d+\.\d+\.json$/;

// Pids of `gh` calls still recorded under this installation's owner endpoint.
// The synthetic `gh` pid file is not included: another live dashboard can
// share one request owner whose `gh` wrote that file while serving both.
// An owner keeps a call's record until that `gh` is gone, an ended one still
// exiting included (github-request-calls.mjs), so these name every `gh` an
// owner still runs or left running.
function recordedGhCallPids({ requestOwnerRoot: root }: FakeGhPaths): number[] {
  const pids = new Set<number>();
  if (!existsSync(root)) return [...pids];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(root, entry.name);
    for (const name of readdirSync(directory)) {
      if (!callRecordName.test(name)) continue;
      try {
        const { pid } = JSON.parse(
          readFileSync(path.join(directory, name), "utf8"),
        ) as { pid?: unknown };
        if (typeof pid === "number" && Number.isInteger(pid) && pid > 0) {
          pids.add(pid);
        }
      } catch {
        // Incomplete draft or already withdrawn.
      }
    }
  }
  return [...pids];
}

// Ends every request owner started at this installation's endpoint, waits
// until its process is gone, ends any `gh` that owner left recorded here, and
// removes the endpoint. An owner ends once each `gh` it ran is gone; one that
// ends at its two-second bound instead can leave held `gh` processes running
// outside the dashboard server's process group; end those orphans before the
// fixture removes their temp root. Do not kill a pid-file `gh` that still
// belongs to a shared owner another live dashboard needs.
export async function endFakeGh(gh: FakeGhPaths): Promise<void> {
  const leftover = recordedGhCallPids(gh);
  await endRequestOwners(gh.requestOwnerRoot);
  await endRunningProcesses(leftover);
  ownerEndsAtExit.get(gh.requestOwnerRoot)?.();
  ownerEndsAtExit.delete(gh.requestOwnerRoot);
}

// The environment that puts this synthetic `gh` first on PATH, points it at
// a fake GitHub, and asks it through this installation's own request owner.
// Given no fake GitHub, that `gh` fails every request without asking anyone.
export function fakeGhEnv(
  gh: FakeGhPaths,
  githubUrl?: string,
): Record<string, string> {
  return {
    PATH: `${gh.binDir}${path.delimiter}${process.env["PATH"] ?? ""}`,
    ...(githubUrl === undefined ? {} : { FAKE_GH_ORIGIN: githubUrl }),
    FAKE_GH_PIDFILE: gh.pidPath,
    FAKE_GH_TRANSPORT: gh.transport,
    ...(gh.transport === "in-process"
      ? {
          NODE_OPTIONS: `${process.env["NODE_OPTIONS"] ?? ""} --import=${JSON.stringify(new URL("./fakeGhPreload.mjs", import.meta.url).href)}`,
        }
      : {}),
    ...requestOwnerEnvironmentAt(gh.requestOwnerRoot),
  };
}
