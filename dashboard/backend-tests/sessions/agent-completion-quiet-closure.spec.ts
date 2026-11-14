// Focused quiet-Done and incomplete-completion recovery at the reporting
// boundary: Done needs landing + empty completed + readable closure; unacked
// completion stays reporting-only; unfinished never manufactures Done. Full
// retirement journeys remain in agent-completion-quiet.
import { rmSync } from "node:fs";
import path from "node:path";
import { completionReceiptSchema } from "../../src/completionReport.ts";
import { test, expect, stored } from "../../tests/support/codexStart.ts";
import { launch, machineSessions } from "../../tests/agentLaunchBoundary.ts";
import { keptAttempts } from "../../tests/acceptedAttempts.ts";
import { replaceAttempts } from "../../server/launchAttemptStore.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
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
  const request = makeMe.anAcceptedAttempt
    .requesting({
      source: "open-dough",
      host: "codex",
      workflow: "ad-hoc",
      instruction: "Keep this reporting conversation working.",
      policy: { workspace: "isolated", landing: "review" },
    })
    .please().request;
  expect((await launch(dashboard, request)).status).toBe(200);
  const live = stored(dashboard.home)[0];
  const context = live?.request.reporting;
  const established = live?.establishedSession;
  if (
    live?.session.host !== "codex" ||
    live.session.continuation === undefined ||
    context === undefined ||
    established?.role !== "isolated" ||
    live.firstInput?.state !== "confirmed"
  )
    throw new Error("No working private Codex reporting session");
  expect(
    native.calls.filter(({ method }) => method === "turn/start"),
  ).toHaveLength(1);
  expect(await machineSessions(dashboard)).toMatchObject([
    { sessionState: { kind: "available", activity: "working" } },
  ]);
  const workspace = established.workspace;
  const published = (await origin.originGit("rev-parse", "main")).trim();
  const record = makeMe.aLaunchRecord
    .executing({ identity: queuedIdentity, title: queuedTitle })
    .inCodexSession({
      sessionId: live.session.sessionId,
      continuation: live.session.continuation,
    })
    .onStoryBranch({
      workspace,
      branch: established.branch,
      publishedSha: published,
    })
    .reportingThrough(context)
    .withFirstInput(live.firstInput)
    .launchedAt(live.launchedAt)
    .please();
  const previous = keptAttempts(dashboard).find(
    ({ id }) => id === context.reference,
  );
  if (previous === undefined) throw new Error("No accepted native launch");
  const tracked = makeMe.anAcceptedAttempt
    .executing({ identity: queuedIdentity, title: queuedTitle, host: "codex" })
    .withId(context.reference)
    .acceptedAt(previous.acceptedAt)
    .reportingTo(context.origin)
    .published(published)
    .launched(live.session)
    .settledAt(live.launchedAt)
    .please();
  // The real ad hoc start already minted this installed context in its private HOME.
  // Keep that producer's context and native identity while arranging tracked facts.
  const home = process.env["HOME"];
  if (home === dashboard.home)
    throw new Error("Expected a private machine HOME");
  process.env["HOME"] = dashboard.home;
  try {
    await replaceAttempts((kept) => ({
      ...kept,
      "open-dough": (kept["open-dough"] ?? []).map((entry) =>
        entry.id === tracked.id
          ? { ...previous, ...tracked, reporting: context }
          : entry,
      ),
    }));
  } finally {
    if (home === undefined) delete process.env["HOME"];
    else process.env["HOME"] = home;
  }
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
