import type { ReactNode } from "react";
import { House } from "lucide-react";
import { Icon } from "./Icon.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentStoryCoverage } from "./IntentStoryCoverage.tsx";
import { WholeStoryNote } from "./IntentStoryComparison.tsx";
import { wholeStoryOf, type StorySummary } from "./IntentStorySummary.tsx";
import { IntentTabs, intentTabPanelAttributes } from "./IntentTabs.tsx";
import { storyTabs, type IntentStoryTab } from "./intentStoryTabs.tsx";
import { intentHomeMarks } from "./storyCardFocus.ts";

export function StoryHomeButton({ onHome }: { readonly onHome: () => void }) {
  return (
    <button
      className="intent-home-button"
      type="button"
      aria-label="Home"
      onClick={onHome}
    >
      <Icon icon={House} />
    </button>
  );
}

export function IntentStoryEvidence({
  story,
  idPrefix,
  tab,
  onTab,
  hidden,
  explanation,
}: {
  readonly story: StorySummary;
  readonly idPrefix: string;
  readonly tab: IntentStoryTab;
  readonly onTab: (tab: IntentStoryTab) => void;
  readonly hidden: boolean;
  readonly explanation: ReactNode;
}) {
  const wholeStory = wholeStoryOf(story);
  const panel = (name: "ci" | "coverage") =>
    intentTabPanelAttributes(idPrefix, name, tab);
  return (
    <div className="intent-story-home" hidden={hidden} {...intentHomeMarks}>
      <IntentTabs
        options={storyTabs}
        selected={tab}
        onSelect={onTab}
        label="Story Home"
        idPrefix={idPrefix}
      />
      {explanation}
      <div className="intent-page-panel" tabIndex={-1} {...panel("ci")}>
        <WholeStoryNote whole={wholeStory} />
        <IntentCiStatus />
      </div>
      <div className="intent-page-panel" tabIndex={-1} {...panel("coverage")}>
        <WholeStoryNote whole={wholeStory} coverage />
        <IntentStoryCoverage story={story.story} />
      </div>
    </div>
  );
}
