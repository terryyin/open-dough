// Which accepting Cursor runner new work may use: the build-proof decision
// in runnerCurrentProof.ts, called directly with typed protocol answers and
// recorded addresses, and two real runner homes around it. Start-if-absent
// accepts any accepting address and changes nothing; new work then leaves
// an unrelated listener that never answers the protocol in place, and
// replaces an answering runner whose recorded proof is stale before its
// first launch. Replacement races and the build identity itself are
// ./cursor-runner-build-proof.spec.ts. Cases run in order: the fixture sets
// HOME and PATH for the runner client.
import http from "node:http";
import { rmSync } from "node:fs";
import { expect, test } from "vitest";
import { computeRunnerBuildId } from "../../server/hosts/cursor/runnerBuild.ts";
import { ensureCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { runnerBuildProofDecision } from "../../server/hosts/cursor/runnerCurrentProof.ts";
import {
  cursorRunnerAddressFile,
  readCursorRunnerAddress,
  type CursorRunnerAddress,
} from "../../server/hosts/cursor/runnerPaths.ts";
import {
  createChatOnRunner,
  keepWorkingClient,
  startRunnerProofFixture,
} from "../../test-support/support/cursorRunnerProof.ts";
import {
  tamperRecordedProof,
  writeRunnerAddress,
} from "../../test-support/support/cursorRunnerRecordedAddress.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";

const current = "build-current";
const recordedCurrent = { port: 4100, pid: 4200, buildId: current };

test("a probe without a protocol answer leaves the listener alone whatever was recorded", () => {
  expect(
    runnerBuildProofDecision(current, { answered: false }, recordedCurrent)
      .kind,
  ).toBe("leave-alone");
});

test("an answering runner with a different or absent build is replaced", () => {
  const answer = (buildId: string | undefined) => ({
    answered: true as const,
    buildId,
    spawnHelper: undefined,
  });
  const kind = (
    reported: string | undefined,
    recorded: CursorRunnerAddress | undefined,
  ) => runnerBuildProofDecision(current, answer(reported), recorded).kind;
  expect(kind("build-old", recordedCurrent)).toBe("replace");
  expect(kind(undefined, recordedCurrent)).toBe("replace");
  expect(kind(current, { ...recordedCurrent, buildId: undefined })).toBe(
    "replace",
  );
  expect(kind(current, { ...recordedCurrent, buildId: "build-old" })).toBe(
    "replace",
  );
  expect(kind(current, undefined)).toBe("replace");
});

test("matching answered and recorded build proof goes on to the helper check with the reported helper", () => {
  expect(
    runnerBuildProofDecision(
      current,
      { answered: true, buildId: current, spawnHelper: "/wire/spawn-helper" },
      recordedCurrent,
    ),
  ).toMatchObject({
    kind: "check-helper",
    reportedHelper: "/wire/spawn-helper",
  });
});

test("an unrelated process reusing the recorded pid and port proves no current build: new work starts no agent and leaves it alone", async () => {
  const fixture = startRunnerProofFixture();
  // This test process itself is the unrelated process: it accepts on
  // the recorded port and its own alive pid is recorded, so the
  // start-if-absent acceptance checks (pid alive + port accepting) pass
  // — but it answers no runner protocol, let alone a current build.
  const unrelated = http.createServer((req, res) => {
    req.resume();
    res.end("not the Cursor runner");
  });
  try {
    await new Promise<void>((resolve) => {
      unrelated.listen(0, "127.0.0.1", () => {
        resolve();
      });
    });
    const address = unrelated.address();
    if (address === null || typeof address === "string") {
      throw new Error("No unrelated address.");
    }
    writeRunnerAddress(fixture, { port: address.port, pid: process.pid });

    // Start-if-absent sees an accepting address and starts nothing;
    // that alone never makes the unrelated process look current.
    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(process.pid);

    const created = await createChatOnRunner(fixture);
    expect(created).toBeUndefined();
    expect(fixture.cursor.calls()).toEqual([]);
    expect(unrelated.listening).toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(process.pid);
  } finally {
    // restore stops the runner named by the address; clear the address
    // naming this test process before it can be read that way.
    rmSync(cursorRunnerAddressFile(fixture.home), { force: true });
    await new Promise<void>((resolve) => {
      unrelated.close(() => {
        resolve();
      });
    });
    await fixture.restore();
  }
});

test("a runner whose recorded build proof is stale is left by start-if-absent and replaced before the next launch", async () => {
  const fixture = startRunnerProofFixture();
  try {
    await keepWorkingClient(fixture);
    const before = readCursorRunnerAddress(fixture.home);
    const heldPid = fixture.cursor.attaches()[0]?.pid ?? 0;
    tamperRecordedProof(fixture);

    await expect(ensureCursorRunner(fixture.home)).resolves.toBe(true);
    expect(readCursorRunnerAddress(fixture.home)?.pid).toBe(before?.pid);
    expect(processRunning(heldPid)).toBe(true);

    const created = await createChatOnRunner(fixture);
    expect(created).toMatchObject({
      failed: false,
      stdout: `${fixture.cursor.sessionId}\n`,
    });
    await expect
      .poll(() => processRunning(before?.pid), { timeout: 5_000 })
      .toBe(false);
    const replacement = readCursorRunnerAddress(fixture.home);
    expect(replacement?.pid).not.toBe(before?.pid);
    expect(replacement?.buildId).toBe(computeRunnerBuildId());
    expect(processRunning(heldPid)).toBe(false);
  } finally {
    await fixture.restore();
  }
});
