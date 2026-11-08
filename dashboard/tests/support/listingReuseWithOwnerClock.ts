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
import { startFakeGitHub } from "./fakeGitHub.ts";
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
    advance: (milliseconds: number) => {
      now += milliseconds;
      set(String(now));
    },
    restore: () => {
      set("");
    },
  };
}

export async function listingReuseWithOwnerClock() {
  const folder = mkdtempSync(path.join(tmpdir(), "dough-owner-clock-"));
  const lifetime = fixtureTeardown(folder);
  try {
    const github = await startFakeGitHub();
    lifetime.defer(() => github.close());
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
        {
          cause: spawnError,
        },
      );
    }

    const server = await listingReuseServer({
      github,
      pathPrefix: [gh.binDir],
      requestOwnerRoot: gh.requestOwnerRoot,
    });
    lifetime.defer(() => server.close());
    return {
      server,
      ownerPid,
      standingOwnerPid,
      advanceOwnerClock: clock.advance,
      close: () => lifetime.cleanup(),
    };
  } catch (error) {
    try {
      await lifetime.cleanup();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Could not start the listing fixture",
        { cause: cleanupError },
      );
    }
    throw error;
  }
}
