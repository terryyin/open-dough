import {
  comparisonReading,
  comparisonBuildReading,
} from "../../dashboard/test-support/intentCiComparisonPage.ts";
// A custom adapter answers CI attempts for the revisions a done story's
// published history names. The real Intent read resolves the endpoints and
// reads adapter discovery for builds, jobs for timing and proof for entries.
// The Done adapter planning-only skip wall-time journey is in
// ./intent-ci-comparison-adapter-planning-skip.spec.ts.
import { shortSha } from "../../dashboard/src/baseCiWording.ts";
import { adapterProject } from "../../dashboard/test-support/intentCiAdapterProofProject.ts";
import { expectCueState } from "../../dashboard/test-support/support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../../dashboard/test-support/support/expectCiComparisonEntryRows.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../../dashboard/test-support/support/expectCiComparisonSourceCue.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../../dashboard/test-support/support/selectDoneStoryForCiComparison.ts";
import { landedAdapterComparisonAnswers } from "../../dashboard/test-support/support/storyCiComparisonAdapterAnswers.ts";
import { publishCodeLandedBeforeCompletion } from "../../dashboard/test-support/support/storyCiComparisonEarlierLanding.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";

const repository = "terryyin/open-dough";

test("a done adapter story compares discover builds after a merge landing", async ({
  page,
  origin,
  dashboard,
  github,
}) => {
  const setup = await publishCodeLandedBeforeCompletion(page, origin);
  const adapter = adapterProject(dashboard.home);
  const {
    answers,
    branch,
    landed,
    baselineAttempt,
    branchAttempt,
    landedAttempt,
  } = landedAdapterComparisonAnswers(repository, setup);
  adapter.answer(answers);

  const response = page.waitForResponse(
    (answer) =>
      new URL(answer.url()).searchParams.get("intent") === "ci-comparison",
  );
  const { panel } = await selectDoneStoryForCiComparison(page);
  const expected = [
    {
      role: "Baseline",
      slot: "baseline",
      revision: setup.baseline,
      attempt: baselineAttempt,
      runBranch: "main",
      selection: "ancestor",
      wall: "2 min",
      timing: "1 min 30 s",
    },
    {
      role: "Branch",
      slot: "branch",
      revision: branch,
      attempt: branchAttempt,
      runBranch: setup.branch,
      selection: "ancestor",
      wall: "3 min 20 s",
      timing: "1 min 30 s",
    },
    {
      role: "Landed",
      slot: "landed",
      revision: landed,
      attempt: landedAttempt,
      runBranch: "main",
      selection: "exact",
      wall: "4 min",
      timing: "1 min 15 s",
    },
  ];
  const answer: unknown = await (await response).json();
  for (const entry of expected) {
    const { attempt, revision, runBranch, selection } = entry;
    const subject = git(origin.project, "log", "-1", "--format=%s", revision);
    const build = comparisonBuildReading(panel, entry.role);
    const identity = build.identity;
    await expect(identity).toContainText(shortSha(revision));
    await expect(identity).not.toContainText(subject);
    if (selection === "exact") await expectExactSourceCue(identity);
    else await expectAncestorSourceCue(identity);
    await expectNoRunOrAttemptIds(identity);
    await expect(build.wallTime).toHaveText(entry.wall);
    await expect(build.timeWithoutWaits).toHaveText(entry.timing);
    expect(answer).toMatchObject({
      [entry.slot]: {
        kind: "build",
        revision,
        subject,
        state: "pass",
        selection,
        runBranch,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        adapterAttempt: {
          runId: String(attempt.runId),
          attemptId: String(attempt.attemptId),
        },
      },
    });
  }

  const discover = (branch: string) => ({
    operation: "discover",
    check: { repo: repository, branch },
  });
  expect(adapter.discoverRequests()).toEqual(
    expect.arrayContaining([discover("main"), discover(setup.branch)]),
  );
  expect(adapter.discoverRequests()).toHaveLength(2);
  await expect(comparisonReading(panel).activeComparison).toHaveText(
    "Baseline compared with Landed",
  );
  const overallTiming = comparisonReading(panel).overallTiming;
  await expect(overallTiming).toHaveText("−15 s");
  await expectCueState(overallTiming, { duration: "faster-light" });
  await expectCiComparisonEntryRows(panel, [
    [
      "tests",
      "5 → 8 test cases (+3) → 7 test cases (+2)",
      "3 s",
      "+2 s",
      "+1 s",
    ],
  ]);
  const proofRequests = expected.map(({ attempt, revision, runBranch }) => ({
    operation: "proof",
    check: { repo: repository, branch: runBranch },
    attempt: {
      runId: String(attempt.runId),
      attemptId: String(attempt.attemptId),
      sha: revision,
    },
  }));
  expect(adapter.proofRequests()).toHaveLength(proofRequests.length);
  expect(adapter.proofRequests()).toEqual(
    expect.arrayContaining(proofRequests),
  );
  const jobsRequests = proofRequests.map((request) => ({
    ...request,
    operation: "jobs",
  }));
  expect(adapter.jobsRequests()).toHaveLength(jobsRequests.length);
  expect(adapter.jobsRequests()).toEqual(expect.arrayContaining(jobsRequests));
  expect(
    github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
  ).toEqual([]);
});
