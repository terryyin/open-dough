import { makeMe } from "../../../tests/support/makeMe.mjs";
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import { expect, test } from "../support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { landedAdapterComparisonAnswers } from "../support/storyCiComparisonAdapterAnswers.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";

test("unavailable adapter timing keeps the build, wall time and proof in a final comparison", async ({
  page,
  origin,
  dashboard,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const { answers, baselineAttempt, branchAttempt, landedAttempt } =
    landedAdapterComparisonAnswers("terryyin/open-dough", setup, {
      merged: true,
      landedHasProof: true,
    });
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    ...answers,
    jobsStderrByAttemptId: {
      [baselineAttempt.attemptId]:
        "adapter starting\nunsupported CI adapter operation",
    },
    jobsByAttemptId: {
      [branchAttempt.attemptId]: {
        jobs: [
          makeMe.aCiTimingJob
            .withTiming({ id: "test", durationMs: 40_000, needs: ["lint"] })
            .please(),
        ],
      },
      [landedAttempt.attemptId]: { unavailable: "Job history expired!" },
    },
  });

  const { panel } = await selectDoneStoryForCiComparison(page);
  const rows = [
    {
      endpoint: "Baseline",
      revision: baselineAttempt.sha,
      wall: "2 min",
      reason:
        "The CI adapter answered no job graph: it exited with status 2 (unsupported CI adapter operation).",
    },
    {
      endpoint: "Branch",
      revision: branchAttempt.sha.toLowerCase(),
      wall: "3 min 20 s",
      reason: "The CI adapter's job “test” needs unknown job “lint”.",
    },
    {
      endpoint: "Landed",
      revision: landedAttempt.sha,
      wall: "4 min",
      reason: "The CI adapter gave no job graph: Job history expired!",
    },
  ] as const;
  for (const { endpoint, revision, wall, reason } of rows) {
    const row = panel.getByRole("row").filter({
      has: page.getByRole("rowheader", { name: endpoint, exact: true }),
    });
    await expect(row.locator(".intent-ci-comparison-identity")).toContainText(
      shortSha(revision),
    );
    await expect(row.locator(".intent-ci-comparison-wall")).toHaveText(wall);
    await expect(row.locator(".intent-ci-comparison-without-waits")).toHaveText(
      `Unavailable. ${reason}`,
    );
  }
  await expectCiComparisonEntryRows(panel, [
    [
      "tests",
      "5 → 8 tests (+3) → 7 tests (+2)",
      "3 s",
      "3 s → 5 s (+2 s, +67%)",
      "3 s → 4 s (+1 s, +33%)",
    ],
  ]);
  expect(adapter.jobsRequests()).toHaveLength(3);
  expect(adapter.discoverRequests()).toHaveLength(2);

  // Every slot is a completed build. Later valid graphs cannot replace the
  // timing reasons in a final answer when the same comparison is read again.
  adapter.answer(answers);
  const rechecked = page.waitForResponse(
    (answer) =>
      new URL(answer.url()).searchParams.get("intent") === "ci-comparison",
  );
  await panel.getByRole("button", { name: "Check again" }).click();
  expect(await (await rechecked).json()).toMatchObject({
    baseline: { timeWithoutRunnerWaits: { reason: rows[0].reason } },
    branch: { timeWithoutRunnerWaits: { reason: rows[1].reason } },
    landed: { timeWithoutRunnerWaits: { reason: rows[2].reason } },
  });
  expect(adapter.jobsRequests()).toHaveLength(3);
  expect(adapter.discoverRequests()).toHaveLength(2);
});
