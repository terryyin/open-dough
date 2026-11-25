// Project evidence and selected-story Intent views share this page layout.
// The browser stays mounted while another view shows.

import { useEffect, useState } from "react";
import { FileBrowserToggle } from "./FileBrowserToggle.tsx";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { intentBrowserSource } from "./intentBrowserSource.ts";
import { focusReturnEntry } from "./IntentCandidatesSections.tsx";
import { IntentCiComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import { IntentCiEntryNavigation } from "./IntentCiEntryLink.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentHeader } from "./IntentHeader.tsx";
import { projectTabs } from "./intentProjectTabs.ts";
import { IntentStoryCoverage } from "./IntentStoryCoverage.tsx";
import { WholeStoryNote } from "./IntentStoryComparison.tsx";
import {
  type ComparedStory,
  type StorySummary,
  wholeStoryOf,
} from "./IntentStorySummary.tsx";
import {
  StoryCiReturnProvider,
  storyTabs,
  useStoryTab,
  useStoryChangesArrival,
} from "./intentStoryTabs.tsx";
import { IntentTabs, intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import { useIntentWorkspaceSelection } from "./intentWorkspaceSelection.ts";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { intentHomeMarks } from "./storyCardFocus.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";
import { storyReviewFileReadiness } from "./useFirstStoryChangedFile.ts";
import { useStoryResultBrowse } from "./useStoryResultRead.tsx";
import "./intent-page.css";

export type IntentPageStory = {
  readonly summary: StorySummary;
  readonly selection: SelectedStory | undefined;
  readonly compared: ComparedStory | undefined;
};

export function IntentPage({
  source,
  shown,
  project,
  story,
}: {
  readonly source: PublishedSource;
  readonly shown: ShownIntentLocations;
  readonly project: ModeChoice;
  readonly story?: IntentPageStory;
}) {
  const { notice, shownRevision } = shown;
  const result = useStoryResultBrowse(story?.summary.comparison, source.label);
  const {
    comparisonSourceUnavailable,
    locations: browserLocations,
    revision: browserRevision,
    explanation,
    lead,
  } = result === undefined
    ? intentBrowserSource(shown, story?.summary.comparison)
    : {
        comparisonSourceUnavailable: false,
        locations: result.locations,
        revision: result.pin.revision,
        explanation: undefined,
        lead: result.lead,
      };
  const { tab, chooseTab } = useStoryTab(story?.selection);
  const wholeStory = wholeStoryOf(story?.summary);
  const [filesShown, setFilesShown] = useKeptReading("filesShown", () => true);
  const tabsIdPrefix =
    story === undefined
      ? project.modeIdPrefix
      : `${project.modeIdPrefix}-story`;
  const fileReadiness = storyReviewFileReadiness(
    story?.summary.comparison,
    result?.reading ?? shown.reading === true,
    browserLocations !== undefined && browserRevision !== undefined,
  );
  useStoryChangesArrival(
    story?.selection?.project,
    tabsIdPrefix,
    tab,
    chooseTab,
    fileReadiness !== "unavailable",
  );
  const files = { id: `${tabsIdPrefix}-locations`, shown: filesShown };
  const { clearSelection, setSelection } = useIntentWorkspaceSelection();
  const [entryReturns, setEntryReturns] = useState(0);
  useEffect(() => {
    if (entryReturns === 0) return;
    focusReturnEntry(
      document.getElementById(intentTabPanelId(tabsIdPrefix, "candidates")),
    );
  }, [entryReturns, tabsIdPrefix]);
  const view = story === undefined ? project.mode : tab;
  const browserView = story === undefined ? "ci" : "changes";
  const panel = (name: string) => ({
    className: "intent-page-panel",
    tabIndex: -1,
    role: "tabpanel",
    id: intentTabPanelId(tabsIdPrefix, name),
    "aria-labelledby": intentTabId(tabsIdPrefix, name),
    hidden: view !== name,
  });
  const filesToggle = (
    <FileBrowserToggle
      icon
      browser={
        view === browserView && browserLocations !== undefined
          ? files
          : undefined
      }
      onShowBrowser={setFilesShown}
    />
  );
  // A story's views sit in its header, between its title and comparison bar.
  const tabBar = (
    <div className="intent-page-tabbar" {...intentHomeMarks}>
      {story === undefined ? (
        <IntentTabs
          options={projectTabs}
          selected={project.mode}
          onSelect={project.onModeChange}
          onActivate={(activated) => {
            if (activated === "ci") clearSelection();
            else setEntryReturns((n) => n + 1);
          }}
          label="Project Intent views"
          idPrefix={tabsIdPrefix}
        />
      ) : (
        <IntentTabs
          options={storyTabs}
          selected={tab}
          onSelect={chooseTab}
          label="Selected story views"
          idPrefix={tabsIdPrefix}
        />
      )}
      {story === undefined && filesToggle}
    </div>
  );
  const page = (
    <>
      <div
        className="intent-page-frame"
        data-intent-context={story === undefined ? "project" : "story"}
        data-fills={
          (
            story === undefined
              ? explanation !== undefined
              : view !== browserView || explanation !== undefined
          )
            ? "true"
            : "false"
        }
      >
        <IntentHeader
          summary={story?.summary}
          source={source.id}
          browserRevision={shownRevision}
          filesToggle={filesToggle}
          tabBar={story !== undefined && tabBar}
        />
        {story === undefined && tabBar}
        {story === undefined && notice}
        {story !== undefined && (
          <div {...panel("ci")}>
            <WholeStoryNote whole={wholeStory} />
            <IntentCiStatus />
          </div>
        )}
        {(explanation !== undefined || comparisonSourceUnavailable) && (
          <div {...panel(story === undefined ? view : "changes")}>
            {explanation}
            {story === undefined && project.mode === "ci" ? (
              <IntentCiStatus />
            ) : null}
          </div>
        )}
        {story !== undefined && (
          <div {...panel("coverage")}>
            <WholeStoryNote whole={wholeStory} coverage />
            <IntentStoryCoverage story={story.summary.story} />
          </div>
        )}
      </div>
      {browserLocations !== undefined && browserRevision !== undefined && (
        <IntentBrowser
          source={source}
          revision={browserRevision}
          locations={browserLocations}
          lead={lead}
          result={result}
          project={story === undefined ? project : undefined}
          storySummary={story?.summary}
          story={story?.compared}
          reviewFileReady={fileReadiness === "ready"}
          files={files}
          panel={{
            id: intentTabPanelId(tabsIdPrefix, browserView),
            labelledBy: intentTabId(tabsIdPrefix, browserView),
            hidden: view !== browserView,
          }}
        />
      )}
    </>
  );
  const navigablePage = (
    <IntentCiEntryNavigation
      locations={result?.locations ?? shown.locations}
      panelId={intentTabPanelId(tabsIdPrefix, browserView)}
      onOpen={(path) => {
        setSelection({ path, scope: "location" });
        if (story === undefined) project.onModeChange("ci");
        else chooseTab("changes");
      }}
    >
      {page}
    </IntentCiEntryNavigation>
  );
  return story === undefined ? (
    navigablePage
  ) : (
    <StoryCiReturnProvider idPrefix={tabsIdPrefix} chooseTab={chooseTab}>
      <IntentCiComparisonPreference>
        {navigablePage}
      </IntentCiComparisonPreference>
    </StoryCiReturnProvider>
  );
}
