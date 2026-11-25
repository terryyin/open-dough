// The automatic check follows every published branch: while trunk stays
// still, one conditional listing of every branch head tells the page when a
// story branch a Taken profile records has moved, and only that story's
// progress is read again -- its plan and its commit time at the new head --
// without Refresh. Other branches moving read nothing; trunk moving reads
// the whole snapshot as before; an unchanged listing is answered by GitHub's
// `304`; a completion commit on the recorded branch shows the story awaiting
// wrap-up; a recorded branch deleted becomes that gap. The fake GitHub only
// publishes trunk and branch heads that move (../../dashboard/test-support/publishedFiles.ts); the local
// read boundary, the shared readers, and the page decide everything shown.
// A recorded branch whose name cannot be used:
// ./auto-refresh-unusable-branch.spec.ts. Hidden-page and rate-limit
// behavior: ./auto-refresh-visibility.spec.ts and
// ./auto-refresh-rate-limit.spec.ts.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  githubFor,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  callsSince,
  expectSteadyPace,
  passTimeUntilChecked,
  headsCheckArgv,
  headsChecks,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  branches,
  onBranch,
  planPath,
  repository,
} from "../../dashboard/test-support/branchProgressRecords.ts";
import {
  branchPlanChange,
  openedSettled,
  sevenDoneOnBranch,
} from "../../dashboard/test-support/branchRefreshJourney.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import {
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { progressSource } from "../../dashboard/test-support/storyCardFacts.ts";
import { untilPageReadsAnswered } from "../../dashboard/test-support/pageRequestNotes.ts";
import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";

const example = "story/example";
const unrelated = "story/unrelated-work";
const completedPlan = makeMe.aSlicePlan
  .withStatuses(
    ["done", "done", "done", "done", "done", "done", "done", "done"],
    { advice: "Queue the next story." },
  )
  .please();

test("the automatic check follows each recorded story branch, reading only the progress on a branch that moved", async ({
  page,
  dashboard,
  afterGitHubStops,
}) => {
  const { origin, progress } = await openedSettled(page, afterGitHubStops, {
    advances: [
      {
        name: "moved",
        parent: example,
        facts: { files: branchPlanChange(sevenDoneOnBranch) },
      },
      {
        name: "complete",
        parent: "moved",
        facts: { files: branchPlanChange(completedPlan) },
      },
      { name: "unrelated", parent: "trunk" },
      { name: "nextTrunk", parent: "trunk" },
    ],
  });
  const revision = origin.at("trunk").revision;
  const moved = origin.at("moved");
  const completed = origin.at("complete");
  const trunkMoved = origin.at("nextTrunk").revision;
  const branchHead = origin.at(example).revision;
  const { taken, readRevision } = parts(page);
  const routed = (branch: string) =>
    remoteBranchHead(gitHubRepositoryUrl(repository), `refs/heads/${branch}`, {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    });
  expect(await routed("main")).toBe(revision);
  expect(await routed(example)).toBe(branchHead);
  const initialHeads = Object.fromEntries(
    Object.keys(branches).map((branch) => [branch, origin.at(branch).revision]),
  );
  // The card qualifies its count briefly; the exact branch head is in the
  // story's detail, which stays open as the branch moves.
  await expect(progress).toContainText("From story branch; not in trunk.");
  const branchSource = progressSource(
    await inspectedDetail(storyCard(taken, onBranch)),
  );
  await expect(branchSource).toContainText(
    `From branch ${example} at ${shortRevision(branchHead)}; not in trunk.`,
  );
  await expect(progress).toContainText("Current slice started 7 min ago");

  await test.step("while nothing moves, checks read nothing, and a repeated check is answered by GitHub's 304", async () => {
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    expectSteadyPace(await passTimeUntilChecked(page));
    const calls = callsSince(page, from);
    expect(headsChecks(calls).map(({ argv }) => argv)).toEqual([
      headsCheckArgv(undefined, repository),
      // Conditional on the listing still naming every head as shown.
      headsCheckArgv(revision, repository, initialHeads),
    ]);
    expect(readsBesideChecks(calls)).toEqual([]);
  });

  await test.step("a new slice commit on the recorded branch shows its count and a restarted clock within the check pace, reading only its plan and commit time there", async () => {
    const now = await page.evaluate(() => Date.now());
    origin.moveBranch(example, {
      ...moved,
      committed: { [planPath("on-branch")]: new Date(now - 2 * 60_000) },
    });
    expect(await routed(example)).toBe(moved.revision);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(
      progress.getByRole("img", { name: "7 of 8 slices recorded complete" }),
    ).toBeVisible();
    await expect(branchSource).toContainText(
      `From branch ${example} at ${shortRevision(moved.revision)}; not in trunk.`,
    );
    await expect(progress).toContainText("Current slice started 2 min ago");
    await expect(readRevision).toContainText(shortRevision(revision));
    expect(readsBesideChecks(callsSince(page, from)).sort()).toEqual(
      [
        `content ${planPath("on-branch")}@${moved.revision}`,
        `commit-list ${planPath("on-branch")}@${moved.revision}`,
      ].sort(),
    );
  });

  await test.step("an unrelated branch moving reads nothing further", async () => {
    origin.moveBranch(unrelated, origin.at("unrelated"));
    expect(await routed(unrelated)).toBe(origin.at("unrelated").revision);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    // The next check comes at the steady pace: nothing was read between.
    expectSteadyPace(await passTimeUntilChecked(page));
    expect(readsBesideChecks(callsSince(page, from))).toEqual([]);
    await expect(
      progress.getByRole("img", { name: "7 of 8 slices recorded complete" }),
    ).toBeVisible();
  });

  await test.step("trunk moving reads the whole snapshot at its new revision, as before", async () => {
    origin.moveTrunk({ ...origin.at("trunk"), revision: trunkMoved });
    expect(await routed("main")).toBe(trunkMoved);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(readRevision).toContainText(shortRevision(trunkMoved));
    // The shown progress stays while the new revision is read, so only the
    // page's own reads say the read has ended.
    await untilPageReadsAnswered(page);
    await expect(page.getByText("Reading plan slices…")).toHaveCount(0);
    await expect(page.getByText("Reading current slice time…")).toHaveCount(0);
    await expect(
      progress.getByRole("img", { name: "7 of 8 slices recorded complete" }),
    ).toBeVisible();
    const reads = readsBesideChecks(callsSince(page, from));
    expect(reads).toContain(
      `content .planning/PRODUCT-BACKLOG.md@${trunkMoved}`,
    );
    expect(reads).toContain(`branch ${example}`);
    expect(reads).not.toContain("ref main");
  });

  await test.step("a completion commit on the recorded branch shows the story awaiting wrap-up within the check pace, reading only its plan and commit time there", async () => {
    const now = await page.evaluate(() => Date.now());
    origin.moveBranch(example, {
      ...completed,
      committed: { [planPath("on-branch")]: new Date(now - 60_000) },
    });
    expect(await routed(example)).toBe(completed.revision);
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(progress).toContainText(
      "Execution complete, awaiting wrap-up",
    );
    await expect(progress).toContainText("Completed 1 min ago");
    await expect(branchSource).toContainText(
      `From branch ${example} at ${shortRevision(completed.revision)}; not in trunk.`,
    );
    await expect(progress).not.toContainText("Current slice started");
    expect(readsBesideChecks(callsSince(page, from)).sort()).toEqual(
      [
        `content ${planPath("on-branch")}@${completed.revision}`,
        `commit-list ${planPath("on-branch")}@${completed.revision}`,
      ].sort(),
    );
  });

  await test.step("the recorded branch deleted shows, at the next check, that it is no longer published", async () => {
    origin.moveBranch(example, undefined);
    expect(await routed(example)).toBeUndefined();
    const from = githubFor(page).calls.length;
    expectSteadyPace(await passTimeUntilChecked(page));
    await expect(progress).toContainText(
      `The recorded branch ${example} is no longer published`,
    );
    await expect(progress.getByRole("img")).toHaveCount(0);
    await expect(progress).not.toContainText("recorded complete");
    await expect(progress).not.toContainText("Current slice started");
    expect(readsBesideChecks(callsSince(page, from))).toEqual([]);
  });
});
