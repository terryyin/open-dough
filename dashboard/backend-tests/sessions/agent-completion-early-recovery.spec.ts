// Hold settlement before its lock acquisition, after real native binding.
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  keptLaunchRecords,
  keptLaunchStore,
  launchStoreFile,
} from "../../tests/support/launchStore.ts";
import { machineHome } from "../../tests/machineLaunchRecords.ts";
import { test, expect } from "../../tests/support/pageTest.ts";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { acceptanceSchema } from "../../src/launchOutcome.ts";
import { accept } from "../../tests/agentLaunchBoundary.ts";
import { keptAttempts, settledOutcome } from "../../tests/acceptedAttempts.ts";
import {
  startOrigin,
  queuedIdentity,
  queuedTitle,
} from "../../tests/support/startOrigin.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
} from "../../tests/support/completionRecovery.ts";
import { fsSyncHook } from "../../tests/support/serverFsHook.ts";

test("deleted early Claude binding cannot be resurrected before attempt settlement", async () => {
  const origin = await startOrigin(queuedReadyRepository().please());
  const hold = path.join(origin.machine, "hold-settlement");
  const reached = path.join(origin.machine, "settlement-held");
  const recordsFile = launchStoreFile(machineHome(origin.machine));
  const holdSettlement = fsSyncHook(
    path.join(origin.machine, "hold-settlement.mjs"),
    "mkdirSync",
    `(directory, ...args) => {
 if (String(directory).endsWith('/launch-attempts.json.lock') && fs.existsSync(${JSON.stringify(hold)}) && fs.existsSync(${JSON.stringify(recordsFile)})) {
  fs.writeFileSync(${JSON.stringify(reached)}, 'held');
  throw Object.assign(new Error("acquisition held by test"), { code: "EEXIST" });
 }
 return original(directory, ...args);
}`,
  );
  const server = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 30000,
    extraEnv: holdSettlement,
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
    // The launch spawns the synthetic `claude`, slower on a loaded machine.
    await expect
      .poll(() => server.claudeLaunchCalls().length, { timeout: 30_000 })
      .toBe(1);
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
    const [record] = keptLaunchRecords(server);
    if (record === undefined || !("session" in record))
      throw new Error("No actual early binding");
    expect(record.completion?.receipt).toBe(receipt.receipt);
    const deleted = await recordOperation(server, "deleteRecord", [
      "open-dough",
      record.session,
    ]);
    expect(deleted.stdout.trim()).toBe("true");
    await expect(
      recordOperation(server, "bindRecord", [
        "open-dough",
        { ...record, completion: undefined, doneAt: undefined },
      ]),
    ).rejects.toThrow("The reporting session was deleted");
    expect(keptLaunchStore(server)["open-dough"]).toHaveLength(0);
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
    expect(keptLaunchStore(server)["open-dough"]).toHaveLength(0);
  } finally {
    rmSync(hold, { force: true });
    await server.close();
    origin.cleanup();
  }
});
