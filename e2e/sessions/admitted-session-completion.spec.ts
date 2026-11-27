import { existsSync, mkdirSync, mkdtempSync } from "node:fs";
import path from "node:path";
import { doneRecordFileName } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import {
  expect,
  test as preparationTest,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  admitForCompletion,
  finishAdmittedClaim,
  landNativeWork,
} from "../../dashboard/test-support/support/admittedSessionCompletion.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { publishedSessionOnDoneStory } from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { openPublishedSessionReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../dashboard/test-support/support/dashboardServer.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import { intentStory } from "../../dashboard/test-support/support/intentStoryPage.ts";
import { launchStoreFile } from "../../dashboard/test-support/support/launchStore.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { selectDoneStoryInIntent } from "../../dashboard/test-support/support/selectDoneStoryInIntent.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { trunkCommitFromAnotherWriter } from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { git } from "../../dashboard/test-support/support/storyReviewWorktree.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

async function clonePublishedWork(
  dashboard: DashboardServer,
  origin: StartOrigin,
) {
  const machine = mkdtempSync(path.join(origin.machine, "fresh-reader-"));
  const clone = path.join(machine, "home", "git", "open-dough");
  mkdirSync(path.dirname(clone), { recursive: true });
  git(machine, "clone", "--quiet", origin.origin, clone);
  git(
    clone,
    "remote",
    "set-url",
    "origin",
    gitHubRepositoryUrl("terryyin/open-dough"),
  );
  const reader = await startDashboardServer({
    mode: "preview",
    prebuilt: dashboard.outDir ?? sharedDashboardBuild,
    github: dashboard.github,
    machine,
    projectFolders: ["open-dough"],
  });
  return { clone, reader };
}

const test = preparationTest.extend<{
  openFreshClone: () => ReturnType<typeof clonePublishedWork>;
}>({
  openFreshClone: async ({ dashboard, origin }, use) => {
    let reader: DashboardServer | undefined;
    try {
      await use(async () => {
        const opened = await clonePublishedWork(dashboard, origin);
        reader = opened.reader;
        return opened;
      });
    } finally {
      await reader?.close();
    }
  },
});

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const title = "Verify the published session";
const file = "dashboard/tests/admitted.spec.ts";
const later = "unrelated-later.txt";
const specification = ".planning/PRODUCT-BACKLOG.md";
const borrowedNotes = "borrowed-notes.txt";

function readBorrowedCheckout(workspace: string) {
  return [
    git(workspace, "rev-parse", "HEAD"),
    git(workspace, "show", `:${borrowedNotes}`),
    git(workspace, "diff", "--", borrowedNotes),
  ];
}

test("a fresh clone reads the retired admission's story and its exact published session ranges", async ({
  page,
  dashboard,
  origin,
  openFreshClone,
}) => {
  const admitted =
    await test.step("Given an admitted story launches in a borrowed checkout", () => {
      publishIntentTrunk(origin.project);
      return admitForCompletion(dashboard, origin, title);
    });
  const landed =
    await test.step("And the borrowed session publishes its product change", () =>
      landNativeWork(admitted, file));
  await test.step("And the borrowed checkout has staged and unstaged developer edits", () => {
    makeMe
      .theWorkspace(origin.project)
      .writeAt(borrowedNotes, "staged developer notes\n")
      .please();
    git(origin.project, "add", borrowedNotes);
    makeMe
      .theWorkspace(origin.project)
      .writeAt(borrowedNotes, "unstaged developer notes\n")
      .please();
  });
  const borrowed =
    await test.step("And we have the borrowed checkout's HEAD, index and edits", () =>
      readBorrowedCheckout(origin.project));
  const final =
    await test.step("When Story Wrap Up closes the owned claim", () =>
      finishAdmittedClaim(admitted, landed));
  await test.step("Then the owned checkout retires and the borrowed checkout keeps the same HEAD, index and edits", () => {
    expect(existsSync(admitted.claim.workspace)).toBe(false);
    expect(readBorrowedCheckout(origin.project)).toEqual(borrowed);
  });
  await test.step("Given another writer advances trunk after closure", async () => {
    const advanced = trunkCommitFromAnotherWriter(origin, later);
    expect(advanced).not.toBe(final);
    await publishCommittedOrigin(dashboard.github, {
      repoDir: origin.origin,
      revision: advanced,
      repository: "terryyin/open-dough",
      follows: true,
    });
  });
  const { clone, reader } = await test.step(
    "When another machine clones published trunk",
    openFreshClone,
  );
  const record: unknown =
    await test.step("Then it can read the session record without local launch storage", (): unknown => {
      expect(existsSync(launchStoreFile(reader))).toBe(false);
      const record = sessionRecordPathBeside(
        specification,
        admitted.reporting.reference,
      );
      return JSON.parse(git(clone, "show", `HEAD:${record}`));
    });
  await test.step("And the published session names the story and both comparisons in order", () => {
    expect(record).toMatchObject({
      sessionId: admitted.reporting.reference,
      story: admitted.identity,
      ranges: [
        { base: admitted.claim.publishedSha, candidate: landed },
        { base: landed, candidate: final },
      ],
    });
  });
  const review =
    await test.step("When the reader opens that Recently done session's review", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto(reader.baseURL);
      return openPublishedSessionReviewChanges(
        page,
        publishedSessionOnDoneStory(
          parts(page).recentlyDone,
          title,
          admitted.reporting.reference,
        ),
      );
    });
  await test.step("Then Intent shows that session's first comparison: the native edit without later work", async () => {
    await review.expectStory(title);
    await review.files.expectOnlyChangedFile(`Added ${file}`);
    await review.files.choose(`Added ${file}`);
    await review.diffs.expectLines("added", ["+Accepted native work"]);
    await review.files.expectTreeLacksText(later);
  });
  await test.step("And the comparison has no shared checkout warning", () =>
    review.context.expectSharedCheckoutWarning(false));
  await test.step("When the reader chooses the second comparison", () =>
    review.comparison.choosePublishedRange("Published range 2 of 2"));
  await test.step("Then it shows the Done record and omits the product change and later work", async () => {
    await review.files.expectChangedFiles([
      `Added .planning/done/${doneRecordFileName(admitted.identity)}`,
    ]);
    await review.files.expectTreeLacksText(file, later);
  });
  const { intent } =
    await test.step("When the reader opens the completed story in Intent", async () => {
      await review.returnToDevelopment();
      return selectDoneStoryInIntent(page, title, undefined, reader.baseURL);
    });
  await test.step("Then Intent shows the completed story and its original closure revision", async () => {
    const story = intentStory(intent);
    await expect(story.title).toHaveText(title);
    await story.headerDetail();
    await story.browseFiles();
    await expect(story.header.publishedCompletion).toHaveText(final);
  });
  await test.step("And published reading still needs no local launch storage", () => {
    expect(existsSync(launchStoreFile(reader))).toBe(false);
  });
});
