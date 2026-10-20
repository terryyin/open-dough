// Installs the synthetic `gh` (../fixtures/fake-gh) on a temp PATH directory. What that `gh` answers comes from
// the test's own fake GitHub (./fakeGitHub.ts); nothing here launches a Vite
// dev/preview server (./dashboardServer.ts does). Every process given this
// `gh` asks it through a GitHub request owner (github-request-owner.mjs) at
// an endpoint of this installation's own, so no test shares another's owner,
// rate-limit wait or turns, nor this machine's real one.

import { rmSync } from "node:fs";
import path from "node:path";
import {
  endRequestOwners,
  privateRequestOwner,
  requestOwnerEnvironmentAt,
  withdrawRequestOwners,
} from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs";
import { installFixtureExecutable } from "./fixtureExecutable.ts";
import { endAtExit } from "./processGroup.ts";

export type FakeGhPaths = {
  binDir: string;
  pidPath: string;
  // Kept short and apart from `tempRoot`: it holds the owner's socket path.
  requestOwnerRoot: string;
};

// Exported so a test that wants the plugin's own hooks directly (rather than
// a spawned Vite process) can install the same synthetic `gh`.
export function installFakeGh(tempRoot: string): FakeGhPaths {
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
  return { binDir, pidPath: path.join(tempRoot, "gh.pid"), requestOwnerRoot };
}

const ownerEndsAtExit = new Map<string, () => void>();

// Ends every request owner started at this installation's endpoint, waits
// until its process is gone, and removes the endpoint.
export async function endFakeGh(gh: FakeGhPaths): Promise<void> {
  await endRequestOwners(gh.requestOwnerRoot);
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
    ...requestOwnerEnvironmentAt(gh.requestOwnerRoot),
  };
}
