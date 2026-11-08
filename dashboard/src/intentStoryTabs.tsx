// The selected story's views in Intent (`./IntentStoryView.tsx`): **CI
// comparison**, **Changed tests** and **Intent coverage**, in that order,
// one Intent tablist (`./IntentTabs.tsx`) under the story's header
// (`./IntentStorySummary.tsx`). The chosen view is disposable page state
// (ADR 0008) kept with the project's reading place
// (`./pageIntentReading.tsx`) together with the story it was chosen for, so a
// change of Selected story, even while Intent is hidden, opens CI comparison;
// returning from Development or another view keeps it. Every view stays
// mounted while another shows, so the Changed tests reader and tree keep
// their place. A file's Proof returns directly to CI comparison through
// `useStoryCiReturn`, which also focuses that tab.

import { createContext, useContext, type ReactNode } from "react";
import { intentTabId, type IntentTabOption } from "./IntentTabs.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";

export type IntentStoryTab = "ci" | "changed" | "coverage";

export const storyTabs: readonly IntentTabOption<IntentStoryTab>[] = [
  { value: "ci", label: "CI comparison" },
  { value: "changed", label: "Changed tests" },
  { value: "coverage", label: "Intent coverage" },
];

type KeptTab = {
  readonly story: string | undefined;
  readonly tab: IntentStoryTab;
};

// The view chosen for `story`, CI comparison until another is chosen for it.
export function useStoryTab(story: string | undefined) {
  const [kept, keep] = useKeptReading<KeptTab>("storyTab", () => ({
    story,
    tab: "ci",
  }));
  const tab = kept.story === story ? kept.tab : "ci";
  return {
    tab,
    chooseTab: (next: IntentStoryTab) => {
      keep({ story, tab: next });
    },
  };
}

// Back to the story's CI comparison, focusing its tab; absent without a
// selected story.
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
  readonly idPrefix: string | undefined;
  readonly chooseTab: (next: IntentStoryTab) => void;
  readonly children: ReactNode;
}) {
  const back =
    idPrefix === undefined
      ? undefined
      : () => {
          chooseTab("ci");
          // The tab is drawn already; only its panel was hidden.
          document.getElementById(intentTabId(idPrefix, "ci"))?.focus();
        };
  return <StoryCiReturnContext value={back}>{children}</StoryCiReturnContext>;
}
