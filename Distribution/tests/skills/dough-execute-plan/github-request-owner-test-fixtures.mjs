import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { connect } from "node:net";
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
      let text;
      try {
        text = readFileSync(file, "utf8");
      } catch (error) {
        // Replacement may withdraw a record from the directory snapshot.
        if (error.code === "ENOENT") continue;
        throw error;
      }
      records.push({
        ...JSON.parse(text),
        directory,
        file,
      });
    }
  }
  return records;
}

// Says `messages` to the owner at `path` and answers what it said back once
// it said `replies` lines or closed the connection.
export function saidToOwner(path, messages, replies = Infinity) {
  return new Promise((resolve, reject) => {
    const socket = connect(path);
    let heard = "";
    const lines = () => heard.split("\n").filter(Boolean);
    const done = (closed) => {
      socket.destroy();
      resolve({ closed, lines: lines().map((line) => JSON.parse(line)) });
    };
    socket.on("error", reject);
    socket.on("close", () => done(true));
    socket.on("data", (chunk) => {
      heard += chunk;
      if (lines().length >= replies && heard.endsWith("\n")) done(false);
    });
    socket.on("connect", () => {
      for (const message of messages)
        socket.write(`${JSON.stringify(message)}\n`);
    });
  });
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
// An owner still starting when its consumer ended writes its record only
// then, so it is withdrawn in turn until nothing is left under `root`.
export async function endRequestOwners(root) {
  const deadline = Date.now() + 10_000;
  for (;;) {
    for (const { pid } of withdrawRequestOwners(root)) {
      while (!processGone(pid)) {
        if (Date.now() > deadline)
          throw new Error(`GitHub request owner ${pid} did not end`);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
    try {
      rmSync(root, { recursive: true, force: true });
      return;
    } catch (error) {
      if (error.code !== "ENOTEMPTY" || Date.now() > deadline) throw error;
    }
  }
}

// The environment that points a process at the request owner endpoint under
// `root`, whose owner ends 100 ms after its last consumer leaves.
export function requestOwnerEnvironmentAt(root) {
  return {
    DOUGH_GITHUB_REQUEST_OWNER_ROOT: root,
    DOUGH_GITHUB_REQUEST_OWNER_IDLE_MS: "100",
  };
}

// A request owner root under `parent` that admits no owner: lying too deep
// for any socket path, it is refused to every consumer pointed at it, which
// makes it first (`./github-request-owner-endpoint.mjs`). A suite gives it to
// every process it starts, so a test that asks GitHub through no owner of its
// own is answered by none, another test's or this machine's real one
// included, and the suite finds the root standing.
export function ownerlessRequestRoot(parent) {
  return join(
    parent,
    "asked-github-without-a-private-request-owner-root".padEnd(110, "-"),
  );
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

function runningCommand(pid) {
  try {
    return execFileSync("ps", ["-ww", "-p", String(pid), "-o", "command="], {
      encoding: "utf8",
    });
  } catch {
    return "";
  }
}

// Kills the owner standing under `root` outright, as nothing it could
// prepare for does, and answers its record.
export function killStandingOwner(root) {
  const [owner, ...others] = ownerRecords(root);
  if (owner === undefined || others.length > 0)
    throw new Error("Not one request owner stands to be killed");
  process.kill(owner.pid, "SIGKILL");
  return owner;
}

// Kills, once the test is over, each call still running as the instrumented
// `gh` of `github` (`./ci-github-test-fixtures.mjs`): one whose owner was
// killed outlives it. Only a process still running that very `gh` is
// signalled.
export function endCallsLeftRunning(github) {
  const gh = join(github.env.CI_GH_FIXTURE, "gh");
  github.teardown.defer(() => {
    for (const pid of new Set(github.calls().map((call) => call.pid)))
      if (runningCommand(pid).includes(`${gh} `)) process.kill(pid, "SIGKILL");
  });
}
