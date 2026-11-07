// A custom adapter answers CI attempts for the revisions a done story's
// published history names. The real Intent read resolves the endpoints and
// reads only adapter discovery for CI builds.
import { shortSha } from "../../src/baseCiWording.ts";
import { adapterProject } from "../intentCiAdapterProofProject.ts";
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

test.setTimeout(90_000);

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
    const setup = await publish(page, origin);
    const adapter = adapterProject(dashboard.home);
    const branch = setup.branchAncestor ?? setup.branchSide;
    const landed = setup.landingMerge ?? setup.branchSide;
    const baselineAttempt = attempt(
      setup.baseline,
      "before",
      "a-base",
      "main",
      "2026-11-05T10:02:00Z",
    );
    // Exact SHA still counts when another branch validated the attempt.
    // The comparison preserves the branch whose discover listed it.
    const branchAttempt = attempt(
      branch.toUpperCase(),
      402,
      2,
      "ci/another-branch",
      "2026-11-05T10:03:20Z",
    );
    const landedAttempt =
      landing === "merge"
        ? attempt(landed, "merged", "a-landed", "main", "2026-11-05T10:04:00Z")
        : branchAttempt;
    adapter.answer({
      discover: {
        main:
          landing === "merge"
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
        [setup.branch]: [branchAttempt],
      },
      proof: { unavailable: "no proof in this fixture" },
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
        selection: landing === "merge" ? "ancestor" : "exact",
        wall: "3 min 20 s +1 min 20 s",
      },
      {
        role: "Landed",
        slot: "landed",
        revision: landed,
        attempt: landedAttempt,
        runBranch: landing === "merge" ? "main" : setup.branch,
        selection: "exact",
        wall: landing === "merge" ? "4 min +2 min" : "3 min 20 s +1 min 20 s",
      },
    ];
    const answer: unknown = await (await response).json();
    for (const entry of expected) {
      const { attempt, revision, runBranch, selection } = entry;
      const subject = git(
        origin.project,
        "show",
        "-s",
        "--format=%s",
        revision,
      );
      const rowHeader = page.getByRole("rowheader", {
        name: entry.role,
        exact: true,
      });
      const row = panel.getByRole("row").filter({ has: rowHeader });
      const identity = row.locator(".intent-ci-comparison-identity");
      await expect(identity).toContainText(shortSha(revision));
      await expect(identity).toContainText(subject);
      await expect(identity).toContainText(
        selection === "exact" ? "exact revision" : "ancestor:",
      );
      await expect(identity).toContainText("passed");
      await expect(
        identity.getByRole("link", {
          name: `run ${String(attempt.runId)} · attempt ${String(attempt.attemptId)}`,
          exact: true,
        }),
      ).toHaveAttribute("href", attempt.url);
      await expect(row.locator(".intent-ci-comparison-wall")).toHaveText(
        entry.wall,
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
    expect(
      github.calls.filter(({ request }) => request.kind.startsWith("actions-")),
    ).toEqual([]);
  });
}
