import { expect, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import {
  handleLanding,
  machineLandingStores as stores,
  type LandingStores,
} from "../../server/launchLandingReporting.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { landingReportingReference } from "../../src/launchLanding.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  keepMoreLaunchRecords,
  keptLaunchRecords,
  keptLaunchStore,
} from "../../test-support/support/launchStore.ts";
import { keepAttempt } from "../../server/launchAttemptStore.ts";
import { keep, minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const reference = "11111111-0000-4000-8000-000000000745";
const reporting = { origin: dashboardOrigin, reference, command: "report" };

// The case's isolated launch on `branch`, kept alone in the store, reporting
// its landing through the attempt the dashboard accepted for it.
async function aReportedIsolatedLanding<Branch extends string>(branch: Branch) {
  const { checkout, worktrees, records, performWork } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withIsolatedLaunch("isolated-launch", { launched: 60 }, branch, (launch) =>
      launch.reportingThrough(reporting),
    )
    .please();
  const workspace = worktrees[branch];
  const record = records["isolated-launch"];
  const home = keep(record);
  await keepAttempt(
    makeMe.anAcceptedAttempt
      .reportingFor(record)
      .landingIn(
        makeMe.aLandingAuthority
          .ofRepository(checkout.gitDirectory)
          .inWorktree({ workspace, branch })
          .please(),
      )
      .please(),
  );
  return { checkout, workspace, record, reference, home, performWork };
}

// The case's Default main launch that declared its landing from `branch`,
// kept alone in the store.
async function aDeclaredLanding<Branch extends string>(branch: Branch) {
  const { checkout, worktrees, records, performWork } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withDeclaredLandingLaunch("default-launch", { launched: 60 }, branch)
    .please();
  const record = records["default-launch"];
  const workspace = worktrees[branch];
  return { checkout, workspace, record, home: keep(record), performWork };
}

test.each(["retained", "attempt"] as const)(
  "the %s landing keeps the creation and sessions outside its write",
  async (path) => {
    const branch = "landing-draft";
    const { checkout, workspace, record, home, performWork } =
      path === "attempt"
        ? await aReportedIsolatedLanding(branch)
        : await aDeclaredLanding(branch);
    const { base } = checkout;
    const reference = landingReportingReference(record);
    if (reference === undefined) throw new Error("Missing landing reference.");
    const creation = makeMe.aCreationRecord
      .adHoc({ title: "Waiting for native creation" })
      .unresolved({
        workspace: checkout.integration,
        endpoint: "unix:///pending",
      })
      .please();
    const other = makeMe.aLaunchRecord
      .adHoc({ title: "Another kept session" })
      .inClaudeSession({ sessionId: "other" })
      .please();
    const arrived = makeMe.aLaunchRecord
      .adHoc({ title: "A new kept session" })
      .inClaudeSession({ sessionId: "arrived" })
      .please();
    const agedOut = makeMe.aLaunchRecord
      .adHoc({ title: "Session past retention" })
      .inClaudeSession({ sessionId: "past-retention" })
      .markedDoneAt("2020-01-01T00:00:00.000Z")
      .please();
    keepMoreLaunchRecords(home, [creation, other, agedOut]);
    const { draft: revision } = await performWork(
      (at) => makeMe.aCheckoutWork.committing("draft", { at: at(30) }),
      { in: branch },
    );
    const submission = makeMe.aLandingSubmission
      .forLaunch({ reference })
      .comparing({ base, revision })
      .please();
    const receipt = await handleLanding(submission, dashboardOrigin, "prepare");
    const afterPrepare = keptLaunchRecords(home);
    const prepared = await keptSession(source, record.session);
    const replaceRecords = vi.fn<LandingStores["replaceRecords"]>();
    const retryStores = { ...stores, replaceRecords };
    await expect(
      handleLanding(submission, dashboardOrigin, "prepare", retryStores),
    ).resolves.toEqual(receipt);
    await git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
    const doneAt = minutesAgo(10);
    let done: LaunchRecord | undefined;
    const recordingStores: LandingStores = {
      ...stores,
      replaceRecords: async (change) => {
        done = await setRecordDoneAt(source, other.session, doneAt);
        keepMoreLaunchRecords(home, [arrived]);
        await stores.replaceRecords(change);
      },
    };
    const recorded = await handleLanding(
      submission,
      dashboardOrigin,
      "record",
      recordingStores,
    );
    const { state, ...landed } = receipt;
    expect(state).toBe("prepared");
    expect.soft(afterPrepare).toEqual([prepared, creation, other]);
    expect(prepared?.landingReporting?.preparations).toMatchObject([
      { receipt: receipt.receipt, base, revision },
    ]);
    expect(recorded).toEqual({ ...landed, state: "recorded" });
    expect(done?.doneAt).toBe(doneAt);
    expect(keptLaunchRecords(home)).toEqual([
      {
        ...prepared,
        landing: { ...landed, repository: checkout.gitDirectory },
      },
      creation,
      done,
      arrived,
    ]);
    await expect(
      handleLanding(submission, dashboardOrigin, "record", retryStores),
    ).resolves.toEqual(recorded);
    expect(replaceRecords).not.toHaveBeenCalled();
  },
);

test("a late prepare keeps the preparations already saved by the next prepare", async () => {
  const { checkout, record, reference } =
    await aReportedIsolatedLanding("delayed-prepare");
  const { base } = checkout;
  const submission = () =>
    makeMe.aLandingSubmission
      .forLaunch({ reference })
      .comparing({ base, revision: base });
  const delayed = submission().please();
  const next = submission()
    .inDelivery("11111111-0000-4000-8000-000000000746")
    .please();
  const racingStores: LandingStores = {
    ...stores,
    replaceAttempts: async (change) => {
      await stores.replaceAttempts(change);
      await handleLanding(next, dashboardOrigin, "prepare");
    },
  };

  expect(
    await handleLanding(delayed, dashboardOrigin, "prepare", racingStores),
  ).toMatchObject({ state: "prepared" });

  const deliveries = [delayed, next].map(({ delivery }) => ({ delivery }));
  const prepared = await keptSession(source, record.session);
  expect(prepared?.landingReporting?.preparations).toMatchObject(deliveries);
  expect((await keptAttempts())?.[0]?.landingPreparations).toMatchObject(
    deliveries,
  );
});

test("a late prepare leaves a replacement launch's record untouched", async () => {
  const { checkout, record, reference, home } =
    await aReportedIsolatedLanding("replaced-launch");
  const { base } = checkout;
  const submission = makeMe.aLandingSubmission
    .forLaunch({ reference })
    .comparing({ base, revision: base })
    .please();
  // The same session, relaunched under the same reporting context.
  const replacement = { ...record, launchedAt: minutesAgo(5) };
  const replacementDocument = { [source]: [replacement] };
  const racingStores: LandingStores = {
    ...stores,
    replaceAttempts: async (change) => {
      await stores.replaceAttempts(change);
      await stores.replaceRecords(() => replacementDocument);
    },
  };

  expect(
    await handleLanding(submission, dashboardOrigin, "prepare", racingStores),
  ).toMatchObject({ state: "prepared" });

  expect(keptLaunchStore(home)).toEqual(replacementDocument);
});
