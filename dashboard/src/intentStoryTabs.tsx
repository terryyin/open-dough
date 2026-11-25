// The selected story's views in Intent (`./IntentPage.tsx`): **CI
// comparison**, **Changes** and **Intent coverage**, in that order,
// one Intent tablist (`./IntentTabs.tsx`) under the story's header
// (`./IntentHeader.tsx`). The chosen view is disposable page state
// (ADR 0008) kept with the project's reading place
// (`./pageIntentReading.tsx`) together with the selection it was chosen for
// (`./pageStorySelection.tsx`), so every new selection, even of a story
// cleared and selected again while Intent is hidden, opens CI comparison;
// returning from Development or another tab keeps it. Every
// view stays mounted while another shows, so the Changes reader and
// tree keep their place. A file's Proof returns directly to CI comparison
// through `useStoryCiReturn`, which also focuses that tab.

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { intentTabId, type IntentTabOption } from "./IntentTabs.tsx";
import {
  useFinishStoryReviewOpening,
  useShowStoryReviewOpening,
  useStoryReviewOpening,
} from "./pageStoryReviewOpening.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";

export type IntentStoryTab = "ci" | "changes" | "coverage";
export const storyTabs: readonly IntentTabOption<IntentStoryTab>[] = [
  { value: "ci", label: "CI comparison" },
  { value: "changes", label: "Changes" },
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

// Card arrivals choose Changes and take focus after the tab has mounted.
export function useStoryChangesArrival(
  project: string | undefined,
  tabsIdPrefix: string,
  tab: IntentStoryTab,
  chooseTab: (tab: IntentStoryTab) => void,
  canOpenFile: boolean,
) {
  const finish = useFinishStoryReviewOpening();
  const shown = useShowStoryReviewOpening();
  const opening = useStoryReviewOpening(project);
  useEffect(() => {
    if (opening === undefined) return;
    if (opening.phase === "show") {
      chooseTab("changes");
      document.getElementById(intentTabId(tabsIdPrefix, "changes"))?.focus();
      shown?.(opening);
    } else if (tab !== "changes" || !canOpenFile) {
      finish?.(opening);
    }
  }, [opening, tabsIdPrefix, tab, chooseTab, canOpenFile, shown, finish]);
}

// Back to the story's CI comparison, focusing its tab; absent outside the
// selected story's view.
type StoryCiReturn = () => void;

const StoryCiReturnContext = createContext<StoryCiReturn | undefined>(
  undefined,
);

export const useStoryCiReturn = (): StoryCiReturn | undefined =>
  useContext(StoryCiReturnContext);

export function StoryCiReturnProvider({
  idPrefix,
  chooseTab,
  children,
}: {
  // The story tablist's ids.
  readonly idPrefix: string;
  readonly chooseTab: (next: IntentStoryTab) => void;
  readonly children: ReactNode;
}) {
  const back = () => {
    chooseTab("ci");
    // The tab is drawn already; only its panel was hidden.
    document.getElementById(intentTabId(idPrefix, "ci"))?.focus();
  };
  return <StoryCiReturnContext value={back}>{children}</StoryCiReturnContext>;
}
