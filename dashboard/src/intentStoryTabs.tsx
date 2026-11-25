// The selected story's views in Intent (`./IntentPage.tsx`): **CI
// comparison**, **Changes** and **Intent coverage**, in that order,
// one Intent tablist (`./IntentTabs.tsx`) under the story's header
// (`./IntentHeader.tsx`). The chosen view is disposable page state
// (ADR 0008) kept with the project's reading place
// (`./pageIntentReading.tsx`) together with the selection it was chosen for
// (`./pageStorySelection.tsx`), so every new selection, even of a story
// cleared and selected again while Intent is hidden, opens CI comparison;
// returning from Development, Project Intent or another view keeps it. Every
// view stays mounted while another shows, so the Changes reader and
// tree keep their place. A file's Proof returns directly to CI comparison
// through `useStoryCiReturn`, which also focuses that tab.
//
// Intent shows either the selected story's views or **Project Intent**
// (`useIntentScope`), kept in the same way. Each new selection shows its
// story, and clearing it shows Project Intent; a visit to Project Intent
// leaves the selection, the chosen view and the story's reading place
// (`./pageIntentReading.tsx`) as they were, and coming back shows them again.
// Without a selected story Intent shows Project Intent.

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { intentTabId, type IntentTabOption } from "./IntentTabs.tsx";
import {
  useFinishStoryReviewOpening,
  useShowStoryReviewOpening,
  useStoryReviewOpening,
} from "./pageStoryReviewOpening.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";

export type IntentStoryTab = "ci" | "changes" | "coverage";
export type IntentScope = "story" | "project";

// The banner can end a temporary visit to Project Intent while it is shown.
const IntentStoryReturnRef = createContext<
  RefObject<(() => void) | undefined> | undefined
>(undefined);

export function IntentScopeBridgeProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const returnToStory = useRef<(() => void) | undefined>(undefined);
  return (
    <IntentStoryReturnRef value={returnToStory}>
      {children}
    </IntentStoryReturnRef>
  );
}

export function useReturnToVisitedStory(): () => boolean {
  const destination = useContext(IntentStoryReturnRef);
  return () => {
    const returnToStory = destination?.current;
    if (returnToStory === undefined) return false;
    returnToStory();
    return true;
  };
}

export function useProvideIntentStoryReturn(
  returnToStory: (() => void) | undefined,
): void {
  const destination = useContext(IntentStoryReturnRef);
  useLayoutEffect(() => {
    if (destination === undefined) return;
    destination.current = returnToStory;
    return () => {
      if (destination.current === returnToStory)
        destination.current = undefined;
    };
  }, [destination, returnToStory]);
}

export const storyTabs: readonly IntentTabOption<IntentStoryTab>[] = [
  { value: "ci", label: "CI comparison" },
  { value: "changes", label: "Changes" },
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

// What Intent shows for the page's `selection`, and the way to the other.
// Project Intent shows only when chosen during this selection.
export function useIntentScope(selection: SelectedStory | undefined) {
  const opening = useStoryReviewOpening(selection?.project);
  const finish = useFinishStoryReviewOpening();
  const openingChanges = opening?.phase === "show";
  const { choice, choose } = useChoiceFor<IntentScope>(
    "scope",
    selection,
    "story",
  );
  useEffect(() => {
    if (openingChanges && choice !== "story") choose("story");
  }, [openingChanges, choice, choose]);
  return {
    scope:
      selection === undefined
        ? ("project" as const)
        : openingChanges
          ? ("story" as const)
          : choice,
    chooseScope: (next: IntentScope) => {
      if (next === "project" && opening !== undefined) finish?.(opening);
      choose(next);
    },
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
