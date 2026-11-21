import { expect, test, vi } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  handleLanding,
  type LandingStores,
} from "../../server/launchLandingReporting.ts";
import { setRecordDoneAt } from "../../server/launchRecordStore.ts";
import { landingReportingReference } from "../../src/launchLanding.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { composedLandingStores } from "../support/composedLandingStores.ts";
import { minutesAgo, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const reference = "11111111-0000-4000-8000-000000000745";
const reporting = { origin: dashboardOrigin, reference, command: "report" };

// A kept case whose isolated launch on `branch` reports its landing through
// the attempt the dashboard accepted for it.
async function anAttemptLanding<Branch extends string>(branch: Branch) {
  const { checkout, worktrees, records, timeline, performWork } =
    await aDoneCaptureCase()
      .withOrigin()
      .withWorkspace(branch)
      .withIsolatedLaunch(
        "isolated-launch",
        { launched: 60 },
        branch,
        (launch) => launch.reportingThrough(reporting),
      )
      .kept()
      .please();
  const workspace = worktrees[branch];
  const record = records["isolated-launch"];
  const attempt = makeMe.anAcceptedAttempt
    .adHoc()
    .withId(reference)
    .acceptedAt(timeline["isolated-launch"].launchedAt)
    .reportingTo(dashboardOrigin)
    .capturingLanding({
      reporting,
      landingRepository: makeMe.aLandingAuthority
        .ofRepository(checkout.gitDirectory)
        .inWorktree({ workspace, branch })
        .please(),
    })
    .launched({
      host: record.session.host,
      sessionId: record.session.sessionId,
    })
    .please();
  return { checkout, workspace, record, attempts: [attempt], performWork };
}

// A kept case whose Default main launch declared its landing from `branch`.
async function aRetainedLanding<Branch extends string>(branch: Branch) {
  const { checkout, worktrees, records, performWork } = await aDoneCaptureCase()
    .withOrigin()
    .withWorkspace(branch)
    .withDefaultMainLaunch(
      "default-launch",
      { launched: 60 },
      (launch, { checkout, worktrees }) =>
        launch.withDeclaredLanding({
          repository: checkout.gitDirectory,
          workspace: worktrees[branch] ?? "",
          branch,
          committedTip: checkout.base,
          origin: dashboardOrigin,
        }),
    )
    .kept()
    .please();
  const record = records["default-launch"];
  const workspace = worktrees[branch];
  return { checkout, workspace, record, attempts: [], performWork };
}

test.each(["retained", "attempt"] as const)(
  "the %s landing keeps the creation and sessions outside its write",
  async (path) => {
    const branch = "landing-draft";
    const { checkout, workspace, record, attempts, performWork } =
      await (path === "attempt"
        ? anAttemptLanding(branch)
        : aRetainedLanding(branch));
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
    const stores = composedLandingStores({
      attempts: { [source]: attempts },
      records: { [source]: [record, creation, other, agedOut] },
    });
    const { draft: revision } = await performWork(
      (at) => makeMe.aCheckoutWork.committing("draft", { at: at(30) }),
      { in: branch },
    );
    const submission = makeMe.aLandingSubmission
      .forLaunch({ reference })
      .comparing({ base, revision })
      .please();
    const receipt = await handleLanding(
      submission,
      dashboardOrigin,
      "prepare",
      stores,
    );
    const afterPrepare = stores.records()[source];
    const prepared = stores.recordOf(record.session.sessionId);
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
        done = await setRecordDoneAt(source, other.session, doneAt, {
          store: stores,
        });
        await stores.replaceRecords((kept) => ({
          ...kept,
          [source]: [...(kept[source] ?? []), arrived],
        }));
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
    expect(stores.records()[source]).toEqual([
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
  const { checkout, record, attempts } =
    await anAttemptLanding("delayed-prepare");
  const { base } = checkout;
  const submission = () =>
    makeMe.aLandingSubmission
      .forLaunch({ reference })
      .comparing({ base, revision: base });
  const delayed = submission().please();
  const next = submission()
    .inDelivery("11111111-0000-4000-8000-000000000746")
    .please();
  const stores = composedLandingStores({
    attempts: { [source]: attempts },
    records: { [source]: [record] },
  });
  const racingStores: LandingStores = {
    ...stores,
    replaceAttempts: async (change) => {
      await stores.replaceAttempts(change);
      await handleLanding(next, dashboardOrigin, "prepare", stores);
    },
  };

  expect(
    await handleLanding(delayed, dashboardOrigin, "prepare", racingStores),
  ).toMatchObject({ state: "prepared" });

  const deliveries = [delayed, next].map(({ delivery }) => ({ delivery }));
  const prepared = stores.recordOf(record.session.sessionId)?.landingReporting;
  expect(prepared?.preparations).toMatchObject(deliveries);
  expect(stores.attempts()[source]?.[0]?.landingPreparations).toMatchObject(
    deliveries,
  );
});

test("a late prepare leaves a replacement launch's record untouched", async () => {
  const branch = "replaced-launch";
  const { checkout, workspace, record, attempts } =
    await anAttemptLanding(branch);
  const { base } = checkout;
  const submission = makeMe.aLandingSubmission
    .forLaunch({ reference })
    .comparing({ base, revision: base })
    .please();
  const replacement = makeMe.aLaunchRecord
    .ofIsolatedLaunch(record.session.sessionId, checkout, { workspace, branch })
    .launchedAt(minutesAgo(5))
    .reportingThrough(reporting)
    .please();
  const stores = composedLandingStores({
    attempts: { [source]: attempts },
    records: { [source]: [record] },
  });
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

  expect(stores.records()).toBe(replacementDocument);
});
