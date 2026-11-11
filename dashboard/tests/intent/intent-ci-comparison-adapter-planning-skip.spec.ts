import { comparisonReading } from "../intentCiComparisonPage.ts";
// A Done adapter planning-only skip reuses the equivalent attempt's wall
// time without a proof summary (SEED-288#reuse-adapter-equivalent-timing).
// Parameterized discover-build comparison journeys stay in
// ./intent-ci-comparison-adapter.spec.ts.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
import { expectNoRunOrAttemptIds } from "../support/expectCiComparisonSourceCue.ts";
import { expect, test } from "../support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { publishUnbuiltStoryLanding } from "../support/storyCiComparisonSkippedLandingFixture.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { git } from "../support/storyReviewWorktree.ts";

const repository = "terryyin/open-dough";

test("a Done adapter planning-only skip shows Landed equivalent wall time without inventing proof", async ({
  page,
  origin,
  dashboard,
  github,
}) => {
  const setup = await publishUnbuiltStoryLanding(origin, "planning");
  const published = git(origin.origin, "rev-parse", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: published,
    repository,
    follows: true,
    realHistory: true,
  });
  const adapter = adapterProject(dashboard.home);
  const startedAt = "2026-11-05T13:30:00Z";
  const baselineAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: setup.olderBaseline,
      runId: "baseline",
      attemptId: "a-base",
      branch: "main",
      startedAt: "2026-11-05T12:00:00Z",
      completedAt: "2026-11-05T12:03:00Z",
    })
    .please();
  const equivalentAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: setup.trunkSide,
      runId: "equivalent",
      attemptId: "a-eq",
      branch: "main",
      startedAt,
      completedAt: "2026-11-05T13:35:00Z",
    })
    .please();
  const branchAttempt = makeMe.aCiAdapterAttempt
    .passed({
      sha: setup.branchSide,
      runId: "branch",
      attemptId: "a-branch",
      branch: setup.branch,
      startedAt: "2026-11-05T13:00:00Z",
      completedAt: "2026-11-05T13:03:20Z",
    })
    .please();
  adapter.answer({
    discover: {
      main: [baselineAttempt, equivalentAttempt],
      [setup.branch]: [branchAttempt],
    },
    proof: { unavailable: "no summary retained for this attempt" },
  });

  const { panel } = await selectDoneStoryForCiComparison(page);
  const landedIdentity = comparisonReading(panel).identities.nth(2);
  await expect(landedIdentity).toContainText(shortSha(setup.trunkSide));
  await expect(landedIdentity).toContainText("equivalent build");
  await expectNoRunOrAttemptIds(landedIdentity);
  await expect(landedIdentity).not.toContainText(shortSha(setup.olderBaseline));
  await expect(comparisonReading(panel).wallTimes.nth(2)).toHaveText("5 min");
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Branch",
  );
  await expect(comparisonReading(panel).fallbackReason).toHaveText(
    /Landed is not used: .+no CI proof summary/,
  );
  expect(
    github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
  ).toEqual([]);
});
