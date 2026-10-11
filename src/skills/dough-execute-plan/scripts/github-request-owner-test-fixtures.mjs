import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { enterEnvironment } from "./fixture-teardown-test-fixtures.mjs";

// The records of the owners standing or left under an endpoint root, each
// with the endpoint directory holding it.
export function ownerRecords(root) {
  const records = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(root, entry.name);
    for (const name of readdirSync(directory)) {
      if (!/^owner\.\d+\.json$/.test(name)) continue;
      const file = join(directory, name);
      records.push({
        ...JSON.parse(readFileSync(file, "utf8")),
        directory,
        file,
      });
    }
  }
  return records;
}

export function processGone(pid) {
  try {
    process.kill(pid, 0);
    return false;
  } catch {
    return true;
  }
}

// Withdraws the record of every owner under `root`, which ends that owner
// and the `gh` calls it runs; answers the owners withdrawn.
export function withdrawRequestOwners(root) {
  const owners = existsSync(root) ? ownerRecords(root) : [];
  for (const { file } of owners) rmSync(file, { force: true });
  return owners;
}

// Withdraws every owner under `root`, waits until each owner process is
// gone, and removes the endpoint; fails when an owner outlives ten seconds.
export async function endRequestOwners(root) {
  const owners = withdrawRequestOwners(root);
  const deadline = Date.now() + 10_000;
  for (const { pid } of owners) {
    while (!processGone(pid)) {
      if (Date.now() > deadline)
        throw new Error(`GitHub request owner ${pid} did not end`);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
  rmSync(root, { recursive: true, force: true });
}

// The environment that points a process at the request owner endpoint under
// `root`, whose owner ends 100 ms after its last consumer leaves.
export function requestOwnerEnvironmentAt(root) {
  return {
    DOUGH_GITHUB_REQUEST_OWNER_ROOT: root,
    DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS: "100",
  };
}

// A GitHub request owner endpoint of a test's own, kept short for the socket
// path it holds: `env` points a consumer process at it; `end` ends every
// owner there.
export function privateRequestOwner() {
  const root = mkdtempSync(join(tmpdir(), "ghr-"));
  return {
    root,
    env: requestOwnerEnvironmentAt(root),
    records: () => ownerRecords(root),
    end: () => endRequestOwners(root),
  };
}

// Points this test process's own requests at a private owner for one test,
// ended and removed after it.
export function enterPrivateRequestOwner(t) {
  const owner = privateRequestOwner();
  enterEnvironment(t, owner.env);
  t.after(owner.end);
  return owner;
}

// The environment pointing a fixture's processes at a private owner, which
// `teardown` ends after everything the fixture deferred later.
export function requestOwnerEnvironment(teardown) {
  const owner = privateRequestOwner();
  teardown.defer(owner.end);
  return owner.env;
}
