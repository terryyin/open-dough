// Story Home keeps its chosen evidence tab for the current story selection.

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { intentTabId, type IntentTabOption } from "./IntentTabs.tsx";
import {
  useFinishStoryReviewOpening,
  useStoryReviewOpening,
} from "./pageStoryReviewOpening.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";

export type IntentStoryTab = "ci" | "coverage";
export const storyTabs: readonly IntentTabOption<IntentStoryTab>[] = [
  { value: "ci", label: "CI comparison" },
  { value: "coverage", label: "Intent coverage" },
];

// The view chosen for `selection`, CI comparison until another is chosen for
// it.
export function useStoryTab(selection: SelectedStory | undefined) {
  const [kept, keep] = useKeptReading<{
    readonly selection: SelectedStory | undefined;
    readonly tab: IntentStoryTab;
  }>("storyTab", () => ({ selection, tab: "ci" }));
  return {
    tab: kept.selection === selection ? kept.tab : "ci",
    chooseTab: (tab: IntentStoryTab) => {
      keep({ selection, tab });
    },
  };
}

// The sidebar and file Proof share the return to CI comparison.
const StoryCiReturnContext = createContext<(() => void) | undefined>(undefined);

export const useStoryCiReturn = () => useContext(StoryCiReturnContext);
export const StoryCiReturnProvider = StoryCiReturnContext.Provider;

export function useReturnToStoryCi(
  project: string | undefined,
  idPrefix: string,
  chooseTab: (tab: IntentStoryTab) => void,
  clearSelection: () => void,
) {
  const opening = useStoryReviewOpening(project);
  const finish = useFinishStoryReviewOpening();
  const [returnCount, setReturnCount] = useState(0);
  useLayoutEffect(() => {
    if (returnCount !== 0)
      document.getElementById(intentTabId(idPrefix, "ci"))?.focus();
  }, [returnCount, idPrefix]);
  return () => {
    if (opening !== undefined) finish?.(opening);
    clearSelection();
    chooseTab("ci");
    setReturnCount((count) => count + 1);
  };
}
