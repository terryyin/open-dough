// A Trunk Mode story's file that trunk rewrote where the story changed it
// (../../dashboard/test-support/support/storyReviewTrunkMode.ts), which Git cannot separate, is listed
// in All changes flagged as including trunk's changes, counted and diffed
// from trunk as it was before the story's first change to that file; the
// committed work alone lists it the same way. When an older published story
// commit also changed the file, it is flagged from that commit's parent, so
// the older story change shows in its diff beside the line both changed.
// Before trunk rewrites the line, the context line counts the story's one
// published commit. ./story-review-trunk-own-changes.spec.ts covers the
// files Git separates.

import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { contextWords } from "../../dashboard/test-support/support/reviewContextLine.ts";
import { keepLaunchRecord } from "../../dashboard/test-support/support/storyLaunchRecord.ts";
import {
  openIntentReviewChanges,
  type IntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  openTaken,
  publishRewrittenLine,
  shownWorkspace,
  trunkModeStory,
} from "../../dashboard/test-support/support/storyReviewTrunkMode.ts";
import {
  branch,
  git,
  storyWorktree,
} from "../../dashboard/test-support/support/storyReviewWorktree.ts";

const flagged = "Modified src/c.ts, includes trunk's changes";

// Each listed file with the tree it is flagged from.
const flags = (
  files:
    | readonly {
        readonly path: string;
        readonly includesTrunkFrom?: string | undefined;
      }[]
    | undefined,
) =>
  files?.map(({ path: file, includesTrunkFrom }) => ({
    file,
    includesTrunkFrom,
  }));

// All changes with the flagged file, from trunk before the story changed it.
const allFlaggedFrom = (beforeStory: string) => [
  { file: "d.md", includesTrunkFrom: undefined },
  { file: "notes.md", includesTrunkFrom: undefined },
  { file: "src/a.ts", includesTrunkFrom: undefined },
  { file: "src/c.ts", includesTrunkFrom: beforeStory },
];
const allRows = [
  "src",
  "  a.ts",
  "  c.ts includes trunk's changes",
  "d.md",
  "notes.md",
];

// Named tree of `o2`, before the story's first change to `src/c.ts`.
const treeBeforeStory = (
  origin: { revision(name: string): string },
  workspace: string,
) => git(workspace, "rev-parse", `${origin.revision("o2")}^{tree}`);

test.describe("rewrite after the review opens", () => {
  // One published story commit interleaved on trunk; rewrite actions stay below.
  test.use({ originRepository: trunkModeStory({ published: 1 }) });

  test("a file trunk rewrote where the story changed it is flagged as including trunk's changes", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    const first = origin.revision("o2");
    const beforeStory = treeBeforeStory(origin, workspace);
    keepLaunchRecord(dashboard, workspace);
    const card = await openTaken(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { snapshot, context } = review;

    await test.step("the context line counts one published commit", async () => {
      expect(snapshot.published).toEqual({ trunk: first, commits: 1 });
      expect(snapshot.files.map(({ path: file }) => file)).toEqual([
        "notes.md",
        "src/a.ts",
      ]);
      const words = contextWords({
        branch,
        baseline: first,
        published: 1,
        workspace: shownWorkspace,
      });
      await context.expectWords(words);
      await context.expectBaseline("origin/main less 1 story commit");
      await context.expectBaselineLacks("commits");
      await context.showInFull();
      await context.expectBaseline(
        `Baseline ${first} where ${branch} meets origin/main, less the story's 1 published commit`,
        { exact: true },
      );
      await context.expectWords(words);
      await context.showInFull(false);
    });

    const trunk = publishRewrittenLine(origin, workspace);
    const refreshed = await review.refreshAndAnswer();
    const later = refreshed.snapshot;
    const { files, diffs } = refreshed;
    const expectFlaggedDiff = async (shown: IntentReviewChanges) => {
      await shown.diffs.expectChangedLines(flagged, {
        removed: ["-c 3"],
        added: ["+c trunk"],
      });
      // Neither the story's own line nor Git's conflict markers.
      await shown.diffs.expectLacks(flagged, "c story", "<<<<<<<");
    };

    await test.step("the file is flagged, counted and diffed from trunk before the story changed it", async () => {
      expect(later.published).toEqual({ trunk, commits: 2 });
      expect(flags(later.files)).toEqual(allFlaggedFrom(beforeStory));
      await files.expectOutsideRows(allRows);
      await files.expectTrunkQualifier(flagged);
      await files.expectLineCounts(flagged, "+1 −1");
      await files.choose(flagged, "keyboard");
      await expectFlaggedDiff(refreshed);
    });

    await test.step("the other files stay as before", async () => {
      await files.choose("Modified src/a.ts", "keyboard");
      await diffs.expectChangedLines("Modified src/a.ts", {
        removed: ["-a 0"],
        added: ["+a one"],
      });
    });

    await test.step("the committed work alone keeps the file flagged from the same tree", async () => {
      expect(flags(later.committed?.files)).toEqual([
        { file: "d.md", includesTrunkFrom: undefined },
        { file: "src/a.ts", includesTrunkFrom: undefined },
        { file: "src/c.ts", includesTrunkFrom: beforeStory },
      ]);
      await refreshed.comparison.includeUncommitted(false);
      await files.expectOutsideRows([
        "src",
        "  a.ts",
        "  c.ts includes trunk's changes",
        "d.md",
      ]);
      await files.expectTrunkQualifier(flagged);
      await files.expectLineCounts(flagged, "+1 −1");
      await files.choose(flagged, "keyboard");
      await expectFlaggedDiff(refreshed);
    });
  });
});

test.describe("declared rewritten-line history", () => {
  test.use({ originRepository: trunkModeStory({ rewritten: true }) });

  test("a flagged file two story commits changed is diffed from trunk before the older one", async ({
    page,
    dashboard,
    origin,
  }) => {
    const { workspace } = storyWorktree(origin);
    const trunk = origin.revision("o3");
    const beforeStory = treeBeforeStory(origin, workspace);
    // Not the parent of `s2`, the commit whose line trunk rewrote.
    expect(git(workspace, "log", "-1", "--format=%s", "HEAD~1")).toBe("s2");
    expect(beforeStory).not.toBe(git(workspace, "rev-parse", "HEAD~2^{tree}"));
    keepLaunchRecord(dashboard, workspace);
    const card = await openTaken(page, origin);
    const review = await openIntentReviewChanges(page, card);
    const { snapshot, files, diffs } = review;

    expect(snapshot.published).toEqual({ trunk, commits: 3 });
    expect(flags(snapshot.files)).toEqual(allFlaggedFrom(beforeStory));
    await files.expectOutsideRows(allRows);
    await files.expectTrunkQualifier(flagged);
    await files.expectLineCounts(flagged, "+2 −2");
    await files.choose(flagged, "keyboard");
    // The older story change beside the line trunk rewrote.
    await diffs.expectChangedLines(flagged, {
      removed: ["-c 3", "-c 9"],
      added: ["+c trunk", "+c nine"],
    });
    await diffs.expectLacks(flagged, "c story", "<<<<<<<");
  });
});
