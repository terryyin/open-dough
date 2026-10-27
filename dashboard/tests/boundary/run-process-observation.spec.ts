// The public run-process observation keeps a complete large listing, isolates
// ownership, and refuses a failed observation instead of claiming none remain.
import { randomUUID } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import {
  endGroup,
  processAlive,
  spawnGroupLeader,
} from "../support/processGroup.ts";
import {
  endRunProcesses,
  processesOfRun,
  runIdVariable,
} from "../support/runProcesses.ts";

function observationFixture() {
  const directory = mkdtempSync(
    path.join(tmpdir(), "run-process-observation-"),
  );
  const formerPath = process.env["PATH"];
  const formerTmp = process.env["TMPDIR"];
  const formerPlatform = Object.getOwnPropertyDescriptor(process, "platform");
  if (formerPlatform?.configurable !== true)
    throw new Error("The process platform boundary cannot be configured.");
  const callsFile = path.join(directory, "ps-calls");
  const install = (source: string) => {
    const noting = `require("node:fs").appendFileSync(${JSON.stringify(callsFile)}, JSON.stringify(process.argv.slice(2)) + "\\n");`;
    writeFileSync(
      path.join(directory, "ps"),
      `#!${process.execPath}\n${noting}\n${source}`,
      { mode: 0o700 },
    );
    // Exercise aggregate ps discovery on every CI host; Linux otherwise
    // discovers owners directly through /proc instead of this CLI boundary.
    Object.defineProperty(process, "platform", {
      ...formerPlatform,
      value: "darwin",
    });
    process.env["PATH"] = directory;
    process.env["TMPDIR"] = directory;
  };
  const restore = () => {
    Object.defineProperty(process, "platform", formerPlatform);
    if (formerPath === undefined) delete process.env["PATH"];
    else process.env["PATH"] = formerPath;
    if (formerTmp === undefined) delete process.env["TMPDIR"];
    else process.env["TMPDIR"] = formerTmp;
  };
  return {
    install,
    restore,
    calls: () =>
      readFileSync(callsFile, "utf8")
        .trim()
        .split("\n")
        .map((line) => JSON.parse(line) as string[]),
    expectRemoved: () => {
      expect(readdirSync(directory).sort()).toEqual(["ps", "ps-calls"]);
    },
    remove: () => {
      restore();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

const heldProcess = (runId: string) =>
  spawnGroupLeader(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    env: { ...process.env, [runIdVariable]: runId },
  });

test("a listing beyond the default pipe buffer still finds and ends only its own process, removing its observation files", async () => {
  const runId = randomUUID();
  const owned = heldProcess(runId);
  const otherRunId = randomUUID();
  const other = heldProcess(otherRunId);
  const fixture = observationFixture();
  try {
    const listing = [
      // More than spawnSync's default one-MiB pipe, before the owned PID.
      `1 filler ${"x".repeat(1_200_000)}`,
      `${String(owned.pid)} owned ${runIdVariable}=${runId}`,
      `${String(other.pid)} other ${runIdVariable}=${otherRunId}`,
    ].join("\n");
    fixture.install(`
const args = process.argv.slice(2);
if (args.includes("-axwwE")) process.stdout.write(${JSON.stringify(listing)});
else if (args.includes("stat=")) process.stdout.write("S\\n");
else if (args.includes("etime=")) process.stdout.write("00:01\\n");
else process.stdout.write("owned fixture process\\n");
`);
    expect(processesOfRun(runId)).toEqual([
      {
        pid: owned.pid,
        command: "owned fixture process",
        age: "00:01",
      },
    ]);
    expect(fixture.calls()[0]).toEqual(["-axwwE", "-o", "pid=,command="]);
    expect(processesOfRun(otherRunId).map(({ pid }) => pid)).toEqual([
      other.pid,
    ]);
    fixture.expectRemoved();
    expect(
      (await endRunProcesses(runId, { settleMs: 0 })).map(({ pid }) => pid),
    ).toEqual([owned.pid]);
    expect(processAlive(owned.pid)).toBe(false);
    expect(processAlive(other.pid)).toBe(true);
    expect(processesOfRun(runId)).toEqual([]);
    fixture.expectRemoved();
  } finally {
    fixture.restore();
    await endGroup(owned);
    await endGroup(other);
    fixture.remove();
  }
});

test("a failed process observation fails visibly and removes private resources without exposing its output", () => {
  const fixture = observationFixture();
  try {
    fixture.install(
      'process.stdout.write("private environment text"); process.exit(23);',
    );
    let failure: unknown;
    try {
      processesOfRun(randomUUID());
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(Error);
    expect((failure as Error).message).toBe(
      "Could not observe dashboard run processes: ps failed (23).",
    );
    expect(fixture.calls()).toEqual([["-axwwE", "-o", "pid=,command="]]);
    fixture.expectRemoved();
  } finally {
    fixture.remove();
  }
});
