import { sourceRevision } from "../intentCodeBrowsePage.ts";
// Done Intent prefers its published completion, recovering the same completed
// result from a validated capture when configured history becomes shallow.
// The real installed integration captures the completed execution; ordinary
// live Review and multiple retained choices stay covered in the review suite.
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
import {
  chooseStoryTab,
  intentDiff,
  folderToggle,
  intentFile,
  openReviewFromIntent,
  reviewDiff,
} from "../support/intentStoryPage.ts";
import { retainedIntentLanding } from "../support/retainedIntentLanding.ts";
import { selectDoneStoryInIntent } from "../support/selectDoneStoryInIntent.ts";
import { trunkCommitFromAnotherWriter } from "../support/storyBranchIntegration.ts";
import { git, lines } from "../support/storyReviewWorktree.ts";

// This installed queued origin is input to the real native journey. Its
// maintained owner prepares it before the first test's budget starts; every
// case still performs its own launch, completion, capture and browser reads.
test.beforeAll(({ queuedCodexOriginReady }) =>
  Promise.resolve(queuedCodexOriginReady),
);

const modified = "Modified dashboard/tests/a.spec.ts";
const unchanged = "dashboard/tests/boundary/kept.spec.ts";

for (const history of ["published", "capture"] as const)
  test(`a Done story with a readable retained workspace uses ${history === "published" ? "published completion" : "validated capture recovery"} for original diff, inventory and unchanged source`, async ({
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
    if (history === "capture")
      git(origin.project, "fetch", "--quiet", "--depth=1", "origin", "main");
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
    if (history === "published") {
      expect(answer).toMatchObject({ kind: "published", completion: accepted });
      expect(answer.selectedRun).toBeUndefined();
    } else {
      expect(answer).toMatchObject({
        kind: "landed",
        baseline: story.trunkTip,
        tree: accepted,
        selectedRun: story.reporting.reference,
      });
    }
    await chooseStoryTab(intent, "Changed tests");
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
    await openReviewFromIntent(page, intent);
    expect(await reviewDiff(page, modified)).toBe(original);
  });
