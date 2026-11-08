// A custom adapter answers CI attempts for the revisions a done story's
// published history names. The real Intent read resolves the endpoints and
// reads adapter discovery for builds and adapter proof for entry comparisons.
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
import { counts, proofSummary } from "../support/ciProofArtifacts.ts";
import { expectCiComparisonEntryRows } from "../support/expectCiComparisonEntryRows.ts";
import {
  expectAncestorSourceCue,
  expectExactSourceCue,
  expectNoRunOrAttemptIds,
} from "../support/expectCiComparisonSourceCue.ts";
import { expect, test } from "../support/preparationPage.ts";
import { selectDoneStoryForCiComparison } from "../support/selectDoneStoryForCiComparison.ts";
import { publishCodeLandedBeforeCompletion } from "../support/storyCiComparisonEarlierLanding.ts";
import { publishFastForwardLandedStory } from "../support/storyCiComparisonFastForward.ts";
import { git } from "../support/storyReviewWorktree.ts";

const repository = "terryyin/open-dough";

const attempt = (
  sha: string,
  runId: string | number,
  attemptId: string | number,
  branch: string,
  completedAt: string,
) => ({
  sha,
  runId,
  attemptId,
  branch,
  outcome: "success",
  url: `https://ci.invalid/builds/${String(runId)}`,
  time: completedAt,
  startedAt: "2026-11-05T10:00:00Z",
  completedAt,
});

const proofOf = (
  tested: ReturnType<typeof attempt>,
  passed: number,
  durationMs: number,
) => ({
  summary: proofSummary(
    {
      repository,
      attemptId: String(tested.attemptId),
      revision: tested.sha.toLowerCase(),
    },
    [["tests", 1]],
    [["tests", 1, 1, "tests", counts(passed), durationMs]],
  ),
});

for (const [landing, publish] of [
  ["merge", publishCodeLandedBeforeCompletion],
  ["fast-forward", publishFastForwardLandedStory],
] as const) {
  test(`a done adapter story compares discover builds after a ${landing} landing`, async ({
    page,
    origin,
    dashboard,
    github,
  }) => {
    const merged = landing === "merge";
    const setup = await publish(page, origin);
    const adapter = adapterProject(dashboard.home);
    const branch = setup.branchAncestor ?? setup.branchSide;
    const landed = setup.landingMerge ?? setup.branchSide;
    const baselineAttempt = attempt(
      setup.baseline,
      "before|opaque",
      "a-base+#",
      "main",
      "2026-11-05T10:02:00Z",
    );
    // The exact SHA counts even though a different branch validated it.
    const branchAttempt = attempt(
      branch.toUpperCase(),
      402,
      2,
      "ci/another-branch",
      "2026-11-05T10:03:20Z",
    );
    const landedAttempt = merged
      ? attempt(landed, "merged", "a-landed", "main", "2026-11-05T10:04:00Z")
      : branchAttempt;
    adapter.answer({
      discover: {
        main: merged
          ? [
              baselineAttempt,
              landedAttempt,
              attempt(
                setup.completion,
                "completed",
                "later",
                "main",
                "2026-11-05T10:09:00Z",
              ),
            ]
          : [baselineAttempt],
        [setup.branch]: merged
          ? [branchAttempt]
          : [
              branchAttempt,
              // The older attempt makes the selected attempt's proof ambiguous.
              attempt(
                branch,
                "older",
                "2",
                setup.branch,
                "2026-11-05T10:01:00Z",
              ),
            ],
      },
      proof: { unavailable: "no summary retained for this attempt" },
      proofByAttemptId: merged
        ? {
            [baselineAttempt.attemptId]: proofOf(baselineAttempt, 5, 3_000),
            [branchAttempt.attemptId]: proofOf(branchAttempt, 8, 5_000),
          }
        : { [baselineAttempt.attemptId]: { summary: { schemaVersion: 0 } } },
    });

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
      },
      {
        role: "Branch",
        slot: "branch",
        revision: branch,
        attempt: branchAttempt,
        runBranch: setup.branch,
        selection: merged ? "ancestor" : "exact",
        wall: "3 min 20 s",
      },
      {
        role: "Landed",
        slot: "landed",
        revision: landed,
        attempt: landedAttempt,
        runBranch: merged ? "main" : setup.branch,
        selection: "exact",
        wall: merged ? "4 min" : "3 min 20 s",
      },
    ];
    const answer: unknown = await (await response).json();
    for (const entry of expected) {
      const { attempt, revision, runBranch, selection } = entry;
      const subject = git(origin.project, "log", "-1", "--format=%s", revision);
      const rowHeader = page.getByRole("rowheader", {
        name: entry.role,
        exact: true,
      });
      const row = panel.getByRole("row").filter({ has: rowHeader });
      const identity = row.locator(".intent-ci-comparison-identity");
      await expect(identity).toContainText(shortSha(revision));
      await expect(identity).not.toContainText(subject);
      if (selection === "exact") await expectExactSourceCue(identity);
      else await expectAncestorSourceCue(identity);
      await expectNoRunOrAttemptIds(identity);
      await expect(row.locator(".intent-ci-comparison-wall")).toHaveText(
        entry.wall,
      );
      await expect(
        row.locator(".intent-ci-comparison-without-waits"),
      ).toHaveText("Unavailable. The CI adapter does not report a job graph.");
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
    if (merged) {
      await expectCiComparisonEntryRows(panel, [
        [
          "tests",
          "5 → 8 tests (+3)",
          "3 s",
          "3 s → 5 s (+2 s, +67%)",
          "This attempt's CI adapter gave no CI proof summary: no summary retained for this attempt.",
        ],
      ]);
    } else {
      const gaps = panel.locator(".intent-ci-comparison-entries");
      await expect(gaps).toContainText(
        "Baseline — This attempt's CI proof summary is not a valid summary: schemaVersion is not 1",
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
    expect(
      github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
    ).toEqual([]);
  });
}
