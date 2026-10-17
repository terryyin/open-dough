// A Continue waiting to select its own record must honor newer attempt facts
// under the machine lock rather than replacing another server's run/result.
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchAttemptRecord } from "../../src/agentLaunch.ts";
import { continueAttempt } from "../agentLaunchBoundary.ts";
import { seedStore, storeFile } from "../machineLaunchRecords.ts";
import { ownRecordContinuation } from "./ownRecordContinuation.ts";
import { expect, test } from "../support/pageTest.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { fsPromisesHook } from "../support/serverFsHook.ts";
import { startOrigin } from "../support/startOrigin.ts";

for (const state of ["running", "settled"] as const)
  test(`Continue preserves the ${state} attempt found after its own-record selection waited`, async () => {
    const origin = await startOrigin();
    const hold = path.join(origin.machine, "hold-attempt-lock");
    const reached = path.join(origin.machine, "attempt-lock-reached");
    const env = fsPromisesHook(
      path.join(origin.machine, "hold-attempt-lock.mjs"),
      "mkdir",
      `async (folder, ...args) => {
      if (String(folder).endsWith('/launch-attempts.json.lock') && fs.existsSync(${JSON.stringify(hold)})) {
        fs.writeFileSync(${JSON.stringify(reached)}, 'reached');
        await heldWhile(${JSON.stringify(hold)}, 25000);
      }
      return original(folder, ...args);
    }`,
    );
    const server = await startDashboardServer({
      mode: "boundary",
      machine: origin.machine,
      projectFolders: ["open-dough"],
      extraEnv: env,
    });
    try {
      const proof = ownRecordContinuation(server, origin, "execution", false);
      writeFileSync(hold, "hold");
      const pending = continueAttempt(server, proof.id);
      await expect.poll(() => existsSync(reached)).toBe(true);
      const file = path.join(
        server.home,
        ".open-dough/dashboard/launch-attempts.json",
      );
      const stored = JSON.parse(readFileSync(file, "utf8")) as Record<
        string,
        LaunchAttemptRecord[]
      >;
      const prior = stored["open-dough"]?.[0];
      if (prior === undefined) throw new Error("Missing attempt precondition.");
      const current =
        state === "running"
          ? {
              ...prior,
              worker: {
                pid: server.pid,
                serverPid: server.pid,
                step: "launch",
                notedAt: new Date().toISOString(),
              },
            }
          : {
              ...prior,
              outcome: {
                kind: "failed",
                reason: "not-listed",
                explanation: "No native session was listed.",
              },
              settledAt: new Date().toISOString(),
            };
      const changed = JSON.stringify({ "open-dough": [current] });
      writeFileSync(file, changed);
      rmSync(hold);
      const answer = JSON.parse((await pending).body) as {
        kind: string;
        reason: string;
        explanation: string;
      };
      expect(answer).toMatchObject(
        state === "running"
          ? {
              kind: "uncertain",
              explanation: expect.stringContaining("already running"),
            }
          : { kind: "failed", reason: "refused" },
      );
      expect(readFileSync(file, "utf8")).toBe(changed);
      await proof.nothingStarted();
    } finally {
      rmSync(hold, { force: true });
      await server.close();
      origin.cleanup();
    }
  });

test("Continue reads an own record again at admission after pre-acceptance", async () => {
  const origin = await startOrigin();
  const hold = path.join(origin.machine, "hold-readmission");
  const reached = path.join(origin.machine, "readmission-reached");
  const count = path.join(origin.machine, "admission-count");
  const env = fsPromisesHook(
    path.join(origin.machine, "hold-readmission.mjs"),
    "mkdir",
    `async (folder, ...args) => {
    if (String(folder).endsWith('/launch-attempts.json.lock') && fs.existsSync(${JSON.stringify(hold)})) {
      const countFile = ${JSON.stringify(count)};
      const number = fs.existsSync(countFile) ? Number(fs.readFileSync(countFile, 'utf8')) + 1 : 1;
      fs.writeFileSync(countFile, String(number));
      if (number === 2) {
        fs.writeFileSync(${JSON.stringify(reached)}, 'reached');
        await heldWhile(${JSON.stringify(hold)}, 25000);
      }
    }
    return original(folder, ...args);
  }`,
  );
  const server = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    extraEnv: env,
  });
  try {
    const proof = ownRecordContinuation(server, origin, "execution", false);
    proof.restoreScript();
    seedStore(origin.machine, JSON.stringify({ "open-dough": [] }));
    writeFileSync(hold, "hold");
    const pending = continueAttempt(server, proof.id);
    await expect.poll(() => existsSync(reached)).toBe(true);
    seedStore(origin.machine, proof.records);
    rmSync(hold);
    const answer = JSON.parse((await pending).body) as {
      kind: string;
      attempt?: import("../../src/agentLaunch.ts").AttemptObservation;
    };
    expect(answer).toMatchObject({
      kind: "accepted",
      attempt: {
        id: proof.id,
        acceptedAt: proof.acceptedAt,
        outcome: proof.outcome,
        running: false,
      },
    });
    proof.settled(answer.attempt);
    await proof.nothingStarted();
  } finally {
    rmSync(hold, { force: true });
    await server.close();
    origin.cleanup();
  }
});

test("Continue with unreadable own records leaves both stores as read and starts nothing", async () => {
  const origin = await startOrigin();
  const server = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
  });
  try {
    const proof = ownRecordContinuation(server, origin, "execution", false);
    const unreadable = "{ unreadable launch records";
    seedStore(origin.machine, unreadable);
    const answer = JSON.parse(
      (await continueAttempt(server, proof.id)).body,
    ) as { kind: string; reason: string };
    expect(answer).toMatchObject({ kind: "failed", reason: "unrecorded" });
    proof.unchanged();
    expect(readFileSync(storeFile(origin.machine), "utf8")).toBe(unreadable);
    await proof.nothingStarted(unreadable);
  } finally {
    await server.close();
    origin.cleanup();
  }
});
