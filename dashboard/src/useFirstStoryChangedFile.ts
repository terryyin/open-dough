// One selection after a card arrival, made from the settled displayed tree.
import { useEffect, useLayoutEffect, useRef } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { LensComparison } from "./IntentStoryComparison.tsx";
import {
  intentChangedFileOrder,
  type StoryOverlay,
} from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import {
  useFinishStoryReviewOpening,
  useStoryReviewOpening,
} from "./pageStoryReviewOpening.tsx";

type StoryReviewFileReadiness = "waiting" | "ready" | "unavailable";

// Only the settled, displayed comparison and tree can supply the first file.
export function storyReviewFileReadiness(
  comparison: LensComparison | undefined,
  locationsReading: boolean,
  hasTree: boolean,
): StoryReviewFileReadiness {
  if (comparison?.state === "reading") return "waiting";
  if (comparison?.state !== "compared") return "unavailable";
  if (comparison.reading === true) return "waiting";
  if (
    comparison.compare?.isDefault === false ||
    comparison.shown.comparison.files.length === 0
  ) {
    return "unavailable";
  }
  if (locationsReading) return "waiting";
  return hasTree ? "ready" : "unavailable";
}

export function useFirstStoryChangedFile({
  project,
  storyIdentity,
  canChooseFile,
  locations,
  overlay,
  hasSelection,
  open,
}: {
  readonly project: string;
  readonly storyIdentity: string | undefined;
  readonly canChooseFile: boolean;
  readonly locations: readonly IntentLocation[];
  readonly overlay: StoryOverlay;
  readonly hasSelection: boolean;
  readonly open: (selection: IntentSelection) => void;
}) {
  const opening = useStoryReviewOpening(project);
  const finish = useFinishStoryReviewOpening();
  useEffect(() => {
    if (
      opening === undefined ||
      opening.identity !== storyIdentity ||
      hasSelection ||
      !canChooseFile
    )
      return;
    const [first] = intentChangedFileOrder(locations, overlay);
    if (first === undefined) finish?.(opening);
    else open({ path: first.path, scope: "file" });
  }, [
    opening,
    storyIdentity,
    canChooseFile,
    locations,
    overlay,
    hasSelection,
    open,
    finish,
  ]);
}

// Hold focus on the visible comparison feedback while the first path loads.
// Give focus to the reading only if the reader has not moved to a control.
export function useStoryReviewArrival({
  project,
  readiness,
  pathVisible,
  headerId,
  readingId,
}: {
  readonly project: string | undefined;
  readonly readiness: StoryReviewFileReadiness;
  readonly pathVisible: boolean;
  readonly headerId: string;
  readonly readingId: string;
}) {
  const opening = useStoryReviewOpening(project);
  const finish = useFinishStoryReviewOpening();
  const focused = useRef<number>(undefined);
  useLayoutEffect(() => {
    if (opening === undefined) return;
    const header = document.getElementById(headerId);
    const pathReady = readiness === "ready" && pathVisible;
    const firstFocus = focused.current !== opening.sequence;
    if (
      firstFocus ||
      document.activeElement === header ||
      document.activeElement === document.body
    ) {
      const target = pathReady ? document.getElementById(readingId) : header;
      if (target !== document.activeElement) target?.focus();
    }
    focused.current = opening.sequence;
    if (readiness === "unavailable" || pathReady) finish?.(opening);
  }, [opening, finish, readiness, pathVisible, headerId, readingId]);
}
