// One Intent page for project evidence and an optional selected-story context.
// Each is mounted inside its own evidence and reading owners by
// IntentPerspective. The persistent header and views use the same arrangement;
// only the project shows its revision notice. The browser stays mounted while
// another view shows.

import { ArrowLeft, Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { FileBrowserToggle } from "./FileBrowserToggle.tsx";
import { Icon } from "./Icon.tsx";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { focusReturnEntry } from "./IntentCandidatesSections.tsx";
import { IntentCiComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import { IntentCiEntryNavigation } from "./IntentCiEntryLink.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentHeader } from "./IntentHeader.tsx";
import { backToStoryId, projectTabs } from "./intentProjectTabs.ts";
import { IntentStoryCoverage } from "./IntentStoryCoverage.tsx";
import {
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import { intentStoryOverlay } from "./intentStoryOverlay.ts";
import {
  StoryCiReturnProvider,
  storyTabs,
  useStoryTab,
} from "./intentStoryTabs.tsx";
import { IntentTabs, intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import { useIntentWorkspaceSelection } from "./intentWorkspaceSelection.ts";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { intentHomeMarks } from "./storyCardFocus.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";
import "./intent-page.css";

export const toProjectIntentId = (idPrefix: string) => `${idPrefix}-to-project`;

export type IntentPageStory = {
  readonly summary: StorySummary;
  readonly selection: SelectedStory | undefined;
  readonly compared: ComparedStory | undefined;
  readonly onProjectIntent: () => void;
};

export function IntentPage({
  source,
  shown,
  project,
  story,
  onBackToStory,
}: {
  readonly source: PublishedSource;
  readonly shown: ShownIntentLocations;
  readonly project: ModeChoice;
  readonly story?: IntentPageStory;
  readonly onBackToStory?: (() => void) | undefined;
}) {
  const { notice, locations, explanation, shownRevision } = shown;
  const { tab, chooseTab } = useStoryTab(story?.selection);
  const [filesShown, setFilesShown] = useKeptReading("filesShown", () => true);
  const tabsIdPrefix =
    story === undefined
      ? project.modeIdPrefix
      : `${project.modeIdPrefix}-story`;
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
  const browserView = story === undefined ? "ci" : "changed";
  const outside =
    story?.compared !== undefined && locations !== undefined
      ? intentStoryOverlay(locations, story.compared.shown.comparison.files)
          .outside
      : undefined;
  const panel = (name: string) => ({
    className: "intent-page-panel",
    tabIndex: -1,
    role: "tabpanel",
    id: intentTabPanelId(tabsIdPrefix, name),
    "aria-labelledby": intentTabId(tabsIdPrefix, name),
    hidden: view !== name,
  });
  const navigation =
    story !== undefined ? (
      <button
        type="button"
        id={toProjectIntentId(project.modeIdPrefix)}
        className="intent-open-link intent-story-crumb-link"
        onClick={story.onProjectIntent}
      >
        <Icon icon={Layers} /> Project Intent
      </button>
    ) : onBackToStory !== undefined ? (
      <button
        type="button"
        id={backToStoryId(project.modeIdPrefix)}
        className="intent-open-link intent-story-crumb-link"
        onClick={onBackToStory}
      >
        <Icon icon={ArrowLeft} /> Back to selected story
      </button>
    ) : undefined;
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
          outside={outside}
          navigation={navigation}
          projectVisit={onBackToStory !== undefined}
          browserRevision={shownRevision}
        />
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
          <FileBrowserToggle
            icon
            browser={
              view === browserView && locations !== undefined
                ? files
                : undefined
            }
            onShowBrowser={setFilesShown}
          />
        </div>
        {story === undefined && notice}
        {story !== undefined && (
          <div {...panel("ci")}>
            <IntentCiStatus />
          </div>
        )}
        {explanation !== undefined && (
          <div {...panel(story === undefined ? view : "changed")}>
            {explanation}
            {story === undefined && project.mode === "ci" ? (
              <IntentCiStatus />
            ) : null}
          </div>
        )}
        {story !== undefined && (
          <div {...panel("coverage")}>
            <IntentStoryCoverage story={story.summary.story} />
          </div>
        )}
      </div>
      {locations !== undefined && shownRevision !== undefined && (
        <IntentBrowser
          source={source}
          revision={shownRevision}
          locations={locations}
          project={story === undefined ? project : undefined}
          storySummary={story?.summary}
          story={story?.compared}
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
      locations={locations}
      panelId={intentTabPanelId(tabsIdPrefix, browserView)}
      onOpen={(path) => {
        setSelection({ path, scope: "location" });
        if (story === undefined) project.onModeChange("ci");
        else chooseTab("changed");
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
