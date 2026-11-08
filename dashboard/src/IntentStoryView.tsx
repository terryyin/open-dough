// The selected story's view of Intent (`./IntentPerspective.tsx`), read in the
// story's own reading scope (`./pageIntentReading.tsx`): its persistent
// header (`./IntentStorySummary.tsx`), led by the way to **Project Intent**,
// above its views (`./intentStoryTabs.tsx`), with Hide files / Show files
// ending their row on Changed tests, and Intent's revision notice under them.
// CI comparison and Intent coverage are
// drawn here; Changed tests is the locations browser (`./IntentBrowser.tsx`)
// over the story's comparison, or the locations' explanation here in its
// place. The browser follows this view rather than holding it, so CI never
// remounts as locations settle. Once the comparison and the locations are
// known, the header counts the changed files outside every location. The
// view row's chosen tab is where the keyboard returns when what held it left
// an Intent page (`./storyCardFocus.ts`).

import { Layers } from "lucide-react";
import type { ReactNode } from "react";
import { FileBrowserToggle } from "./FileBrowserToggle.tsx";
import { Icon } from "./Icon.tsx";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentTabs, intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import { IntentStoryCoverage } from "./IntentStoryCoverage.tsx";
import {
  IntentStoryHeader,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import { intentStoryOverlay } from "./intentStoryOverlay.ts";
import {
  StoryCiReturnProvider,
  storyTabs,
  useStoryTab,
  type IntentStoryTab,
} from "./intentStoryTabs.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { intentHomeMarks } from "./storyCardFocus.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";

// The story's views' ids under Intent's.
const storyTabsIdPrefix = (idPrefix: string) => `${idPrefix}-story`;

// The control that leaves the selected story for Project Intent.
export const toProjectIntentId = (idPrefix: string) => `${idPrefix}-to-project`;

export function IntentStoryView({
  summary,
  selection,
  story,
  source,
  work,
  shown,
  idPrefix,
  onProjectIntent,
}: {
  // The selected story as its header names it, and with its comparison once
  // compared.
  readonly summary: StorySummary;
  // The page's selection of the story, which keeps its chosen view.
  readonly selection: SelectedStory | undefined;
  readonly story: ComparedStory | undefined;
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // Intent's locations at the reading revision.
  readonly shown: ShownIntentLocations;
  readonly idPrefix: string;
  readonly onProjectIntent: () => void;
}) {
  const { notice, locations, explanation, shownRevision } = shown;
  // Whether the locations column shows, kept with the story's reading place.
  const [filesShown, setFilesShown] = useKeptReading("filesShown", () => true);
  const files = { id: `${idPrefix}-story-locations`, shown: filesShown };
  const { tab, chooseTab } = useStoryTab(selection);
  const tabsIdPrefix = storyTabsIdPrefix(idPrefix);
  // Changed files outside every location, once both are known.
  const outside =
    story !== undefined && locations !== undefined
      ? intentStoryOverlay(locations, story.shown.comparison.files).outside
      : undefined;
  const panel = (view: IntentStoryTab) => ({
    className: "intent-story-panel",
    tabIndex: -1,
    role: "tabpanel",
    id: intentTabPanelId(tabsIdPrefix, view),
    "aria-labelledby": intentTabId(tabsIdPrefix, view),
    hidden: tab !== view,
  });
  const crumb: ReactNode = (
    <button
      type="button"
      id={toProjectIntentId(idPrefix)}
      className="intent-open-link intent-story-crumb-link"
      onClick={onProjectIntent}
    >
      <Icon icon={Layers} /> Project Intent
    </button>
  );
  return (
    <StoryCiReturnProvider idPrefix={tabsIdPrefix} chooseTab={chooseTab}>
      <div
        className="intent-story-view"
        data-fills={
          tab !== "changed" || explanation !== undefined ? "true" : "false"
        }
      >
        <IntentStoryHeader
          summary={summary}
          source={source.id}
          outside={outside}
          crumb={crumb}
        />
        <div className="intent-story-tabbar" {...intentHomeMarks}>
          <IntentTabs
            options={storyTabs}
            selected={tab}
            onSelect={chooseTab}
            label="Selected story views"
            idPrefix={tabsIdPrefix}
          />
          <FileBrowserToggle
            browser={
              tab === "changed" && locations !== undefined ? files : undefined
            }
            onShowBrowser={setFilesShown}
          />
        </div>
        {notice}
        <div {...panel("ci")}>
          <IntentCiStatus />
        </div>
        {explanation !== undefined && (
          <div {...panel("changed")}>{explanation}</div>
        )}
        <div {...panel("coverage")}>
          <IntentStoryCoverage story={summary.story} />
        </div>
      </div>
      {locations !== undefined && work !== undefined && (
        // Tree and Purpose read the revision shown.
        <IntentBrowser
          source={source}
          revision={shownRevision ?? work.revision}
          locations={locations}
          project={undefined}
          storySummary={summary}
          story={story}
          files={files}
          panel={{
            id: intentTabPanelId(tabsIdPrefix, "changed"),
            labelledBy: intentTabId(tabsIdPrefix, "changed"),
            hidden: tab !== "changed",
          }}
        />
      )}
    </StoryCiReturnProvider>
  );
}
