// A story opens its published comparison with available landing choices;
// Refresh sits in the comparison details (`./IntentComparisonBar.tsx`).
import {
  ComparisonChoices,
  ComparisonInclusion,
  comparisonName,
  type ComparisonChoice,
} from "./StoryReviewComparison.tsx";
import { launchKindName } from "./launchWorkflow.ts";
import { PublishedRangeSwitch } from "./StoryReviewSessionRuns.tsx";
import type { ReviewRunChoice } from "./storyReviewLandedRun.ts";
import type { SessionScope } from "./followUpSessions.ts";

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
  // The story's sessions, oldest first, and the chosen one's key; none
  // chosen is the whole story.
  readonly sessions?: readonly SessionScope[];
  readonly session?: string | undefined;
  readonly onSession?: (session: string | undefined) => void;
  // A chosen session's recorded runs, and the chosen one's position key.
  readonly ranges?: number;
  readonly runKey?: string | undefined;
};

const wholeStory = "whole-story";

// A landed run's name: its launch kind and, when known, when it launched.
export function landedRunName(run: ReviewRunChoice) {
  return [
    launchKindName(run.workflow),
    ...(run.launchedAt === undefined
      ? []
      : [new Date(run.launchedAt).toLocaleString()]),
  ].join(" — ");
}

export function IntentStoryCompare({
  compare,
}: {
  readonly compare: StoryCompare;
}) {
  const choices = [
    ...(compare.published
      ? [{ key: "published", label: comparisonName("published") }]
      : []),
    ...compare.runs.map((run) => ({
      key: run.key,
      label: [
        landedRunName(run),
        run.comparison?.revision.slice(0, 8) ?? "No published comparison",
      ].join(" — "),
    })),
  ];
  return (
    <div className="intent-story-compare" aria-label="Compare" role="group">
      {(compare.sessions?.length ?? 0) > 0 && (
        <ComparisonChoices
          label="Sessions"
          choices={[
            { key: wholeStory, label: "Whole story" },
            ...(compare.sessions ?? []),
          ]}
          shown={compare.session ?? wholeStory}
          onChoose={(key) => {
            compare.onSession?.(key === wholeStory ? undefined : key);
          }}
        />
      )}
      {compare.ranges !== undefined && (
        <PublishedRangeSwitch
          ranges={compare.ranges}
          selected={compare.runKey}
          onSelect={compare.onRun}
        />
      )}
      {choices.length > 1 && (
        <ComparisonChoices
          choices={choices}
          shown={compare.selectedRun?.key ?? compare.shown}
          onReselect={(key) => {
            if (key !== "published") compare.onRun(key);
          }}
          onChoose={(key) => {
            if (key === "published") compare.onChoose(key);
            else compare.onRun(key);
          }}
        />
      )}
      {compare.selectedRun?.comparison === undefined &&
        compare.selectedRun?.launchedAt !== undefined && (
          <p>
            {launchKindName(compare.selectedRun.workflow)} launched{" "}
            <time dateTime={compare.selectedRun.launchedAt}>
              {new Date(compare.selectedRun.launchedAt).toLocaleString()}
            </time>
            .
          </p>
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
