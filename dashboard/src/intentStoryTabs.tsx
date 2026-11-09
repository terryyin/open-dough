// The selected story's views in Intent (`./IntentPage.tsx`): **CI
// comparison**, **Changed tests** and **Intent coverage**, in that order,
// one Intent tablist (`./IntentTabs.tsx`) under the story's header
// (`./IntentHeader.tsx`). The chosen view is disposable page state
// (ADR 0008) kept with the project's reading place
// (`./pageIntentReading.tsx`) together with the selection it was chosen for
// (`./pageStorySelection.tsx`), so every new selection, even of a story
// cleared and selected again while Intent is hidden, opens CI comparison;
// returning from Development, Project Intent or another view keeps it. Every
// view stays mounted while another shows, so the Changed tests reader and
// tree keep their place. A file's Proof returns directly to CI comparison
// through `useStoryCiReturn`, which also focuses that tab.
//
// Intent shows either the selected story's views or **Project Intent**
// (`useIntentScope`), kept in the same way. Each new selection shows its
// story, and clearing it shows Project Intent; a visit to Project Intent
// leaves the selection, the chosen view and the story's reading place
// (`./pageIntentReading.tsx`) as they were, and coming back shows them again.
// Without a selected story Intent shows Project Intent.

import { createContext, useContext, type ReactNode } from "react";
import { intentTabId, type IntentTabOption } from "./IntentTabs.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";

export type IntentStoryTab = "ci" | "changed" | "coverage";

export const storyTabs: readonly IntentTabOption<IntentStoryTab>[] = [
  { value: "ci", label: "CI comparison" },
  { value: "changed", label: "Changed tests" },
  { value: "coverage", label: "Intent coverage" },
];

// A choice kept with the reading place for the page's `selection`: `initial`
// until one is made during that selection.
function useChoiceFor<T>(
  key: string,
  selection: SelectedStory | undefined,
  initial: T,
) {
  const [kept, keep] = useKeptReading<{
    readonly selection: SelectedStory | undefined;
    readonly choice: T;
  }>(key, () => ({ selection, choice: initial }));
  return {
    choice: kept.selection === selection ? kept.choice : initial,
    choose: (next: T) => {
      keep({ selection, choice: next });
    },
  };
}

// The view chosen for `selection`, CI comparison until another is chosen for
// it.
export function useStoryTab(selection: SelectedStory | undefined) {
  const { choice, choose } = useChoiceFor<IntentStoryTab>(
    "storyTab",
    selection,
    "ci",
  );
  return { tab: choice, chooseTab: choose };
}

export type IntentScope = "story" | "project";

// What Intent shows for the page's `selection`, and the way to the other.
// Project Intent shows only when chosen during this selection.
export function useIntentScope(selection: SelectedStory | undefined) {
  const { choice, choose } = useChoiceFor<IntentScope>(
    "scope",
    selection,
    "story",
  );
  return {
    scope: selection === undefined ? ("project" as const) : choice,
    chooseScope: choose,
  };
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
