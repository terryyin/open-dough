// A saved preparation run cannot replace a later completed story's history.
// Both the refinement capture and the execution completion use real installed
// publication; the Done reader chooses their meaning, not a fabricated answer.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../../tests/support/repository-revision-files.mjs";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../src/storyReviewContract.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { expandIntentGroup, purposeRegion } from "../intentPerspectivePage.ts";
import { expect, test } from "../support/codexStart.ts";
import { completedPublishedStory } from "../support/completedPublishedStory.ts";
import {
  chooseStoryTab,
  folderToggle,
  intentDiff,
  intentFile,
  openReviewFromIntent,
  reviewDiff,
} from "../support/intentStoryPage.ts";
import { publishIntentTrunk } from "../support/intentStoryWorktree.ts";
import { capturedChoice } from "../support/oneShotReviewChoices.ts";
import { selectDoneStoryInIntent } from "../support/selectDoneStoryInIntent.ts";
import { git, lines } from "../support/storyReviewWorktree.ts";

const modified = "Modified dashboard/tests/a.spec.ts";
const unchanged = "dashboard/tests/boundary/kept.spec.ts";

test.beforeAll(({ queuedCodexOriginReady }) =>
  Promise.resolve(queuedCodexOriginReady),
);

test("a Done story reads its published execution instead of an earlier refinement capture", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("No native fixture");
  publishIntentTrunk(origin.project);
  const implementation = makeMe.aRepository
    .withRevision("execution", {
      backlog: null,
      files: {
        "dashboard/tests/a.spec.ts": `${lines("a")}the completed execution test\n`,
      },
    })
    .please().revisions[0];
  const refinement = await capturedChoice(
    dashboard,
    origin,
    codexProtocol,
    "earlier-refinement",
  );
  git(origin.project, "pull", "--quiet", "--ff-only", "origin", "main");
  const { completion } = await completedPublishedStory(
    origin,
    "trunk",
    undefined,
    (workspace) => {
      writeRevisionFiles(workspace, implementation);
    },
    undefined,
    { skillsDirectory: ".agents/skills" },
  );
  const locations: string[] = [];
  const sourceReads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    if (url.searchParams.get("intent") === "locations")
      locations.push(url.searchParams.get("revision") ?? "");
    if (url.searchParams.get("path") === unchanged)
      sourceReads.push(url.searchParams.get("revision") ?? "");
  });
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: completion,
    repository: "terryyin/open-dough",
  });
  const received = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("historical") === "true"
    );
  });
  const { intent } = await selectDoneStoryInIntent(page);
  const answer = storyReviewSchema.parse(await (await received).json());
  expect(answer).toMatchObject({ kind: "published", completion });
  expect(answer.selectedRun).toBeUndefined();
  await chooseStoryTab(intent, "Changed tests");
  await expandIntentGroup(intent, "dashboard/tests");
  const original = await intentDiff(intent, modified);
  expect(original).toContain("the completed execution test");
  expect(locations).toContain(completion);
  expect(locations).not.toContain(refinement.receipt.revision);
  await folderToggle(intent, "boundary", false).click();
  await intentFile(intent, unchanged).click();
  await expect(purposeRegion(intent)).toContainText("kept 11");
  expect(sourceReads).toEqual([completion]);
  await openReviewFromIntent(page, intent);
  expect(await reviewDiff(page, modified)).toBe(original);
});
