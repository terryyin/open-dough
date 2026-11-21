// A quiet completion received while a manual Done is still capturing an
// earlier branch revision keeps the later revision, pins only the baseline and
// later commit, and runs no native stop when the stale manual mark resumes.
import { expect, onTestFinished, test, vi } from "vitest";
import { reportingReference } from "../../../Distribution/tests/support/launchLandingTestData.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks, type DoneLaunches } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import {
  aCheckoutWithWorktree,
  inWorktree,
  keep,
  minutesAgo,
  source,
  work,
} from "../support/doneCaptureCase.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

test("a newer quiet Done takes precedence over a manual mark still capturing its branch", async () => {
  const { checkout, workspace } = await aCheckoutWithWorktree("draft");
  const baseline = checkout.base;
  const reporting = {
    origin: dashboardOrigin,
    reference: reportingReference,
    command: "dashboard-completion",
  };
  const record = makeMe.aLaunchRecord
    .adHoc({
      title: "Save the latest update",
      instruction: "Save the latest update",
    })
    .inIsolatedWorkspace({
      workspace,
      branch: "draft",
      startingRevision: baseline,
      repository: checkout.gitDirectory,
    })
    .inClaudeSession({ sessionId: "isolated-draft" })
    .launchedAt(minutesAgo(60))
    .reportingThrough(reporting)
    .please();
  keep(record);
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(reporting.reference)
      .requesting(
        makeMe.aLaunchRequest
          .adHoc({ instruction: "Save the latest update" })
          .withPolicy({ workspace: "isolated", landing: "review" })
          .please(),
      )
      .reportingTo(reporting.origin)
      .capturingLanding({ reporting })
      .launched(record.session)
      .please(),
  );
  const submission = makeMe.aCompletionSubmission
    .reportingFor({
      host: record.session.host,
      reference: reporting.reference,
    })
    .please();
  const { earlier } = await work(
    inWorktree(checkout, workspace),
    makeMe.aCheckoutWork.committing("earlier", { at: minutesAgo(40) }),
  );

  const folder = localFolder(checkout.integration);
  const publishedSource = makeMe.aPublishedSource
    .with({
      id: source,
      label: "Open Dough",
      repository: "terryyin/open-dough",
    })
    .please();
  const doneStop = vi.fn(() => Promise.resolve());
  const launches: DoneLaunches = {
    stateOf: () =>
      Promise.resolve(
        makeMe.anObservedLaunch
          .of(record)
          .withSessionState(makeMe.aSessionState.loaded("waiting").please())
          .please(),
      ),
  };
  let release!: () => void;
  let reached!: () => void;
  let heldRevision: string | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const reading = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const marks = new NativeDoneMarks({
    terminals: { withAttachment: vi.fn(), endAttachments: vi.fn() },
    hostFor: (host) =>
      host === "claude" ? { name: "Claude Code", doneStop } : undefined,
    reportingFolder: () => folder,
    capture: async (candidate, doneAt) => {
      const read = await captureBranchResult(candidate, doneAt);
      heldRevision = read.result.revision;
      reached();
      await held;
      return read;
    },
  });
  onTestFinished(async () => {
    release();
    await marks.close();
  });
  const reported = vi.spyOn(marks, "reported");

  vi.setSystemTime(minutesAgo(20));
  const marking = marks.markDone(publishedSource, record, folder, launches);
  let later: string;
  try {
    await reading;
    expect(heldRevision).toBe(earlier);
    ({ later } = await work(
      inWorktree(checkout, workspace),
      makeMe.aCheckoutWork.committing("later", { at: minutesAgo(15) }),
    ));
    vi.setSystemTime(minutesAgo(10));
    await deliverCompletion(submission, reporting.origin, marks);
    await reported.mock.results[0]?.value;
  } finally {
    release();
    await marking;
  }

  const kept = await keptSession(source, record.session);
  if (kept === undefined) throw new Error("Missing the kept launch.");
  const reviewed = await storyReview(
    makeMe.aSessionReviewRead.ofRecord(kept).please(),
    new AbortController().signal,
  );
  expect(reviewed).toMatchObject({
    kind: "branch-result",
    baseline,
    tree: later,
  });
  const pinned = await sessionBranchPins(checkout.integration, record.session);
  expect(pinned).toMatchObject([{ objectId: baseline }, { objectId: later }]);
  expect(pinned).not.toContainEqual(
    expect.objectContaining({ objectId: earlier }),
  );
  expect(doneStop).not.toHaveBeenCalled();
});
