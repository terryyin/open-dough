// One selection after a card arrival, made from the settled displayed tree.
import { useEffect } from "react";
import type { LensComparison } from "./IntentStoryComparison.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import {
  useFinishStoryReviewOpening,
  useStoryReviewOpening,
} from "./pageStoryReviewOpening.tsx";

type StoryReviewFileReadiness = "waiting" | "ready" | "unavailable";

// The tab keeps the request through waiting. Only the ready displayed tree
// can supply the first file.
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
  changedFiles,
  fileSelected,
  renamedSelection,
  open,
}: {
  readonly project: string;
  readonly storyIdentity: string | undefined;
  readonly canChooseFile: boolean;
  readonly changedFiles: readonly IntentTreeFile[];
  readonly renamedSelection: IntentSelection | undefined;
  readonly fileSelected: boolean;
  readonly open: (selection: IntentSelection) => void;
}) {
  const opening = useStoryReviewOpening(project);
  const finish = useFinishStoryReviewOpening();
  useEffect(() => {
    if (opening?.phase !== "read" || opening.identity !== storyIdentity) return;
    if (!canChooseFile) return;
    if (renamedSelection !== undefined) open(renamedSelection);
    else if (!fileSelected) {
      const [first] = changedFiles;
      if (first !== undefined) open({ path: first.path, scope: "file" });
    }
    finish?.(opening);
  }, [
    opening,
    finish,
    storyIdentity,
    canChooseFile,
    changedFiles,
    renamedSelection,
    fileSelected,
    open,
  ]);
}
