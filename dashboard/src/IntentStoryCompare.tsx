// A story opens its published comparison with available landing choices.
import {
  ComparisonChoices,
  ComparisonInclusion,
  comparisonName,
  type ComparisonChoice,
} from "./StoryReviewComparison.tsx";
import { RunChoice } from "./StoryReviewRunChoice.tsx";
import type { ReviewRunChoice } from "./storyReviewLandedRun.ts";
import { RefreshCw } from "lucide-react";
import { IconButton } from "./Icon.tsx";

export type StoryCompare = {
  readonly shown: ComparisonChoice | undefined;
  readonly isDefault: boolean;
  readonly published: boolean;
  readonly runs: readonly ReviewRunChoice[];
  readonly selectedRun: ReviewRunChoice | undefined;
  readonly onRun: (run: string) => void;
  readonly onChoose: (choice: ComparisonChoice) => void;
  readonly includeMergedChanges: boolean | undefined;
  readonly onIncludeMergedChanges: (include: boolean) => void;
  readonly onRefresh: () => void;
  readonly reading: boolean;
};

export function IntentStoryCompare({
  compare,
}: {
  readonly compare: StoryCompare;
}) {
  return (
    <div className="intent-story-compare" aria-label="Compare" role="group">
      {(compare.published || compare.runs.length > 0) && (
        <ComparisonChoices
          choices={[
            ...(compare.published ? ["published" as const] : []),
            ...(compare.runs.length > 0 ? ["landed" as const] : []),
          ].map((key) => ({
            key,
            label: comparisonName(key),
          }))}
          shown={compare.shown}
          onChoose={compare.onChoose}
        />
      )}
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
      {compare.includeMergedChanges !== undefined && (
        <ComparisonInclusion
          label="Include merged changes"
          included={compare.includeMergedChanges}
          disabled={compare.reading}
          onInclude={compare.onIncludeMergedChanges}
        />
      )}
    </div>
  );
}
