// Focused quiet-Done and incomplete-completion recovery at the reporting
// boundary: Done needs landing + empty completed + readable closure; unacked
// completion stays reporting-only; unfinished never manufactures Done. Full
// retirement journeys remain in agent-completion-quiet/recovery.
import { writeFileSync, rmSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { test, expect, stored } from "../support/codexStart.ts";
import { launch } from "../agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "../support/startOrigin.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import {
  keepTrackedClosureEvidence,
  plantTrackedClosureRepository,
  save,
} from "../support/retainedReport.ts";
import {
  reportingChild,
  quote,
  completionProxy,
} from "../support/completionRecovery.ts";
import { unavailableCompletion } from "../support/completionRecoveryFaults.ts";

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
  const saved = await unavailableCompletion(
    context,
    origin.machine,
    dashboard.home,
    process.env,
  );
  expect(saved.retry).toContain("--retry");
  expect(saved.retry).toContain(saved.pending);

  // Receiver on a fresh port; proxy keeps the launch origin the pending file names.
  const restarted = await startDashboardServer({
    mode: "boundary",
    machine: origin.machine,
    github: dashboard.github,
    codexProtocol: native,
  });
  const proxy = await completionProxy(dashboard.origin, restarted.baseURL);
  try {
    // Lost acknowledgment after the receiver persisted: recover the same receipt
    // without a second substantive submission or Git/retirement work.
    proxy.dropNext();
    const lost = await reportingChild(saved.retry, origin.machine);
    expect(lost.ok).toBe(false);
    expect(lost.stdout).toBe("");
    expect(proxy.lost()).toBe(1);
    const durable = stored(restarted.home)[0];
    expect(durable?.completion?.delivery).toBe(saved.delivery);
    expect(durable?.completion?.message).toBe("");
    expect(durable?.doneAt).toBe(durable?.completion?.receivedAt);
    const recovered = await reportingChild(saved.retry, origin.machine);
    expect(recovered.ok).toBe(true);
    const recoveredReceipt = completionReceiptSchema.parse(
      JSON.parse(recovered.stdout),
    );
    expect(recoveredReceipt).toMatchObject(durable?.completion ?? {});
    expect(
      JSON.parse((await reportingChild(saved.retry, origin.machine)).stdout),
    ).toEqual(recoveredReceipt);
    expect(stored(restarted.home)[0]?.doneAt).toBe(durable?.doneAt);

    // Unfinished attention replaces automatic Done and stays unfinished.
    const message = path.join(origin.machine, "held-remaining.txt");
    const text = "Remaining ownership decision is held before release.";
    writeFileSync(message, text);
    const nativeBefore = native.calls.length;
    const unfinished = await reportingChild(
      `${context.command} --outcome unfinished --message-file ${quote(message)}`,
      origin.machine,
    );
    expect(unfinished.ok).toBe(true);
    const unfinishedReceipt = completionReceiptSchema.parse(
      JSON.parse(unfinished.stdout),
    );
    expect(unfinishedReceipt).toMatchObject({
      outcome: "unfinished",
      message: text,
    });
    expect(stored(restarted.home)[0]?.completion?.message).toBe(text);
    expect(stored(restarted.home)[0]?.doneAt).toBeUndefined();
    expect(
      native.calls
        .slice(nativeBefore)
        .filter((call) =>
          ["turn/start", "turn/interrupt", "thread/resume"].includes(
            call.method,
          ),
        ),
    ).toEqual([]);
  } finally {
    await proxy.close();
    await restarted.close();
  }
});
