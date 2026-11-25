import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentStoryCoverage } from "./IntentStoryCoverage.tsx";
import { WholeStoryNote } from "./IntentStoryComparison.tsx";
import { wholeStoryOf, type StorySummary } from "./IntentStorySummary.tsx";
import { intentTabPanelAttributes } from "./IntentTabs.tsx";
import type { IntentStoryTab } from "./intentStoryTabs.tsx";

export function IntentStoryEvidence({
  story,
  idPrefix,
  tab,
}: {
  readonly story: StorySummary;
  readonly idPrefix: string;
  readonly tab: IntentStoryTab;
}) {
  const wholeStory = wholeStoryOf(story);
  const panel = (name: "ci" | "coverage") =>
    intentTabPanelAttributes(idPrefix, name, tab);
  return (
    <>
      <div className="intent-page-panel" tabIndex={-1} {...panel("ci")}>
        <WholeStoryNote whole={wholeStory} />
        <IntentCiStatus />
      </div>
      <div className="intent-page-panel" tabIndex={-1} {...panel("coverage")}>
        <WholeStoryNote whole={wholeStory} coverage />
        <IntentStoryCoverage story={story.story} />
      </div>
    </>
  );
}
