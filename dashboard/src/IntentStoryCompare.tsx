// What the selected story's Intent compares, chosen beside the compared
// revisions through Review changes' own selection (`./useStoryComparison.ts`):
// all changes, uncommitted changes included or left out, or a contiguous range
// of the story's commits chosen by its two ends, named as the Side panel
// review names it. Refresh reads the worktree again and keeps the choice.

import {
  ComparisonSwitch,
  UncommittedCheck,
  type ShownComparison,
} from "./StoryReviewComparison.tsx";
import { CommitList, CommitRangeHeading } from "./StoryReviewCommits.tsx";
import type { ReviewItem } from "./storyReviewContract.ts";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";

export type StoryCompare = {
  readonly shown: ShownComparison;
  readonly items: readonly ReviewItem[];
  readonly selectedItems: readonly ReviewItem[];
  readonly trunkIntegrated: boolean;
  readonly onWorkspace: (choice: ShownComparison) => void;
  readonly onSelect: (id: string) => void;
  // Whether all changes include uncommitted changes, offered only while
  // all changes are shown of a worktree holding some.
  readonly includeUncommitted: boolean | undefined;
  readonly onIncludeUncommitted: (include: boolean) => void;
  readonly onRefresh: () => void;
};

// The chosen commit range's name in place of the compared revisions.
export function ComparedRange({ compare }: { readonly compare: StoryCompare }) {
  return (
    <div className="intent-story-revisions">
      <CommitRangeHeading
        selected={compare.selectedItems}
        trunkIntegrated={compare.trunkIntegrated}
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
        onSwitch={(choice) => {
          if (choice === "all" || choice === "commits")
            compare.onWorkspace(choice);
        }}
        commits={compare.items.length > 0}
      />
      <IconButton
        label="Refresh"
        icon={RefreshCw}
        onClick={compare.onRefresh}
      />
      {compare.includeUncommitted !== undefined && (
        <UncommittedCheck
          included={compare.includeUncommitted}
          onInclude={compare.onIncludeUncommitted}
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
