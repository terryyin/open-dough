import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { launchRetentionDays } from "../../src/launchRecord.ts";
import {
  deleteRecord,
  markDone,
} from "../../test-support/agentLaunchBoundary.ts";
import {
  adHocReview,
  keptAdHocRecord,
  launchIsolatedReview,
  sessionBranchPins,
} from "../../test-support/support/adHocReview.ts";
import {
  expect,
  test,
} from "../../test-support/support/branchResultValidation.ts";
import { getReview } from "../../test-support/support/completedReviewRequests.ts";
import type { DashboardServer } from "../../test-support/support/dashboardServer.ts";
import { commit, git } from "../../test-support/support/launchLanding.ts";
import {
  changeLaunchStore,
  keptLaunchRecords,
} from "../../test-support/support/launchStore.ts";
import type { StartOrigin } from "../../test-support/support/startOrigin.ts";

test.use({ serverMode: "boundary" });

async function doneBranch(dashboard: DashboardServer, name: string) {
  const launch = await launchIsolatedReview(dashboard, `Keep ${name}`);
  const tip = commit(launch.workspace, `${name}.txt`);
  dashboard.claudeSessionBecomes(launch.session, "done-live");
  const response = await markDone(dashboard, {
    source: "open-dough",
    session: launch.session,
  });
  expect(response.status, response.body).toBe(200);
  return { ...launch, tip };
}

function mergeBranch(origin: StartOrigin, tip: string) {
  git(origin.project, "merge", "--quiet", "--no-ff", "--no-edit", tip);
  return git(origin.project, "rev-parse", "HEAD");
}

const landingPins = (project: string) =>
  git(
    project,
    "for-each-ref",
    "--format=%(refname)",
    "refs/open-dough/one-shot",
  )
    .split("\n")
    .filter(Boolean);

test("ordinary revision checks retain one delivery across repeated observations", async ({
  request,
  dashboard,
  origin,
}) => {
  const { baseline, session, tip } = await doneBranch(dashboard, "branch");
  const merge = mergeBranch(origin, tip);
  git(origin.project, "push", "--quiet", "origin", "main");
  const query = { source: "open-dough", since: baseline };
  const answer = await getReview(
    request,
    dashboard,
    authenticatedReadEndpoint,
    query,
  );
  expect(answer.status()).toBe(200);
  expect(await answer.json()).toMatchObject({ revision: merge, changed: true });
  await expect
    .poll(() => adHocReview(request, dashboard, session))
    .toMatchObject({
      kind: "landed",
      baseline,
      tree: merge,
      files: [{ path: "branch.txt" }],
    });
  const captured = await adHocReview(request, dashboard, session);
  const saved = (await keptAdHocRecord(dashboard, session))?.landing;
  const pins = landingPins(origin.project);
  expect(pins).toHaveLength(2);
  await getReview(request, dashboard, authenticatedReadEndpoint, query);

  const advance = await origin.publishRevision({
    files: { "later.txt": "Later\n" },
  });
  const refreshed = await getReview(
    request,
    dashboard,
    authenticatedReadEndpoint,
    { ...query, since: merge },
  );
  expect(refreshed.status()).toBe(200);
  expect(await refreshed.json()).toMatchObject({ revision: advance });
  expect(await adHocReview(request, dashboard, session)).toEqual(captured);
  expect((await keptAdHocRecord(dashboard, session))?.landing).toEqual(saved);
  expect(landingPins(origin.project)).toEqual(pins);

  dashboard.claudeListingFails(true);
  const response = await deleteRecord(dashboard, {
    source: "open-dough",
    session,
  });
  expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
  expect(sessionBranchPins(origin.project, session)).toEqual([]);
  expect(landingPins(origin.project)).toEqual([]);
});

const race = test.extend<{
  observation: Awaited<ReturnType<typeof doneBranch>> & {
    readonly other: string;
  };
}>({
  observation: async ({ request, dashboard, origin, validation }, use) => {
    const leaving = await doneBranch(dashboard, "leaving");
    const staying = await doneBranch(dashboard, "staying");
    expect(sessionBranchPins(origin.project, leaving.session)).toContain(
      leaving.tip,
    );
    mergeBranch(origin, leaving.tip);
    const merge = mergeBranch(origin, staying.tip);
    git(origin.project, "push", "--quiet", "origin", "main");

    validation.hold();
    try {
      const response = await getReview(
        request,
        dashboard,
        authenticatedReadEndpoint,
        {
          source: "open-dough",
          since: leaving.baseline,
        },
      );
      expect(response.status()).toBe(200);
      expect(await response.json()).toMatchObject({ revision: merge });
      await expect.poll(validation.held).toBe(true);
      await use({ ...leaving, other: staying.session });
    } finally {
      validation.release();
    }
  },
});

async function completedObservation(
  request: Parameters<typeof adHocReview>[0],
  dashboard: DashboardServer,
  origin: StartOrigin,
  session: string,
  other: string,
) {
  // The latter record can land only after the held candidate has been settled.
  await expect
    .poll(() => adHocReview(request, dashboard, other))
    .toMatchObject({
      kind: "landed",
      files: [{ path: "staying.txt" }],
    });
  const retained = await adHocReview(request, dashboard, other);
  if (retained.kind !== "landed")
    throw new Error("Missing independent delivery");
  expect(
    keptLaunchRecords(dashboard).some(
      (record) => "session" in record && record.session.sessionId === session,
    ),
  ).toBe(false);
  expect(sessionBranchPins(origin.project, session)).toEqual([]);
  expect(landingPins(origin.project)).toEqual([
    `refs/open-dough/one-shot/${retained.landing.reference}/${retained.landing.delivery}/base`,
    `refs/open-dough/one-shot/${retained.landing.reference}/${retained.landing.delivery}/revision`,
  ]);
}

function ageDoneRecord(dashboard: DashboardServer, session: string) {
  const expired = new Date(
    Date.now() - (launchRetentionDays + 1) * 86_400_000,
  ).toISOString();
  changeLaunchStore(dashboard, (kept) => ({
    ...kept,
    "open-dough":
      kept["open-dough"]?.map((record) =>
        "session" in record && record.session.sessionId === session
          ? { ...record, doneAt: expired }
          : record,
      ) ?? [],
  }));
}

race(
  "deleting while the target is being inspected cannot recreate the launch or leave delivery pins",
  async ({ request, dashboard, origin, validation, observation }) => {
    const { session, other } = observation;
    dashboard.claudeListingFails(true);
    const response = await deleteRecord(dashboard, {
      source: "open-dough",
      session,
    });
    expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
    validation.release();
    await completedObservation(request, dashboard, origin, session, other);
  },
);

race(
  "expiry while the target is being inspected releases evidence and cannot recreate the launch",
  async ({ request, dashboard, origin, validation, observation }) => {
    const { session, other } = observation;
    ageDoneRecord(dashboard, session);
    validation.release();
    await completedObservation(request, dashboard, origin, session, other);

    ageDoneRecord(dashboard, other);
    await launchIsolatedReview(
      dashboard,
      "Start after retained delivery expires",
    );
    await expect.poll(() => landingPins(origin.project)).toEqual([]);
    expect(sessionBranchPins(origin.project, other)).toEqual([]);
  },
);
