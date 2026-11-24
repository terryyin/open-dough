// A quiet completion reported for an isolated ad hoc launch before its native
// session binds answers pending-native-session, and binding then captures and
// keeps the verified manual landing pair for Review changes.
import { expect, onTestFinished, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { bindRecord } from "../../server/launchRecordBinding.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/localFolder.ts";
import { source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

test("an early quiet Done keeps its verified manual pair when the native session binds", async () => {
  const {
    checkout,
    worktrees: { draft: workspace },
    work: { early },
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("draft")
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("early", { at: at(30) }),
      { in: "draft" },
    )
    .kept()
    .please();
  const baseline = checkout.base;
  const record = makeMe.aLaunchRecord
    .adHoc({
      title: "Keep the branch draft",
      instruction: "Keep the branch draft",
    })
    .inIsolatedWorkspace({
      workspace,
      branch: "draft",
      startingRevision: baseline,
      repository: checkout.gitDirectory,
    })
    .inClaudeSession({ sessionId: "isolated-draft" })
    .launchedAt(at(60))
    .reportingThrough(dashboardReporting)
    .please();
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(dashboardReporting.reference)
      .requesting(
        makeMe.aLaunchRequest
          .adHoc({ instruction: "Keep the branch draft" })
          .withPolicy({ workspace: "isolated", landing: "review" })
          .please(),
      )
      .reportingTo(dashboardReporting.origin)
      .capturingLanding({ reporting: dashboardReporting })
      .please(),
  );
  const submission = makeMe.aCompletionSubmission
    .reportingFor({
      host: record.session.host,
      reference: dashboardReporting.reference,
    })
    .please();
  await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");

  const folder = localFolder(checkout.integration);
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: () => undefined,
    reportingFolder: () => folder,
  });
  onTestFinished(() => marks.close());
  const reported = vi.spyOn(marks, "reported");

  vi.setSystemTime(at(10));
  const pending = await deliverCompletion(
    submission,
    dashboardReporting.origin,
    marks,
  );
  expect(pending.state).toBe("pending-native-session");
  expect(reported).not.toHaveBeenCalled();

  const earlyReport = await bindRecord(source, record);
  expect(earlyReport?.receipt).toBe(pending.receipt);

  const kept = await keptSession(source, record.session);
  if (kept === undefined) throw new Error("Missing the kept launch.");
  expect(kept.landing).toMatchObject({ base: baseline, revision: early });
});
