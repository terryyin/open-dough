import { useCallback, type ReactNode } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { LensComparison } from "./IntentStoryComparison.tsx";
import type { useIntentFileRead } from "./useIntentFileRead.ts";
import {
  LocationsNotConfigured,
  LocationsSettingsProblem,
} from "./IntentLocationsUnavailable.tsx";
import { isReviewedPublishedSessionSubject } from "./reviewedWorkSubject.ts";
import {
  storyReviewResultQuery,
  type StoryReviewResult,
  type StoryReviewResultRead,
} from "./storyReviewResult.ts";
import { useStoryReviewResult } from "./useReviewRead.ts";
import { useStateKeyedBy } from "./stateKeyedBy.ts";

type Pin = {
  readonly request: StoryReviewResultRead;
  readonly revision: string;
};

export function storyResultPin(
  comparison: LensComparison | undefined,
): Pin | undefined {
  if (comparison?.state !== "compared") return undefined;
  const {
    shown: {
      reviewed: { subject, reference, publishedHead, completion },
      tree,
    },
    review,
  } = comparison;
  if (isReviewedPublishedSessionSubject(subject)) return undefined;
  if (reference !== undefined && review?.kind === "landed")
    return {
      revision: review.landing.revision,
      request: { subject, tree, reference },
    };
  if (publishedHead !== undefined)
    return {
      revision: publishedHead,
      request: { subject, tree, publishedHead },
    };
  if (completion !== undefined)
    return { revision: completion, request: { subject, tree, completion } };
  return undefined;
}

function usePinnedRead(pin: Pin | undefined, path?: string) {
  const query =
    pin === undefined
      ? {}
      : storyReviewResultQuery({
          ...pin.request,
          ...(path === undefined ? {} : { path }),
        });
  const key = new URLSearchParams(query).toString();
  const { value: round, set: setRound } = useStateKeyedBy(0, key);
  const revision = pin?.revision;
  const isFixed = useCallback(
    (answer: StoryReviewResult) =>
      answer.revision === revision &&
      (path === undefined
        ? answer.kind === "inventory" && answer.settingsProblem === undefined
        : answer.kind === "text" && answer.path === path),
    [revision, path],
  );
  const { answer, problem, reading } = useStoryReviewResult(query, {
    enabled: pin !== undefined,
    round,
    fixed: isFixed,
  });
  const current =
    !reading && answer?.revision === pin?.revision ? answer : undefined;
  return {
    key,
    answer: current,
    problem:
      reading || current !== undefined
        ? undefined
        : (problem ?? "The result did not match the selected comparison."),
    reading,
    retry: () => {
      setRound(round + 1);
    },
  };
}

const noLocations: readonly IntentLocation[] = [];

export type StoryResultBrowse = {
  readonly pin: Pin;
  readonly key: string;
  readonly paths: readonly string[] | undefined;
  readonly locations: readonly IntentLocation[];
  readonly reading: boolean;
  readonly lead: ReactNode;
};

export function useStoryResultBrowse(
  comparison: LensComparison | undefined,
  label: string,
): StoryResultBrowse | undefined {
  const pin = storyResultPin(comparison);
  const result = usePinnedRead(pin);
  if (pin === undefined) return undefined;
  const { answer, reading, problem, retry, key } = result;
  const inventory = answer?.kind === "inventory" ? answer : undefined;
  let lead: ReactNode;
  if (reading) {
    lead = <p className="quiet">Reading repository files…</p>;
  } else if (inventory === undefined) {
    const explanation =
      answer?.kind === "unavailable" ? answer.explanation : problem;
    lead = (
      <p role="alert" className="intent-settings-problem">
        Repository inventory could not be read
        {explanation === undefined ? "." : `: ${explanation}`}{" "}
        <button type="button" onClick={retry}>
          Retry
        </button>
      </p>
    );
  } else if (inventory.settingsProblem !== undefined) {
    lead = (
      <LocationsSettingsProblem
        label={label}
        problem={inventory.settingsProblem}
        onRetry={retry}
      />
    );
  } else if (inventory.locations === null) {
    lead = <LocationsNotConfigured label={label} />;
  }
  return {
    pin,
    key: `${key}:${String(inventory !== undefined)}`,
    lead,
    reading,
    locations: inventory?.locations ?? noLocations,
    paths: inventory?.paths,
  };
}

export function useStoryResultFile(
  pin: Pin | undefined,
  path: string | undefined,
): ReturnType<typeof useIntentFileRead> {
  const { answer, problem, reading, retry } = usePinnedRead(
    path === undefined ? undefined : pin,
    path,
  );
  return {
    read:
      path === undefined || reading
        ? undefined
        : answer?.kind === "text" && answer.path === path
          ? { path, state: "ready", text: answer.text }
          : answer !== undefined || problem !== undefined
            ? { path, state: "failed" }
            : undefined,
    revision: pin?.revision,
    failedRevision: undefined,
    retry,
  };
}
