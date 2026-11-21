// A quiet completion received while a manual Done is still capturing an
// earlier branch revision keeps the later revision, pins only the baseline and
// later commit, and runs no native stop when the stale manual mark resumes.
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { deliverCompletion } from "../../server/completionDelivery.ts";
import { NativeDoneMarks, type DoneLaunches } from "../../server/doneMarks.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { sessionBranchPins } from "../../server/launchRecordPins.ts";
import { keptSession } from "../../server/launchRecordStore.ts";
import { localFolder } from "../../server/projectFolders.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import { source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardReporting } from "../support/publisherDashboardOrigin.ts";

test("a newer quiet Done takes precedence over a manual mark still capturing its branch", async () => {
  const {
    checkout,
    records: { "isolated-draft": record },
    work: { earlier },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace("draft")
    .withIsolatedLaunch("isolated-draft", { launched: 60 }, "draft", (launch) =>
      launch.reportingThrough(dashboardReporting),
    )
    .withWork(
      (at) => makeMe.aCheckoutWork.committing("earlier", { at: at(40) }),
      {
        in: "draft",
      },
    )
    .kept()
    .please();
  const baseline = checkout.base;
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .withId(dashboardReporting.reference)
      .requesting(
        makeMe.aLaunchRequest
          .adHoc({ instruction: "Save the latest update" })
          .withPolicy({ workspace: "isolated", landing: "review" })
          .please(),
      )
      .reportingTo(dashboardReporting.origin)
      .capturingLanding({ reporting: dashboardReporting })
      .launched(record.session)
      .please(),
  );
  const submission = makeMe.aCompletionSubmission
    .reportingFor({
      host: record.session.host,
      reference: dashboardReporting.reference,
    })
    .please();

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

  vi.setSystemTime(at(20));
  const marking = marks.markDone(publishedSource, record, folder, launches);
  let later: string;
  try {
    await reading;
    expect(heldRevision).toBe(earlier);
    ({ later } = await performWork(
      makeMe.aCheckoutWork.committing("later", { at: at(15) }),
      { in: "draft" },
    ));
    vi.setSystemTime(at(10));
    await deliverCompletion(submission, dashboardReporting.origin, marks);
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
