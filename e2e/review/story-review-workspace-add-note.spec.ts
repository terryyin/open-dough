// Real Taken workspace: notes retain the displayed comparison and line.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  storyA,
  storyB,
} from "../../Distribution/tests/support/queued-repository.mjs";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import {
  commitAll,
  expandContextFile,
  expandContextLines,
  git,
} from "../../dashboard/tests/support/storyReviewWorktree.ts";
import { storyALaunch } from "../../dashboard/tests/support/storyLaunchRecord.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import { openReview } from "../../dashboard/tests/support/reviewRead.ts";
import { parts } from "../../dashboard/tests/dashboardPage.ts";
import { showColumn } from "../../dashboard/tests/boardPage.ts";
import { fileDiff } from "../../dashboard/tests/support/reviewTreeRows.ts";
import { storyNotesPage } from "../../dashboard/tests/support/storyNotesPage.ts";
import { closeSidePanel } from "../../dashboard/tests/sidePanelFrame.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import { comparisonChoice } from "../../dashboard/tests/support/storyReviewMark.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";

test("Taken workspace offers Add note alone and saves file and line context", async ({
  page,
  dashboard,
  origin,
}) => {
  writeFileSync(
    path.join(origin.project, expandContextFile),
    expandContextLines("line", 160),
  );
  commitAll(origin.project, "workspace note baseline");
  git(origin.project, "push", "--quiet", "origin", "main");
  const taken = await origin.publishTake({
    agent: "Yui",
    story: storyA,
    queued: [storyB],
    mode: "story-branch",
  });
  writeFileSync(
    path.join(taken.workspace, expandContextFile),
    expandContextLines("line", 160).replace(
      "line 54\n",
      "workspace fifty-four\n",
    ),
  );
  commitAll(taken.workspace, "workspace note change");
  keepLaunchRecords(dashboard, [
    storyALaunch()
      .onStoryBranch({ workspace: taken.workspace, branch: taken.branch })
      .please(),
  ]);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: git(origin.origin, "rev-parse", "main"),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await showColumn(page, "Taken");
  const card = parts(page).taken.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const reading = page.waitForResponse(
    (response) => new URL(response.url()).pathname === storyReviewEndpoint,
  );
  const review = await openReview(page, card);
  const snapshot = storyReviewSchema.parse(await (await reading).json());
  if (snapshot.kind !== "snapshot") throw new Error("No workspace snapshot");
  const expectedComparison = `All changes ${snapshot.baseline} → ${snapshot.tree}`;
  await expect(
    comparisonChoice(review, "All changes", { exact: true }),
  ).toBeChecked();
  const diff = fileDiff(review, `Modified ${expandContextFile}`, {
    exact: true,
  });
  const notes = storyNotesPage(page);
  await notes.fromFile(diff);
  await notes.expectComposerContext([
    "Story A",
    "All changes",
    expandContextFile,
    expectedComparison,
  ]);
  await notes.expectNoComposerLine();
  await notes.type("Workspace file observation");
  await notes.save();
  await notes.expectDiffSaved();
  await notes.fromLine(diff, "new", 54, ["Add note"]);
  await notes.expectComposerContext([
    "All changes",
    "Line 54 · new",
    "workspace fifty-four",
  ]);
  await notes.type("Workspace line observation");
  await notes.save();
  await notes.expectDiffSaved();
  await closeSidePanel(review);
  await notes.open(card);
  await notes.expectNotes([
    "Workspace line observation",
    "Workspace file observation",
  ]);
  await notes.expectEntryContext(0, "workspace fifty-four");
  await notes.expectEntryContext(0, expectedComparison);
  await notes.close();
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    machine: origin.machine,
    github: dashboard.github,
    projectFolders: ["open-dough"],
    port,
  });
  try {
    await page.reload();
    await showColumn(page, "Taken");
    await notes.open(card);
    await notes.expectNotes([
      "Workspace line observation",
      "Workspace file observation",
    ]);
    for (const text of [
      storyA.title,
      storyA.identity,
      "Review changes",
      expandContextFile,
      expectedComparison,
      "Line 54 · new",
      "workspace fifty-four",
    ])
      await notes.expectEntryContext(0, text);
  } finally {
    await restarted.close();
  }
});
