// A reporting launch's kept record, accepted attempt, and quiet submission.
import { vi } from "vitest";
import { reportingReference } from "../../../Distribution/tests/support/launchLandingTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { NativeDoneMarks } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import type { LaunchHost } from "../../server/launchHosts.ts";
import type { ProjectFolder } from "../../server/projectFolders.ts";
import type { CompletionReceipt } from "../../src/completionReport.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { type Checkout, keep } from "./doneCaptureCase.ts";
import { dashboardOrigin } from "./publisherDashboardOrigin.ts";

const reporting = {
  origin: dashboardOrigin,
  reference: reportingReference,
  command: "dashboard-completion",
};

function reportingSession(record: LaunchRecord) {
  return {
    attempt: makeMe.anAcceptedAttempt.reportingFor(record),
    submission: makeMe.aCompletionSubmission.reportingFor({
      host: record.session.host,
      reference: reporting.reference,
    }),
  };
}

export async function aKeptReportingLaunch(checkout: Checkout) {
  const record = makeMe.aLaunchRecord
    .startedOnMainOf(checkout)
    .reportingThrough(reporting)
    .please();
  const { attempt, submission } = reportingSession(record);
  keep(record);
  await keepAttempt(attempt.please());
  return { record, origin: reporting.origin, submission: submission.please() };
}

export async function keepReportedDone(
  launch: ReturnType<typeof makeMe.aLaunchRecord.startedOnMainOf>,
  doneAt: string,
) {
  const delivery = "55555555-5555-4555-8555-555555555555";
  const completion = makeMe.aCompletionReport
    .reportedFor({ reference: reporting.reference, delivery })
    .receivedAt(doneAt)
    .please();
  const record = launch
    .reportingThrough(reporting)
    .completedWith(completion)
    .please();
  const { host, sessionId } = record.session;
  const receipt: CompletionReceipt = {
    ...completion,
    state: "recorded",
    session: { host, sessionId },
  };
  const { attempt, submission } = reportingSession(record);
  keep(record);
  await keepAttempt(attempt.withCompletion(completion, [receipt]).please());
  return { record, receipt, delivery, origin: reporting.origin, submission };
}

export function marksWithRename(
  folder: ProjectFolder,
  rename: NonNullable<LaunchHost["rename"]>,
) {
  return new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: (host) =>
      host === "claude" ? { name: "Claude", rename } : undefined,
    reportingFolder: () => folder,
  });
}
