// The Intent perspective of the selected project: Purpose reads configured
// test-source locations at Intent's reading revision
// (`./useShownIntentLocations.tsx`) through the authenticated read boundary
// (`./IntentBrowser.tsx`); CI status follows the observed work through
// Intent's one CI evidence owner (`./IntentCiEvidence.tsx`), shared by CI
// status, a Summary and a file's Proof. Unusable locations and failed reads
// each keep their own explanation; remaining locations stay browseable. The
// reading strip (`./IntentModeTabs.tsx`) is drawn here, above them. Without a
// selected story, CI status (`./IntentCiStatus.tsx`) is Intent's homepage when
// nothing is selected and sits beside location explanations. The chosen mode
// (`./pageIntentMode.tsx`) and the reading place (`./pageIntentReading.tsx`)
// are kept by the page per project. The strip and the browser share the
// selection, so directly activating the Intent tab returns home.
//
// With a story selected on the page, the Intent mode is that story's view
// (`./IntentStoryView.tsx`): one persistent header over **CI comparison**,
// opened on each new selection and read as soon as work is known, whatever
// the locations' state; **Changed tests**, the locations browser over the
// story's default Review changes comparison (`./useIntentStoryLens.ts`) or
// the locations' explanation; and **Intent coverage**. Once the comparison
// and the locations are known, the header counts the changed files outside
// every location. Optimization Candidates shows no story header.

import type { ReactNode } from "react";
import { IntentBrowser, type IntentBrowserPanel } from "./IntentBrowser.tsx";
import { IntentCiEvidenceProvider } from "./IntentCiEvidence.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentModeTabs } from "./IntentModeTabs.tsx";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import {
  IntentWorkspaceSelectionProvider,
  useIntentWorkspaceSelection,
} from "./intentWorkspaceSelection.ts";
import {
  useStorySummary,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import { intentStoryOverlay } from "./intentStoryOverlay.ts";
import { StoryCiReturnProvider, useStoryTab } from "./intentStoryTabs.tsx";
import {
  IntentStoryView,
  storyBrowserPanel,
  storyTabsIdPrefix,
} from "./IntentStoryView.tsx";
import type { LaunchRecord } from "./launchRecord.ts";
import type { LocalWorkspace } from "./localWorkspace.ts";
import { useIntentModeChoice, type ModeChoice } from "./pageIntentMode.tsx";
import { IntentReadingPlace, useKeptReading } from "./pageIntentReading.tsx";
import { useStorySelection } from "./pageStorySelection.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { useShownIntentLocations } from "./useShownIntentLocations.tsx";
import { useIntentStoryLens } from "./useIntentStoryLens.ts";
import "./intent-perspective.css";
import "./intent-candidates.css";

function IntentBody({
  source,
  work,
  selectedIdentity,
  mode,
  modeIdPrefix,
  onModeChange,
  storySummary,
  story,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  readonly selectedIdentity: string | undefined;
  // The selected story as its header names it, and with its comparison once
  // compared.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
} & ModeChoice) {
  // Whether the locations column shows, one choice kept with the reading
  // place for the toggle and the browser.
  const [filesShown, setFilesShown] = useKeptReading("filesShown", () => true);
  const files = { id: `${modeIdPrefix}-locations`, shown: filesShown };
  const { clearSelection } = useIntentWorkspaceSelection();
  // The selected story's chosen view.
  const { tab: storyTab, chooseTab } = useStoryTab(selectedIdentity);
  const { notice, shownRevision, settled, locations, explanation } =
    useShownIntentLocations(source, work);
  const storyShown = storySummary !== undefined;
  // The CI evidence owner reads, following the observed work, while CI can
  // show. Without a selected story it waits for locations to settle, lest the
  // browser's homepage replacing the loading explanation judge twice; a
  // selected story's CI comparison never moves, so it reads once work is known.
  const ciActive =
    (storyShown && work !== undefined) ||
    locations !== undefined ||
    (settled && mode === "intent");
  // Changed files outside every location, once both are known.
  const outside =
    story !== undefined && locations !== undefined
      ? intentStoryOverlay(locations, story.shown.comparison.files).outside
      : undefined;

  // An explanation in place of the locations browser, shown as the panel of
  // whichever location-reading mode is chosen, which takes the reading's
  // focus. Without a selected story, CI status sits beside terminal location
  // explanations in the Intent mode.
  const modePanel = (children: ReactNode, withCi: boolean) => (
    <div
      role="tabpanel"
      id={intentTabPanelId(modeIdPrefix, mode)}
      aria-labelledby={intentTabId(modeIdPrefix, mode)}
      tabIndex={-1}
    >
      {children}
      {mode === "intent" && withCi ? <IntentCiStatus /> : null}
    </div>
  );
  const browserPanel: IntentBrowserPanel = storyShown
    ? storyBrowserPanel(modeIdPrefix, storyTab, mode === "intent")
    : {
        id: intentTabPanelId(modeIdPrefix, "intent"),
        labelledBy: intentTabId(modeIdPrefix, "intent"),
        hidden: mode !== "intent",
      };

  return (
    <>
      <IntentModeTabs
        mode={mode}
        idPrefix={modeIdPrefix}
        onSelect={onModeChange}
        onHome={
          storyShown
            ? () => {
                chooseTab("ci");
              }
            : clearSelection
        }
        files={
          !storyShown && mode === "intent" && locations !== undefined
            ? files
            : undefined
        }
        onShowFiles={setFilesShown}
      />
      <IntentCiEvidenceProvider
        source={source}
        work={work}
        selectedIdentity={selectedIdentity}
        active={ciActive}
      >
        <StoryCiReturnProvider
          idPrefix={storyShown ? storyTabsIdPrefix(modeIdPrefix) : undefined}
          chooseTab={chooseTab}
        >
          {notice}
          {storySummary !== undefined && (
            <IntentStoryView
              summary={storySummary}
              source={source.id}
              outside={outside}
              modeIdPrefix={modeIdPrefix}
              modeShown={mode === "intent"}
              tab={storyTab}
              onChooseTab={chooseTab}
              explanation={explanation}
              files={locations !== undefined ? files : undefined}
              onShowFiles={setFilesShown}
            />
          )}
          {explanation !== undefined &&
            (!storyShown || mode !== "intent") &&
            modePanel(explanation, settled && !storyShown)}
          {locations !== undefined && work !== undefined && (
            // Tree and Purpose read the revision shown.
            <IntentBrowser
              source={source}
              revision={shownRevision ?? work.revision}
              locations={locations}
              mode={mode}
              modeIdPrefix={modeIdPrefix}
              onModeChange={onModeChange}
              storySummary={storySummary}
              story={story}
              files={files}
              panel={browserPanel}
            />
          )}
        </StoryCiReturnProvider>
      </IntentCiEvidenceProvider>
    </>
  );
}

export function IntentPerspective({
  source,
  work,
  records,
  workspaces,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // This machine's kept launch records, unread until supplied, and the
  // worktrees local Git found holding a story's claim.
  readonly records: readonly LaunchRecord[] | undefined;
  readonly workspaces: readonly LocalWorkspace[];
}) {
  // Intent reads the page's selected story: CI status judges its branch, and
  // the lens reads its comparison for the browser's overlay and the story's
  // header.
  const { selectedIdentity } = useStorySelection(source.id);
  const { mode, modeIdPrefix, onModeChange } = useIntentModeChoice(source.id);
  const { story, comparison, compared, retry } = useIntentStoryLens({
    source,
    work,
    selectedIdentity,
    records,
    workspaces,
  });
  const storySummary = useStorySummary(story, comparison, retry);
  return (
    <main
      className="intent-perspective"
      aria-label="Intent"
      {...(selectedIdentity !== undefined
        ? { "data-selected-story": selectedIdentity }
        : {})}
    >
      <IntentReadingPlace
        key={source.id}
        project={source.id}
        story={selectedIdentity}
      >
        {/* One Intent selection, kept with the project's reading place,
            shared by the strip's return home and the browser's tree and
            reading. */}
        <IntentWorkspaceSelectionProvider>
          <IntentBody
            source={source}
            work={work}
            selectedIdentity={selectedIdentity}
            mode={mode}
            modeIdPrefix={modeIdPrefix}
            onModeChange={onModeChange}
            storySummary={storySummary}
            story={compared}
          />
        </IntentWorkspaceSelectionProvider>
      </IntentReadingPlace>
    </main>
  );
}
