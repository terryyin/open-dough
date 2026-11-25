// A saved preparation run cannot replace a later completed story's history.
// Both the refinement capture and the execution completion use real installed
// publication; the Done reader chooses their meaning, not a fabricated answer.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { trackStoryResultReads } from "../../dashboard/test-support/support/storyResultRequests.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/codexStart.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import {
  chooseStoryTab,
  folderToggle,
  intentDiff,
  intentFile,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import { capturedChoice } from "../../dashboard/test-support/support/oneShotReviewChoices.ts";
import { selectDoneStoryInIntent } from "../../dashboard/test-support/support/selectDoneStoryInIntent.ts";
import { publishDeclaredTrunk } from "../../dashboard/test-support/support/storyCiComparisonBaseline.ts";
import {
  git,
  lines,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

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
  const { completion } = await publishDeclaredTrunk(
    origin,
    intentTrunkCompletionOntoTip({ implementation }),
  );
  const { inventory: locations, text: sourceReads } = trackStoryResultReads(
    page,
    unchanged,
  );
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
  await chooseStoryTab(intent, "Changes");
  await expandIntentGroup(intent, "dashboard/tests");
  const original = await intentDiff(intent, modified);
  expect(original).toContain("the completed execution test");
  expect(locations).toContain(completion);
  expect(locations).not.toContain(refinement.receipt.revision);
  await folderToggle(intent, "boundary", false).click();
  await intentFile(intent, unchanged).click();
  await expect(purposeRegion(intent)).toContainText("kept 11");
  expect(sourceReads).toEqual([completion]);
});
