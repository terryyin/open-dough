import {
  comparisonReading,
  comparisonBuildReading,
} from "../intentCiComparisonPage.ts";
// A custom adapter answers CI attempts for the revisions a done story's
// published history names. The real Intent read resolves the endpoints and
// reads adapter discovery for builds, jobs for timing and proof for entries.
// The Done adapter planning-only skip wall-time journey is in
// ./intent-ci-comparison-adapter-planning-skip.spec.ts.
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
import { expectCueState } from "../support/expectCiComparisonCues.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";
import { expect, test } from "../support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { landedAdapterComparisonAnswers } from "../support/storyCiComparisonAdapterAnswers.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import { git } from "../support/storyReviewWorktree.ts";

const repository = "terryyin/open-dough";

const integrations: readonly [
  string,
  typeof publishCodeLandedBeforeCompletion,
  boolean,
][] = [["merge landing", publishCodeLandedBeforeCompletion, true]];
for (const [landing, publish, landedHasProof] of integrations) {
  test(`a done adapter story compares discover builds after a ${landing}`, async ({
    page,
    origin,
    dashboard,
    github,
  }) => {
    const merged = publish === publishCodeLandedBeforeCompletion;
    const setup = await publish(page, origin);
    const adapter = adapterProject(dashboard.home);
    const {
      answers,
      branch,
      landed,
      baselineAttempt,
      branchAttempt,
      landedAttempt,
    } = landedAdapterComparisonAnswers(repository, setup, {
      merged,
      landedHasProof,
    });
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
        selection: merged ? "ancestor" : "exact",
        wall: "3 min 20 s",
        timing: merged ? "1 min 30 s" : undefined,
      },
      {
        role: "Landed",
        slot: "landed",
        revision: landed,
        attempt: landedAttempt,
        runBranch: merged ? "main" : setup.branch,
        selection: "exact",
        wall: merged ? "4 min" : "3 min 20 s",
        timing: merged ? "1 min 15 s" : undefined,
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
      await expect(build.timeWithoutWaits).toHaveText(
        entry.timing ??
          `Unavailable. The CI adapter listed another discovered attempt as attempt 2 at ${shortSha(branch)}.`,
      );
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
    if (landedHasProof) {
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
    } else if (merged) {
      await expect(comparisonReading(panel).activeComparison).toHaveText(
        "Baseline compared with Branch",
      );
      await expectCiComparisonEntryRows(panel, [
        [
          "tests",
          "5 → 8 test cases (+3)",
          "3 s",
          "+2 s",
          "This attempt's CI adapter gave no CI proof summary: no summary retained for this attempt.",
        ],
      ]);
    } else {
      const gaps = comparisonReading(panel).entryEvidence;
      await expect(gaps).toContainText(
        "Baseline — This attempt's CI proof summary is not a valid summary: schemaVersion is not 1 or 2",
      );
      for (const label of ["Branch", "Landed"])
        await expect(gaps).toContainText(
          `${label} — This attempt is ambiguous at its revision: another discovered attempt is also attempt 2 at ${shortSha(branch)}.`,
        );
    }
    const proofRequests = (merged ? expected : expected.slice(0, 1)).map(
      ({ attempt, revision, runBranch }) => ({
        operation: "proof",
        check: { repo: repository, branch: runBranch },
        attempt: {
          runId: String(attempt.runId),
          attemptId: String(attempt.attemptId),
          sha: revision,
        },
      }),
    );
    expect(adapter.proofRequests()).toHaveLength(proofRequests.length);
    expect(adapter.proofRequests()).toEqual(
      expect.arrayContaining(proofRequests),
    );
    const jobsRequests = proofRequests.map((request) => ({
      ...request,
      operation: "jobs",
    }));
    expect(adapter.jobsRequests()).toHaveLength(jobsRequests.length);
    expect(adapter.jobsRequests()).toEqual(
      expect.arrayContaining(jobsRequests),
    );
    expect(
      github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
    ).toEqual([]);
  });
}
