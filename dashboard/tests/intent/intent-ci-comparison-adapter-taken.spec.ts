// Taken adapter stories show a completed provisional ancestor while a
// newer attempt is running, without an Actions read or a branch-head API
// request for the comparison itself.
import path from "node:path";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { shortSha } from "../../src/baseCiWording.ts";
import { notLandedYetExplanation } from "../../src/storyCiComparison.ts";
import { adapterProject, passed } from "../intentCiAdapterProofProject.ts";
import { expect, test } from "../support/preparationPage.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { selectTakenStoryForCiComparison } from "../support/selectTakenStoryForCiComparison.ts";
import {
  publishTakenComparedStoryBranch,
  publishTakenComparedTrunk,
} from "../support/storyCiComparisonTakenFixture.ts";
import { commitAll, git, writeAt } from "../support/storyReviewWorktree.ts";

for (const mode of ["story-branch", "trunk"] as const) {
  test(`a Taken adapter ${mode} story compares the completed ancestor of its running tip`, async ({
    page,
    origin,
    dashboard,
    github,
  }) => {
    const setup =
      mode === "trunk"
        ? await publishTakenComparedTrunk(page, origin)
        : await publishTakenComparedStoryBranch(page, origin);
    const branch = "branch" in setup ? setup.branch : "main";
    const completed = "branchTip" in setup ? setup.branchTip : setup.trunkTip;
    const workspace =
      mode === "trunk"
        ? origin.project
        : path.join(origin.machine, "another-agent-workspace");
    writeAt(workspace, "src/pending.ts", "published while CI is running\n");
    commitAll(workspace, "advance the live tip");
    git(workspace, "push", "--quiet", "origin", `HEAD:refs/heads/${branch}`);
    const tip = git(workspace, "rev-parse", "HEAD");

    const ancestor = {
      ...passed("pipeline", "complete", completed, branch),
      time: "2026-11-05T10:06:30Z",
      startedAt: "2026-11-05T10:00:00Z",
      completedAt: "2026-11-05T10:06:30Z",
    };
    const running = {
      ...passed("pipeline", "still-running", tip, branch),
      outcome: "pending",
      time: "2026-11-05T10:10:00Z",
    };
    const baseline = passed("baseline", "before", setup.baseline, "main");
    const adapter = adapterProject(dashboard.home);
    const answer = (attempts: readonly unknown[]) => {
      adapter.answer({
        discover:
          branch === "main"
            ? { main: [baseline, ...attempts] }
            : { main: [baseline], [branch]: attempts },
        proof: { unavailable: "no proof kept" },
      });
    };
    // Call the comparison boundary alone, so unrelated board and CI status
    // requests cannot stand in for or obscure its request accounting.
    answer([running]);
    const before = github.calls.length;
    const comparison = await rawRequest({
      url: `${dashboard.baseURL}${authenticatedReadEndpoint}?source=open-dough&intent=ci-comparison&identity=${encodeURIComponent(setup.identity)}`,
      headers: { Origin: dashboard.origin },
    });
    expect(comparison.status).toBe(200);
    const live = mode === "trunk" ? "provisional" : "branch";
    expect(JSON.parse(comparison.body) as unknown).toMatchObject({
      kind: "comparison",
      [live]: {
        kind: "running",
        revision: tip,
        adapterAttempt: { runId: "pipeline", attemptId: "still-running" },
      },
    });
    expect(github.calls.slice(before)).toEqual([]);
    expect(adapter.discoverRequests()).toEqual(
      expect.arrayContaining(
        [...new Set(["main", branch])].map((asked) => ({
          operation: "discover",
          check: { repo: "terryyin/open-dough", branch: asked },
        })),
      ),
    );
    expect(adapter.discoverRequests()).toHaveLength(branch === "main" ? 1 : 2);

    answer([ancestor, running]);
    const { panel } = await selectTakenStoryForCiComparison(page);
    const row = panel.getByRole("row").filter({
      has: page.getByRole("rowheader", {
        name: mode === "trunk" ? "Provisional" : "Branch",
        exact: true,
      }),
    });
    await expect(row).toContainText(shortSha(completed));
    await expect(row).toContainText("provisional");
    await expect(row).toContainText("ancestor");
    await expect(row).toContainText("a later attempt is still running");
    await expect(row.locator(".intent-ci-comparison-wall")).toHaveText(
      "6 min 30 s",
    );
    await expect(
      panel.locator(".intent-ci-comparison-wall").first(),
    ).toHaveText("Not recorded");
    await expect(
      panel.locator(".intent-ci-comparison-identity").last(),
    ).toHaveText(notLandedYetExplanation);
  });
}
