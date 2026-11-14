// A Done story with a Published completion comparison for file-anchored
// follow-up boundary specs: real Git publication plus the done catalog the
// fake GitHub serves at the trunk revision the page would show.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { describedFiles } from "../describedRevisions.ts";
import { doneRecordOf, type DoneStory } from "../../src/doneRecord.ts";
import type { FollowUpFileFacts } from "../../src/followUpContext.ts";
import {
  followUpContextText,
  storyContext,
} from "../../src/followUpContext.ts";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  type ReviewedFile,
  type StoryReview,
} from "../../src/storyReviewContract.ts";
import { doneRecordPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { completedPublishedStory } from "./completedPublishedStory.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { publishes } from "./publishedRepository.ts";
import { originMain } from "./sessionDialog.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import { commitAll, git, lines, writeAt } from "./storyReviewWorktree.ts";
import { push } from "./storyReviewTrunkCommits.ts";

const repository = "terryyin/open-dough";

export const renamedOldPath = "old/a.ts";
export const renamedNewPath = "new/a.ts";

// Twelve lines so new line 12 exists after the rename edit.
export const renamedBaselineText = lines("old", 12);
export const renamedTreeText = `${lines("old", 11)}new 11\n`;

export function fromOf(
  review: Extract<StoryReview, { kind: "published" }>,
  file: ReviewedFile,
) {
  return file.includesTrunkFrom ?? review.baseline;
}

export async function serveDoneAtTrunk(
  dashboard: DashboardServer,
  origin: StartOrigin,
): Promise<{ revision: string; story: DoneStory }> {
  const revision = await originMain(origin);
  const recordPath = `.planning/${doneRecordPath(queuedIdentity)}`;
  const text = git(origin.project, "show", `${revision}:${recordPath}`);
  const read = doneRecordOf(recordPath.split("/").pop() ?? "", text);
  if (read.status !== "read")
    throw new Error(`Done record unreadable: ${read.problem}`);
  // Serve through describedFiles so the fake listing's blob SHAs agree with
  // the catalog the same way other follow-up story specs do.
  dashboard.github.serve(
    repository,
    publishes({
      revision,
      files: describedFiles({
        backlog: null,
        doneRecords: [
          makeMe.aDoneRecord
            .with({
              identity: read.story.identity,
              title: read.story.title,
              completedAt: read.story.completedAt,
              ...(read.story.developer === undefined
                ? {}
                : { developer: read.story.developer }),
              ...(read.story.agent === undefined
                ? {}
                : { agent: read.story.agent }),
              ...(read.story.host === undefined
                ? {}
                : { host: read.story.host }),
            })
            .please(),
        ],
      }),
    }),
  );
  return { revision, story: read.story };
}

// Ordinary interleaved completion with a rename from old/a.ts to new/a.ts
// whose new side has line 12. The rename source is on trunk before the Take.
export async function completedRenamedFileStory(origin: StartOrigin) {
  writeAt(origin.project, "shared.txt", lines("line"));
  writeAt(origin.project, renamedOldPath, renamedBaselineText);
  commitAll(origin.project, "shared and rename source");
  push(origin.project);
  return completedPublishedStory(
    origin,
    "trunk",
    undefined,
    (workspace) => {
      mkdirSync(path.join(workspace, "new"), { recursive: true });
      git(workspace, "mv", renamedOldPath, renamedNewPath);
      writeAt(workspace, renamedNewPath, renamedTreeText);
    },
    undefined,
    { sharedAlreadyReady: true },
  );
}

export async function publishedReviewOf(
  dashboard: DashboardServer,
  completion: string,
) {
  const response = await fetch(
    `${dashboard.baseURL}${storyReviewEndpoint}?${new URLSearchParams({
      source: "open-dough",
      identity: queuedIdentity,
      completed: "true",
    })}`,
    { headers: { Origin: dashboard.origin } },
  );
  if (!response.ok)
    throw new Error(`Published review failed: ${response.status}`);
  const review = storyReviewSchema.parse(await response.json());
  if (review.kind !== "published")
    throw new Error(`Expected published review, got ${review.kind}`);
  if (review.completion !== completion)
    throw new Error(
      `Expected completion ${completion}, got ${review.completion}`,
    );
  return review;
}

export type PublishedReview = Awaited<ReturnType<typeof publishedReviewOf>>;

// Published-completion file facts the boundary specs send and expect.
export function fileFactsOf(
  review: PublishedReview,
  file: ReviewedFile,
  line?: { line: number; side: "old" | "new" },
): FollowUpFileFacts & { completion: string } {
  return {
    path: file.path,
    ...(file.kind === "renamed" ? { oldPath: file.oldPath } : {}),
    kind: "published",
    baseline: fromOf(review, file),
    tree: review.tree,
    completion: review.completion,
    ...(line === undefined ? {} : line),
  };
}

export function fileFollowUpOf(
  revision: string,
  file: FollowUpFileFacts & {
    readonly completion?: string;
    readonly reference?: string;
  },
) {
  return {
    story: {
      identity: queuedIdentity,
      revision,
      file: {
        path: file.path,
        ...(file.oldPath === undefined ? {} : { oldPath: file.oldPath }),
        baseline: file.baseline,
        tree: file.tree,
        ...(file.completion === undefined
          ? {}
          : { completion: file.completion }),
        ...(file.reference === undefined ? {} : { reference: file.reference }),
        ...(file.line === undefined || file.side === undefined
          ? {}
          : { line: file.line, side: file.side }),
      },
    },
  };
}

export function fileStoryContextOf(story: DoneStory, file: FollowUpFileFacts) {
  return followUpContextText(storyContext(story, [], file));
}
