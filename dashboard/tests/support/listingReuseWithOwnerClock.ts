// Starts the actual GitHub request owner with a fixture-controlled Date
// before the read boundary connects. Node's process timers still run normally.
import { mkdtempSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fixtureTeardown } from "../../../src/skills/dough-execute-plan/scripts/fixture-teardown-test-fixtures.mjs";
import {
  EndpointBinding,
  standingRecord,
} from "../../../src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.mjs";
import { endFakeGh, fakeGhEnv, installFakeGh } from "./fakeGh.ts";
import { startFakeGitHub, type FakeGitHub } from "./fakeGitHub.ts";
import { endGroup, spawnGroupLeader } from "./processGroup.ts";
import { listingReuseServer } from "./sharedReads.ts";
import { waitUntil } from "./waitUntil.ts";

const ownerEntry = fileURLToPath(
  new URL(
    "../../../src/skills/dough-execute-plan/scripts/github-request-owner.mjs",
    import.meta.url,
  ),
);

function ownerClock(folder: string) {
  const instant = path.join(folder, "owner-time");
  const preload = path.join(folder, "owner-clock.mjs");
  let now = Date.now();
  const set = (value: string) => {
    const draft = `${instant}.next`;
    writeFileSync(draft, value);
    renameSync(draft, instant);
  };
  set(String(now));
  writeFileSync(
    preload,
    `import { readFileSync } from 'node:fs';
const OriginalDate = Date;
globalThis.Date = class extends OriginalDate {
  constructor(...args) { super(...(args.length ? args : [Date.now()])); }
  static now() {
    const instant = readFileSync(${JSON.stringify(instant)}, 'utf8');
    return instant === '' ? OriginalDate.now() : Number(instant);
  }
};`,
  );
  return {
    preload,
    now: () => now,
    advance: (milliseconds: number) => {
      now += milliseconds;
      set(String(now));
    },
    restore: () => {
      set("");
    },
  };
}

type Lifetime = ReturnType<typeof fixtureTeardown>;

// Runs `start` in a folder of its own and adds `close`, which ends, last
// first, whatever `start` deferred on its lifetime and removes the folder. A
// start that fails is closed the same way before its error is thrown.
async function closable<T extends object>(
  start: (folder: string, lifetime: Lifetime) => Promise<T>,
) {
  const folder = mkdtempSync(path.join(tmpdir(), "dough-owner-clock-"));
  const lifetime = fixtureTeardown(folder);
  try {
    return {
      ...(await start(folder, lifetime)),
      close: () => lifetime.cleanup(),
    };
  } catch (error) {
    try {
      await lifetime.cleanup();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start the owner clock fixture",
        { cause: cleanupError },
      );
    }
    throw error;
  }
}

// The owner standing at its own endpoint under `folder`, asking `github`
// through its own synthetic `gh`, before any consumer connects.
async function startOwner(
  folder: string,
  lifetime: Lifetime,
  github: FakeGitHub,
) {
  const gh = installFakeGh(folder);
  lifetime.defer(() => endFakeGh(gh));
  const env = { ...process.env, ...fakeGhEnv(gh, github.url) };
  delete env["NODE_OPTIONS"];
  const directory = await new EndpointBinding(env).directory();
  const clock = ownerClock(folder);
  const owner = spawnGroupLeader(
    process.execPath,
    ["--import", clock.preload, ownerEntry, directory, "60000"],
    { cwd: directory, env },
  );
  lifetime.defer(() => endGroup(owner));
  lifetime.defer(clock.restore);
  owner.stdout.resume();
  let stderr = "";
  owner.stderr.on("data", (chunk: Buffer) => {
    stderr += chunk.toString("utf8");
  });
  let spawnError: Error | undefined;
  owner.once("error", (error) => {
    spawnError = error;
  });
  const ownerPid = owner.pid;
  const standingOwnerPid = () => standingRecord(directory)?.pid;
  const standing = () =>
    ownerPid !== undefined && standingOwnerPid() === ownerPid;
  await waitUntil(
    () =>
      standing() ||
      spawnError !== undefined ||
      owner.exitCode !== null ||
      owner.signalCode !== null,
    { timeoutMs: 5_000 },
  );
  if (!standing()) {
    throw new Error(
      `The clock-controlled request owner did not start: ${stderr}`,
      { cause: spawnError },
    );
  }
  return {
    // What points a dashboard server at this owner and its `gh`.
    wiring: { pathPrefix: [gh.binDir], requestOwnerRoot: gh.requestOwnerRoot },
    ownerPid,
    standingOwnerPid,
    // The owner's current time, which stands still until advanced.
    ownerNow: clock.now,
    advanceOwnerClock: clock.advance,
  };
}

// The clock-controlled owner alone, asking `github`: a page journey binds its
// own dashboard to it through `wiring` (./ownerClockTest.ts).
export async function requestOwnerWithClock(github: FakeGitHub) {
  return closable((folder, lifetime) => startOwner(folder, lifetime, github));
}

export async function listingReuseWithOwnerClock(
  startServer: typeof listingReuseServer = listingReuseServer,
) {
  return closable(async (folder, lifetime) => {
    const github = await startFakeGitHub();
    lifetime.defer(() => github.close());
    const owner = await startOwner(folder, lifetime, github);
    const server = await startServer({ github, ...owner.wiring });
    lifetime.defer(() => server.close());
    return {
      server,
      ownerPid: owner.ownerPid,
      standingOwnerPid: owner.standingOwnerPid,
      advanceOwnerClock: owner.advanceOwnerClock,
    };
  });
}
