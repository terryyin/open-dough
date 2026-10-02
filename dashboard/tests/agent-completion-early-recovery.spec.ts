// Hold settlement before its lock acquisition, after real native binding.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../src/completionReport.ts";
import { acceptanceSchema } from "../src/launchOutcome.ts";
import { accept } from "./agentLaunchBoundary.ts";
import { keptAttempts, settledOutcome } from "./acceptedAttempts.ts";
import {
  startOrigin,
  queuedIdentity,
  queuedTitle,
} from "./support/startOrigin.ts";
import {
  startDashboardServer,
  builtDashboardDir,
} from "./support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
} from "./support/completionRecovery.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";

test("deleted early Claude binding cannot be resurrected before attempt settlement", async () => {
  test.setTimeout(120000);
  const origin = await startOrigin();
  const hold = path.join(origin.machine, "hold-settlement");
  const reached = path.join(origin.machine, "settlement-held");
  const loader = path.join(origin.machine, "hold-settlement.mjs");
  const recordsFile = path.join(
    origin.machine,
    "home/.open-dough/dashboard/agent-launches.json",
  );
  writeFileSync(
    loader,
    `import fs from 'node:fs'; import promises from 'node:fs/promises'; import {syncBuiltinESMExports} from 'node:module';
const original = promises.mkdir;
promises.mkdir = async (directory, ...args) => {
 if (String(directory).endsWith('/launch-attempts.json.lock') && fs.existsSync(${JSON.stringify(hold)}) && fs.existsSync(${JSON.stringify(recordsFile)})) {
  fs.writeFileSync(${JSON.stringify(reached)}, 'held');
  const deadline = Date.now() + 15000;
  while(fs.existsSync(${JSON.stringify(hold)}) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve,25));
 }
 return original(directory, ...args);
}; syncBuiltinESMExports();`,
  );
  const server = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30000,
    extraEnv: { NODE_OPTIONS: `--import=${JSON.stringify(loader)}` },
  });
  try {
    server.claudeScenario("held");
    const accepted = acceptanceSchema.parse(
      JSON.parse(
        (
          await accept(server, {
            source: "open-dough",
            host: "claude",
            workflow: "execution",
            identity: queuedIdentity,
            title: queuedTitle,
          })
        ).body,
      ),
    );
    if (accepted.kind !== "accepted") throw new Error("No accepted launch");
    await expect.poll(() => server.claudeLaunchCalls().length).toBe(1);
    const command = /^- reporting command: (.+)$/m.exec(
      server.claudeLaunchCalls()[0]?.argv.at(-1) ?? "",
    )?.[1];
    if (command === undefined) throw new Error("No supplied channel");
    const report = await reportingChild(
      `${command} --outcome completed`,
      origin.machine,
    );
    expect(report.ok).toBe(true);
    const receipt = completionReceiptSchema.parse(JSON.parse(report.stdout));
    expect(receipt.state).toBe("pending-native-session");
    writeFileSync(hold, "hold");
    server.releaseHeldClaude();
    await expect.poll(() => existsSync(reached)).toBe(true);
    expect(
      keptAttempts(server).find((entry) => entry.id === accepted.attempt.id)
        ?.outcome,
    ).toBeUndefined();
    const record = (
      JSON.parse(readFileSync(recordsFile, "utf8")) as Record<
        string,
        LaunchRecord[]
      >
    )["open-dough"]?.[0];
    if (record === undefined) throw new Error("No actual early binding");
    expect(record.completion?.receipt).toBe(receipt.receipt);
    const deleted = await recordOperation(server, "deleteRecord", [
      "open-dough",
      record.session,
    ]);
    expect(deleted.stdout.trim()).toBe("true");
    await expect(
      recordOperation(server, "keepRecord", [
        "open-dough",
        { ...record, completion: undefined, doneAt: undefined },
      ]),
    ).rejects.toThrow("The reporting session was deleted");
    expect(
      (
        JSON.parse(readFileSync(recordsFile, "utf8")) as Record<
          string,
          unknown[]
        >
      )["open-dough"],
    ).toHaveLength(0);
    expect(
      keptAttempts(server).find((entry) => entry.id === accepted.attempt.id)
        ?.reportingDeletedAt,
    ).toBeDefined();
    expect(
      keptAttempts(server).find((entry) => entry.id === accepted.attempt.id)
        ?.outcome,
    ).toBeUndefined();
    rmSync(hold);
    await settledOutcome(server, accepted.attempt.id);
    const late = await reportingChild(
      `${command} --outcome completed`,
      origin.machine,
    );
    expect(late.ok).toBe(false);
    expect(late.stdout).toBe("");
    expect(
      (
        JSON.parse(readFileSync(recordsFile, "utf8")) as Record<
          string,
          unknown[]
        >
      )["open-dough"],
    ).toHaveLength(0);
  } finally {
    rmSync(hold, { force: true });
    await server.close();
    origin.cleanup();
  }
});
