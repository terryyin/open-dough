// Focused quiet-Done and incomplete-completion recovery at the reporting
// boundary: Done needs landing + empty completed + readable closure; unacked
// completion stays reporting-only; unfinished never manufactures Done. Full
// retirement journeys remain in agent-completion-quiet.
import { rmSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { test, expect, stored } from "../../tests/support/codexStart.ts";
import { launch } from "../../tests/agentLaunchBoundary.ts";
import {
  queuedIdentity,
  queuedTitle,
} from "../../tests/support/startOrigin.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import {
  keepTrackedClosureEvidence,
  plantTrackedClosureRepository,
  save,
} from "../../tests/support/retainedReport.ts";
import {
  reportingChild,
  recordOperation,
  completionWriteFault,
  completionProxy,
} from "../../tests/support/completionRecovery.ts";
import {
  unacknowledgedCompletion,
  observeCompletionFaults,
} from "../../tests/support/completionRecoveryFaults.ts";
import { observeLaterCompletionIntent } from "../../tests/support/completionRecoveryIntent.ts";

test.use({ serverMode: "boundary" });

test("quiet Done needs landing and readable closure; unacked completion recovers reporting-only; unfinished stays open", async ({
  dashboard,
  origin,
  codexProtocol: native,
}) => {
  if (native === undefined) throw new Error("No native fixture");
  expect(
    (
      await launch(dashboard, {
        source: "open-dough",
        host: "codex",
        workflow: "execution",
        identity: queuedIdentity,
        title: queuedTitle,
      })
    ).status,
  ).toBe(200);
  const record = stored(dashboard.home)[0];
  const context = record?.request.reporting;
  const workspace = record?.start?.workspace;
  if (record === undefined || context === undefined || workspace === undefined)
    throw new Error("No recorded execution reporting context");
  expect(record.doneAt).toBeUndefined();
  expect(record.completion).toBeUndefined();

  const closureRepository = path.join(
    dashboard.home,
    "quiet-closure-repository",
  );
  const { revision } = plantTrackedClosureRepository(closureRepository);
  const closed = keepTrackedClosureEvidence(
    record,
    closureRepository,
    revision,
    workspace,
  );
  const withoutLanding = { ...closed };
  delete withoutLanding.landing;
  save(dashboard.home, [withoutLanding]);
  rmSync(workspace, { recursive: true, force: true });

  // Empty completed without landing cannot manufacture Done for tracked execution.
  const beforeLanding = await reportingChild(
    `${context.command} --outcome completed`,
    origin.machine,
  );
  expect(beforeLanding.ok).toBe(true);
  const beforeReceipt = completionReceiptSchema.parse(
    JSON.parse(beforeLanding.stdout),
  );
  expect(beforeReceipt).toMatchObject({
    outcome: "completed",
    message: "",
    state: "recorded",
  });
  expect(stored(dashboard.home)[0]?.completion?.receipt).toBe(
    beforeReceipt.receipt,
  );
  expect(stored(dashboard.home)[0]?.doneAt).toBeUndefined();

  // Plant landing+closure, then leave an attempted-but-unacked quiet completion.
  save(dashboard.home, [
    {
      ...closed,
      completion: undefined,
      doneAt: undefined,
    },
  ]);
  await dashboard.close();
  const saved = await unacknowledgedCompletion(
    context,
    origin.machine,
    dashboard.home,
    process.env,
  );
  expect(saved.retry).toContain("--retry");
  expect(saved.retry).toContain(saved.pending);

  // Receiver on a fresh port; proxy keeps the launch origin the pending file names.
  const fault = completionWriteFault(origin.machine);
  let restarted = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
    extraEnv: fault.env,
  });
  const proxy = await completionProxy(dashboard.origin, restarted.baseURL);
  try {
    const receipt = await observeCompletionFaults({
      receiver: restarted,
      record: closed,
      cwd: origin.machine,
      env: process.env,
      retry: saved.retry,
      delivery: saved.delivery,
      proxy,
      fault,
    });
    await observeLaterCompletionIntent({
      receiver: restarted,
      native,
      context,
      record: closed,
      cwd: origin.machine,
      env: process.env,
      retry: saved.retry,
      pending: saved.pending,
      receipt,
      proxy,
      restart: async () => {
        const port = Number(new URL(restarted.baseURL).port);
        await restarted.close();
        restarted = await startDashboardServer({
          mode: "boundary",
          machine: origin.machine,
          github: dashboard.github,
          codexProtocol: native,
          port,
        });
      },
    });
    await recordOperation(restarted, "deleteRecord", [
      "open-dough",
      record.session,
    ]);
    const deleted = await reportingChild(saved.retry, origin.machine);
    expect(deleted.ok).toBe(false);
    expect(deleted.stdout).toBe("");
    await expect(
      recordOperation(restarted, "bindRecord", ["open-dough", record]),
    ).rejects.toThrow("The reporting session was deleted");
    expect(stored(restarted.home)).toHaveLength(0);
  } finally {
    await proxy.close();
    await restarted.close();
  }
});
