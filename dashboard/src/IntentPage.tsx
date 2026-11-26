// Project evidence and selected-story Intent views share this page layout.
// The browser stays mounted while another view shows.

import { useEffect, useState } from "react";
import { FileBrowserToggle } from "./FileBrowserToggle.tsx";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { IntentBrowserFrame } from "./IntentBrowserFrame.tsx";
import { useIntentFiles } from "./IntentFilesDrawer.tsx";
import { intentBrowserSource } from "./intentBrowserSource.ts";
import { focusReturnEntry } from "./IntentCandidatesSections.tsx";
import { IntentCiComparisonPreference } from "./IntentCiComparisonPreference.tsx";
import { IntentCiEntryNavigation } from "./IntentCiEntryLink.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentHeader } from "./IntentHeader.tsx";
import { projectTabs } from "./intentProjectTabs.ts";
import { IntentStoryEvidence } from "./IntentStoryEvidence.tsx";
import type { ComparedStory, StorySummary } from "./IntentStorySummary.tsx";
import {
  StoryCiReturnProvider,
  useStoryTab,
  useReturnToStoryCi,
} from "./intentStoryTabs.tsx";
import {
  IntentTabs,
  intentTabPanelAttributes,
  intentTabPanelId,
} from "./IntentTabs.tsx";
import { useIntentWorkspaceSelection } from "./intentWorkspaceSelection.ts";
import type { ModeChoice } from "./pageIntentMode.tsx";
import type { SelectedStory } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { intentHomeMarks } from "./storyCardFocus.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";
import {
  storyReviewFileReadiness,
  useStoryReviewArrival,
} from "./useFirstStoryChangedFile.ts";
import { useStoryResultBrowse } from "./useStoryResultRead.tsx";
import { useProjectReading } from "./useProjectReading.ts";
import "./intent-page.css";

export type IntentPageStory = {
  readonly summary: StorySummary;
  readonly selection: SelectedStory | undefined;
  readonly compared: ComparedStory | undefined;
};

export function IntentPage({
  source,
  shown: followed,
  project,
  story,
}: {
  readonly source: PublishedSource;
  readonly shown: ShownIntentLocations;
  readonly project: ModeChoice;
  readonly story?: IntentPageStory;
}) {
  const { shown, project: projectReading } = useProjectReading(
    source,
    followed,
    story === undefined ? project : undefined,
  );
  const { notice, shownRevision } = shown;
  const result = useStoryResultBrowse(story?.summary.comparison, source.label);
  const {
    comparisonSourceUnavailable,
    locations: browserLocations,
    revision: browserRevision,
    explanation,
    lead,
  } = intentBrowserSource(
    shown,
    story?.summary.comparison,
    projectReading !== undefined,
    result,
  );
  const { tab, chooseTab } = useStoryTab(story?.selection);
  const hasBrowser =
    browserLocations !== undefined && browserRevision !== undefined;
  const tabsIdPrefix =
    story === undefined
      ? project.modeIdPrefix
      : `${project.modeIdPrefix}-story`;
  const fileReadiness = storyReviewFileReadiness(
    story?.summary.comparison,
    result?.reading ?? shown.reading === true,
    hasBrowser,
  );
  const files = useIntentFiles(`${tabsIdPrefix}-locations`);
  const { selection, clearSelection, setSelection } =
    useIntentWorkspaceSelection();
  const readingId = `${tabsIdPrefix}-path-reading`;
  const headerId = `${tabsIdPrefix}-review-feedback`;
  const pathVisible =
    story !== undefined && hasBrowser && selection.path !== "";
  useStoryReviewArrival({
    project: story?.selection?.project,
    readiness: fileReadiness,
    pathVisible,
    headerId,
    readingId,
  });
  const returnToCi = useReturnToStoryCi(
    story?.selection?.project,
    tabsIdPrefix,
    chooseTab,
    clearSelection,
  );
  const [entryReturns, setEntryReturns] = useState(0);
  useEffect(() => {
    if (entryReturns === 0) return;
    focusReturnEntry(
      document.getElementById(intentTabPanelId(tabsIdPrefix, "candidates")),
    );
  }, [entryReturns, tabsIdPrefix]);
  const panel = (name: string) =>
    intentTabPanelAttributes(tabsIdPrefix, name, project.mode);
  const filesToggle = (
    <FileBrowserToggle
      icon
      browser={
        hasBrowser && (story !== undefined || project.mode === "ci")
          ? files
          : undefined
      }
      onShowBrowser={files.onShow}
    />
  );
  const browser = hasBrowser && (
    <IntentBrowser
      source={source}
      revision={browserRevision}
      locations={browserLocations}
      lead={lead}
      result={result}
      project={projectReading}
      storySummary={story?.summary}
      story={story?.compared}
      reviewFileReady={fileReadiness === "ready"}
      files={files}
      panel={panel("ci")}
      storyPath={
        story === undefined
          ? undefined
          : {
              id: readingId,
              hidden: !pathVisible,
              onHome: () => {
                files.onReadingChosen();
                returnToCi();
              },
            }
      }
    />
  );
  const page = (
    <>
      <div
        className="intent-page-frame"
        data-intent-context={story === undefined ? "project" : "story"}
        data-fills={
          story === undefined && explanation !== undefined ? "true" : "false"
        }
      >
        <IntentHeader
          summary={story?.summary}
          source={source.id}
          browserRevision={shownRevision}
          filesToggle={filesToggle}
          reviewFeedbackId={story === undefined ? undefined : headerId}
        />
        {story === undefined && (
          <div className="intent-page-tabbar" {...intentHomeMarks}>
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
            {filesToggle}
          </div>
        )}
        {story === undefined && notice}
        {story === undefined &&
          (explanation !== undefined || comparisonSourceUnavailable) && (
            <div
              className="intent-page-panel"
              tabIndex={-1}
              {...panel(project.mode)}
            >
              {explanation}
              {project.mode === "ci" && <IntentCiStatus />}
            </div>
          )}
      </div>
      {story === undefined ? (
        browser
      ) : (
        <IntentBrowserFrame filesShown={hasBrowser && files.shown}>
          {browser}
          <IntentStoryEvidence
            story={story.summary}
            idPrefix={tabsIdPrefix}
            tab={tab}
            onTab={chooseTab}
            hidden={pathVisible}
            explanation={explanation}
          />
        </IntentBrowserFrame>
      )}
    </>
  );
  const navigablePage = (
    <IntentCiEntryNavigation
      locations={result?.locations ?? shown.locations}
      panelId={
        story === undefined ? intentTabPanelId(tabsIdPrefix, "ci") : readingId
      }
      onOpen={(path) => {
        setSelection({ path, scope: "location" });
        if (story === undefined) project.onModeChange("ci");
      }}
    >
      {page}
    </IntentCiEntryNavigation>
  );
  return story === undefined ? (
    navigablePage
  ) : (
    <StoryCiReturnProvider value={returnToCi}>
      <IntentCiComparisonPreference>
        {navigablePage}
      </IntentCiComparisonPreference>
    </StoryCiReturnProvider>
  );
}
