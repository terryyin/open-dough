import { filesColumn } from "../intentModePage.ts";
// A default comparison is not a remembered run choice. Switching from one
// story's valid captured fallback to another story must use its server default.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { storyB } from "../../../tests/support/queued-repository.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { parts } from "../dashboardPage.ts";
import { expandIntentGroup, purposeRegion } from "../intentPerspectivePage.ts";
import { recentlyDoneParts } from "../recentlyDoneSessionsSidebarPage.ts";
import { openSessionsSidebar } from "../sessionsSidebarPage.ts";
import { expect, stored, test } from "../support/codexStart.ts";
import { publishCompletedStory } from "../support/completedStoryPublication.ts";
import { holdNextReviewResponse } from "../support/holdReviewResponse.ts";
import {
  chooseStoryTab,
  intentDiff,
  intentFile,
  storySummary,
} from "../support/intentStoryPage.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import {
  capturedPublicationSchema,
  scripts,
} from "../support/launchLanding.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { selectDoneStoryInIntent } from "../support/selectDoneStoryInIntent.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import { claimedLaunchWithStoryCommit } from "../support/storyBranchIntegration.ts";
import { commitAll, git, lines } from "../support/storyReviewWorktree.ts";

test.beforeAll(({ queuedCodexOriginReady }) =>
  Promise.resolve(queuedCodexOriginReady),
);

test("selecting another Done story follows its published default instead of retaining an automatic captured run", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  publishIntentTrunk(origin.project);
  const firstFacts = makeMe.aRepository
    .withRevision("first-story", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": `${lines("a")}first story completion\n`,
      },
    })
    .please().revisions[0];
  const first = await claimedLaunchWithStoryCommit(origin, dashboard, false, {
    host: "codex",
    storyWork(workspace) {
      writeRevisionFiles(workspace, firstFacts);
      execFileSync(
        process.execPath,
        [
          path.join(
            scripts(workspace, "dough-product-backlog"),
            "product-backlog.mjs",
          ),
          "complete",
          "--identity",
          queuedIdentity,
        ],
        { cwd: workspace, stdio: "pipe" },
      );
      commitAll(workspace, "complete the first captured story");
    },
  });
  const firstCapture = capturedPublicationSchema.parse(await first.integrated())
    .landing.receipt;
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  const second = await origin.publishTake({
    agent: "Yui",
    story: storyB,
    queued: [],
    mode: "trunk",
    slug: "completed-b",
  });
  const location = makeMe.anIntentLocation
    .at("second/tests")
    .ofKind("typescript", ["**/*.spec.ts"])
    .please();
  const settings = makeMe.intentSettings.withLocations(location).please();
  const secondFacts = makeMe.aRepository
    .withRevision("second-story", {
      backlog: null,
      files: {
        ".planning/open-dough.json": JSON.stringify(settings),
        "second/tests/b.spec.ts": "second story published source\n",
      },
    })
    .please().revisions[0];
  writeRevisionFiles(second.workspace, secondFacts);
  commitAll(second.workspace, "second story changes its own location");
  git(second.workspace, "push", "--quiet", "origin", "HEAD:main");
  const secondCompletion = publishCompletedStory(origin, {
    ...second,
    mode: "trunk",
    identity: storyB.identity,
    missingAgent: false,
    completionConflict: false,
    skillsDirectory: ".agents/skills",
  });
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  const later = makeMe.aRepository
    .withRevision("later", {
      backlog: null,
      files: { "after-both.txt": "later trunk\n" },
    })
    .please().revisions[0];
  writeRevisionFiles(origin.project, later);
  commitAll(origin.project, "later trunk after both stories");
  git(origin.project, "push", "--quiet", "origin", "main");
  const current = git(origin.project, "rev-parse", "HEAD");
  const now = new Date().toISOString();
  const legacy = makeMe.aLaunchRecord
    .executing({ identity: storyB.identity, title: storyB.title })
    .onStoryBranch({
      workspace: path.join(origin.machine, "retired-story-b"),
      branch: "codex/retired-b",
    })
    .inClaudeSession({ sessionId: "legacy-story-b", shortId: "legacy-b" })
    .launchedAt(now)
    .markedDoneAt(now)
    .please();
  keepLaunchRecords(dashboard, [...stored(dashboard.home), legacy]);
  git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: current,
    repository: "terryyin/open-dough",
    follows: true,
  });
  const firstRead = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("identity") === queuedIdentity &&
      url.searchParams.get("historical") === "true"
    );
  });
  const { intent } = await selectDoneStoryInIntent(page);
  expect(storyReviewSchema.parse(await (await firstRead).json())).toMatchObject(
    {
      kind: "landed",
      tree: firstCapture.revision,
      selectedRun: first.reporting.reference,
    },
  );
  await expect(storySummary(intent)).toHaveAttribute("data-state", "compared");

  git(origin.project, "fetch", "--quiet", "--unshallow", "origin", "main");
  const runRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === storyReviewEndpoint && url.searchParams.has("run"))
      runRequests.push(url.searchParams.get("run") ?? "");
  });
  const held = await holdNextReviewResponse(
    page,
    dashboard.origin,
    storyReviewEndpoint,
  );
  try {
    await openSessionsSidebar(page);
    const sessions = recentlyDoneParts(page);
    await sessions.header.click();
    await sessions.select(storyB.title).click();
    const answer = storyReviewSchema.parse(await (await held.ready).json());
    expect(answer).toMatchObject({
      kind: "published",
      completion: secondCompletion,
    });
    expect(answer.runs).toContainEqual(
      expect.objectContaining({
        workflow: "execution",
        key: "claude:legacy-story-b",
      }),
    );
    expect(answer.selectedRun).toBeUndefined();
    await expect(intent).toHaveAttribute(
      "data-selected-story",
      storyB.identity,
    );
    await expect(filesColumn(intent)).toHaveCount(0);
    await expect(purposeRegion(intent)).toHaveCount(0);
    held.release();
    await held.delivery;
    await expect(storySummary(intent)).toHaveAttribute(
      "data-state",
      "compared",
    );
    await chooseStoryTab(intent, "Changed tests");
    await expandIntentGroup(intent, "second/tests");
    await expect(intentFile(intent, "dashboard/tests/a.spec.ts")).toHaveCount(
      0,
    );
    expect(await intentDiff(intent, "Added second/tests/b.spec.ts")).toContain(
      "second story published source",
    );
    expect(runRequests).toEqual([]);
  } finally {
    held.release();
    await held.delivery;
  }
  await expect(parts(page).intent).toHaveAttribute(
    "data-selected-story",
    storyB.identity,
  );
});
