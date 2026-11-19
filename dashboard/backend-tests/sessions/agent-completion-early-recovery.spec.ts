// Hold settlement before its lock acquisition, after real native binding.
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  keptLaunchRecords,
  keptLaunchStore,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";
import { machineHome } from "../../test-support/machineLaunchRecords.ts";
import { test, expect } from "../../test-support/support/pageTest.ts";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { acceptanceSchema } from "../../src/launchOutcome.ts";
import { accept } from "../../test-support/agentLaunchBoundary.ts";
import {
  keptAttempts,
  settledOutcome,
} from "../../test-support/acceptedAttempts.ts";
import {
  startOrigin,
  queuedIdentity,
  queuedTitle,
} from "../../test-support/support/startOrigin.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";
import {
  reportingChild,
  recordOperation,
} from "../../test-support/support/completionRecovery.ts";
import { fsSyncHook } from "../../test-support/support/serverFsHook.ts";

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
    liveServer: "separate process",
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
      server.claudeLaunches()[0]?.instruction ?? "",
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
