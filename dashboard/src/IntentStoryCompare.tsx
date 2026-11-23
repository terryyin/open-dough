// What the selected story's Intent compares, chosen beside the compared
// revisions through Review changes' own selection (`./useStoryComparison.ts`):
// all changes, uncommitted changes included or left out, or a contiguous range
// of the story's commits chosen by its two ends, named as the Side panel
// review names it; a Done story's published completion or one of its captured
// landed runs. Refresh reads the worktree again and keeps the choice.

import {
  ComparisonInclusion,
  ComparisonSwitch,
  type ComparisonChoice,
} from "./StoryReviewComparison.tsx";
import { CommitList, CommitRangeHeading } from "./StoryReviewCommits.tsx";
import { RunChoice } from "./StoryReviewRunChoice.tsx";
import type { ReviewItem } from "./storyReviewContract.ts";
import type { ReviewRunChoice } from "./storyReviewLandedRun.ts";
import type { ShownStoryComparison } from "./storyComparisonShown.ts";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";

export type StoryCompare = {
  readonly shown: ComparisonChoice;
  // Whether the story's default comparison is the one chosen.
  readonly isDefault: boolean;
  // Whether the story has a workspace to compare.
  readonly workspace: boolean;
  // Whether the story's published completion is offered.
  readonly published: boolean;
  readonly runs: readonly ReviewRunChoice[];
  readonly selectedRun: ReviewRunChoice | undefined;
  readonly onRun: (run: string) => void;
  readonly items: readonly ReviewItem[];
  readonly selectedItems: readonly ReviewItem[];
  readonly trunkIntegrated: boolean;
  readonly onChoose: (choice: ComparisonChoice) => void;
  readonly onSelect: (id: string) => void;
  // Whether all changes include uncommitted changes, offered only while
  // all changes are shown of a worktree holding some.
  readonly includeUncommitted: boolean | undefined;
  readonly onIncludeUncommitted: (include: boolean) => void;
  readonly includeMergedChanges: boolean | undefined;
  readonly onIncludeMergedChanges: (include: boolean) => void;
  readonly onRefresh: () => void;
  // A range, run, or refresh still in flight. Refresh stays focusable.
  readonly reading: boolean;
};

// The chosen commit range's name in place of the compared revisions.
export function ComparedRange({
  compare,
  shown,
}: {
  readonly compare: StoryCompare;
  readonly shown?: ShownStoryComparison;
}) {
  const settled =
    !compare.reading && compare.includeMergedChanges !== undefined;
  const pair =
    settled && shown !== undefined
      ? { from: shown.comparison.from, tree: shown.tree }
      : undefined;
  return (
    <div className="intent-story-revisions">
      <CommitRangeHeading
        selected={compare.selectedItems}
        trunkIntegrated={compare.trunkIntegrated}
        includesMergedChanges={shown?.includesMergedChanges === true}
        pair={pair}
      />
    </div>
  );
}

export function IntentStoryCompare({
  compare,
}: {
  readonly compare: StoryCompare;
}) {
  return (
    <div className="intent-story-compare" aria-label="Compare" role="group">
      <ComparisonSwitch
        shown={compare.shown}
        onSwitch={compare.onChoose}
        workspace={compare.workspace}
        commits={compare.items.length > 0}
        landed={compare.runs.length > 0}
        published={compare.published}
      />
      {/* Unavailable while reading, yet still focusable, so the
          keyboard stays on it. */}
      <IconButton
        label="Refresh"
        icon={RefreshCw}
        aria-disabled={compare.reading}
        onClick={() => {
          if (!compare.reading) compare.onRefresh();
        }}
      />
      {compare.selectedRun !== undefined && (
        <RunChoice
          runs={compare.runs}
          selected={compare.selectedRun}
          onSelect={compare.onRun}
        />
      )}
      {compare.includeUncommitted !== undefined && (
        <ComparisonInclusion
          label="Include uncommitted changes"
          included={compare.includeUncommitted}
          onInclude={compare.onIncludeUncommitted}
        />
      )}
      {compare.includeMergedChanges !== undefined && (
        <ComparisonInclusion
          label="Include merged changes"
          included={compare.includeMergedChanges}
          disabled={compare.reading}
          onInclude={compare.onIncludeMergedChanges}
        />
      )}
      {compare.shown === "commits" && (
        <CommitList
          items={compare.items}
          selected={compare.selectedItems}
          onSelect={compare.onSelect}
        />
      )}
    </div>
  );
}
