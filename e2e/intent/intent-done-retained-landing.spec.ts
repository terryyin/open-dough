import { sourceRevision } from "../../dashboard/test-support/intentCodeBrowsePage.ts";
// Done Intent reads the published completion and explains when configured
// history cannot establish it, even with a retained launch and workspace.
// The real installed integration captures the completed execution; ordinary
// live Review and multiple retained choices stay covered in the review suite.
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { writeRevisionFiles } from "../../Distribution/tests/support/repository-revision-files.mjs";
import { trackStoryResultReads } from "../../dashboard/test-support/support/storyResultRequests.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
} from "../../dashboard/src/storyReviewContract.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { filesColumn } from "../../dashboard/test-support/intentModePage.ts";
import {
  expandIntentGroup,
  purposeRegion,
} from "../../dashboard/test-support/intentPerspectivePage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/codexStart.ts";
import {
  chooseStoryTab,
  intentDiff,
  folderToggle,
  intentFile,
} from "../../dashboard/test-support/support/intentStoryPage.ts";
import { retainedIntentLanding } from "../../dashboard/test-support/support/retainedIntentLanding.ts";
import { selectDoneStoryInIntent } from "../../dashboard/test-support/support/selectDoneStoryInIntent.ts";
import { trunkCommitFromAnotherWriter } from "../../dashboard/test-support/support/storyBranchIntegration.ts";
import { shallowPublishedHistory } from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";
import {
  git,
  lines,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

// This installed queued origin is input to the real native journey. Its
// maintained owner prepares it before the first test's budget starts; every
// case still performs its own launch, completion, capture and browser reads.
test.beforeAll(({ queuedCodexOriginReady }) =>
  Promise.resolve(queuedCodexOriginReady),
);

const modified = "Modified dashboard/tests/a.spec.ts";
const unchanged = "dashboard/tests/boundary/kept.spec.ts";

for (const history of ["published", "shallow"] as const)
  test(`a Done story with a retained workspace ${history === "published" ? "reads its original published diff and inventory" : "explains its shallow published history"}`, async ({
    page,
    dashboard,
    origin,
    codexProtocol,
  }) => {
    if (codexProtocol === undefined) throw new Error("No native fixture");
    const implementation = makeMe.aRepository
      .withRevision("execution", {
        backlog: null,
        files: {
          "dashboard/tests/a.spec.ts": `${lines("a")}captured story test\n`,
        },
      })
      .please().revisions[0];
    const { story, accepted } = await retainedIntentLanding(
      dashboard,
      origin,
      codexProtocol,
      implementation,
      // The later writer below supplies this reading's conflicting trunk;
      // an unrelated writer before integration adds no relevant evidence.
      { trunkAdvanced: false },
    );
    const later = makeMe.aRepository
      .withRevision("later-trunk", {
        backlog: null,
        remove: [".planning/open-dough.json", "dashboard/tests/a.spec.ts"],
        files: {
          "dashboard/tests/current-a.spec.ts": "later trunk renamed test\n",
          "dashboard/tests/later.spec.ts": "later-only test\n",
          [unchanged]: "later trunk rewrites unchanged source\n",
        },
      })
      .please().revisions[0];
    const published = trunkCommitFromAnotherWriter(
      origin,
      "after-completion.txt",
      (writer) => {
        writeRevisionFiles(writer, later);
      },
    );
    if (history === "shallow") shallowPublishedHistory(origin);
    const local = makeMe.aRepository
      .withRevision("retained-local", {
        backlog: null,
        files: {
          "dashboard/tests/a.spec.ts": "local edit after landing\n",
          "dashboard/tests/local.spec.ts": "local-only test\n",
          [unchanged]: "local rewrites unchanged source\n",
        },
      })
      .please().revisions[0];
    writeRevisionFiles(story.workspace, local);
    expect(git(story.workspace, "status", "--porcelain")).toContain(
      "dashboard/tests/a.spec.ts",
    );
    const { inventory: locations, text: sourceReads } = trackStoryResultReads(
      page,
      unchanged,
    );
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: published,
      repository: "terryyin/open-dough",
      follows: true,
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
    if (history === "shallow") {
      expect(answer).toMatchObject({
        kind: "unavailable",
        explanation: expect.stringMatching(
          /published .*history|published completion/i,
        ),
      });
      await chooseStoryTab(intent, "Changes");
      await expect(filesColumn(intent)).toHaveCount(0);
      expect(locations).not.toContain(accepted);
      expect(sourceReads).toEqual([]);
      return;
    }
    expect(answer).toMatchObject({ kind: "published", completion: accepted });
    expect(answer.selectedRun).toBeUndefined();
    await chooseStoryTab(intent, "Changes");
    await expandIntentGroup(intent, "dashboard/tests");
    await expect(intentFile(intent, modified)).toBeVisible();
    for (const path of ["current-a", "later", "local"])
      await expect(
        intentFile(intent, `dashboard/tests/${path}.spec.ts`),
      ).toHaveCount(0);
    expect(locations).toContain(accepted);
    await folderToggle(intent, "boundary", false).click();
    await intentFile(intent, unchanged).click();
    const purpose = purposeRegion(intent);
    await expect(purpose).toContainText("kept 11");
    await expect(purpose).not.toContainText("rewrites unchanged source");
    await expect(sourceRevision(intent, unchanged)).toContainText(
      `at revision ${accepted.slice(0, 7)}`,
    );
    expect(sourceReads).toEqual([accepted]);
    const original = await intentDiff(intent, modified);
    expect(original).toContain("captured story test");
    expect(original).not.toContain("local edit after landing");
  });
