import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  handleLanding,
  type LandingStores,
} from "../../server/launchLandingReporting.ts";
import { setRecordDoneAt } from "../../server/launchRecordStore.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  aComposedDeclaredLanding,
  composedLandingStores,
} from "../support/composedLandingStores.ts";
import {
  aCheckoutWithCanonicalWorktree,
  anIsolatedLaunch,
  canonicalGitDirectory,
  inWorktree,
  keep,
  minutesAgo,
  source,
  work,
  type Checkout,
} from "../support/doneCaptureCase.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

function attemptLanding(checkout: Checkout, workspace: string, branch: string) {
  const reference = "11111111-0000-4000-8000-000000000745";
  const reporting = { origin: dashboardOrigin, reference, command: "report" };
  const record = anIsolatedLaunch(checkout, { workspace, branch })
    .reportingThrough(reporting)
    .please();
  const attempt = makeMe.anAcceptedAttempt
    .adHoc()
    .withId(reference)
    .acceptedAt(minutesAgo(60))
    .reportingTo(dashboardOrigin)
    .capturingLanding({
      reporting,
      landingRepository: makeMe.aLandingAuthority
        .ofRepository(canonicalGitDirectory(checkout))
        .inWorktree({ workspace, branch })
        .please(),
    })
    .launched({
      host: record.session.host,
      sessionId: record.session.sessionId,
    })
    .please();
  return { record, reference, reporting, attempts: [attempt] };
}

test.each(["retained", "attempt"] as const)(
  "the %s landing keeps the creation and sessions outside its write",
  async (path) => {
    const branch = "landing-draft";
    const { checkout, workspace } =
      await aCheckoutWithCanonicalWorktree(branch);
    const { base } = checkout;
    const { record, reference, attempts } =
      path === "attempt"
        ? attemptLanding(checkout, workspace, branch)
        : {
            ...aComposedDeclaredLanding(checkout, { workspace, branch }),
            attempts: [],
          };
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
    keep();
    const stores = composedLandingStores({
      attempts: { [source]: attempts },
      records: { [source]: [record, creation, other, agedOut] },
    });
    const { draft: revision } = await work(
      inWorktree(checkout, workspace),
      makeMe.aCheckoutWork.committing("draft", { at: minutesAgo(30) }),
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

    expect(receipt.state).toBe("prepared");
    expect.soft(afterPrepare).toEqual([prepared, creation, other]);
    expect(prepared?.landingReporting?.preparations).toMatchObject([
      { receipt: receipt.receipt, base, revision },
    ]);
    const { state, ...landed } = recorded;
    expect(state).toBe("recorded");
    expect(recorded).toEqual({ ...receipt, state });
    expect(done?.doneAt).toBe(doneAt);
    expect(stores.records()[source]).toEqual([
      {
        ...prepared,
        landing: { ...landed, repository: canonicalGitDirectory(checkout) },
      },
      creation,
      done,
      arrived,
    ]);
    const retryStores = {
      ...stores,
      replaceRecords: () => {
        throw new Error("An exact recorded retry has no record change.");
      },
    };
    await expect(
      handleLanding(submission, dashboardOrigin, "record", retryStores),
    ).resolves.toEqual(recorded);
  },
);

test("a late prepare keeps the preparations already saved by the next prepare", async () => {
  const branch = "delayed-prepare";
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  const { record, reference, attempts } = attemptLanding(
    checkout,
    workspace,
    branch,
  );
  const { base } = checkout;
  const submission = () =>
    makeMe.aLandingSubmission
      .forLaunch({ reference })
      .comparing({ base, revision: base });
  const delayed = submission().please();
  const next = submission()
    .inDelivery("11111111-0000-4000-8000-000000000746")
    .please();
  keep();
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

  expect(
    stores.recordOf(record.session.sessionId)?.landingReporting?.preparations,
  ).toMatchObject([
    { delivery: delayed.delivery },
    { delivery: next.delivery },
  ]);
});

test("a late prepare leaves a replacement launch's record untouched", async () => {
  const branch = "replaced-launch";
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  const { record, reference, reporting, attempts } = attemptLanding(
    checkout,
    workspace,
    branch,
  );
  const { base } = checkout;
  const submission = makeMe.aLandingSubmission
    .forLaunch({ reference })
    .comparing({ base, revision: base })
    .please();
  const replacement = anIsolatedLaunch(checkout, {
    workspace,
    branch,
    sessionId: record.session.sessionId,
    launchedAt: minutesAgo(5),
  })
    .reportingThrough(reporting)
    .please();
  keep();
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
