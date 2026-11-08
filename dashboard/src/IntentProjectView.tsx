// **Project Intent** (`./IntentPerspective.tsx`): the project's own evidence,
// read in its own reading scope (`./pageIntentReading.tsx`) and its own
// selection (`./intentWorkspaceSelection.ts`). It is Intent's landing with no
// selected story, and a visit from a selected story leaves that story, its
// view and its reading place as they were. Its heading and views
// (`./IntentModeTabs.tsx`) hold **CI status**, the locations browser
// (`./IntentBrowser.tsx`) with the trunk's CI status as the empty-selection
// homepage, and **Optimization Candidates**. Unusable locations and failed
// reads each keep their own explanation as the chosen view's panel, CI status
// beside a settled one. Opening a candidate's test shows it under CI status;
// activating Optimization Candidates again returns to that entry, with the
// keyboard. CI here is the project's trunk evidence, whatever
// story is selected (`./IntentCiEvidence.tsx`), and a file the story changed
// reads its published text at Intent's reading revision.

import { useEffect, useState } from "react";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import { IntentBrowser } from "./IntentBrowser.tsx";
import { focusReturnEntry } from "./IntentCandidatesSections.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentModeTabs } from "./IntentModeTabs.tsx";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import { useIntentWorkspaceSelection } from "./intentWorkspaceSelection.ts";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { useKeptReading } from "./pageIntentReading.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import type { ShownIntentLocations } from "./useShownIntentLocations.tsx";

export function IntentProjectView({
  source,
  work,
  shown,
  project,
  onBackToStory,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork | undefined;
  // Intent's locations at the reading revision.
  readonly shown: ShownIntentLocations;
  // The chosen view and its tab ids.
  readonly project: ModeChoice;
  // Back to the page's selected story, when one is selected.
  readonly onBackToStory: (() => void) | undefined;
}) {
  const { mode, modeIdPrefix, onModeChange } = project;
  const { notice, settled, locations, explanation, shownRevision } = shown;
  // Whether the locations column shows, kept with Project Intent's reading.
  const [filesShown, setFilesShown] = useKeptReading("filesShown", () => true);
  const files: FileBrowserPlace = {
    id: `${modeIdPrefix}-locations`,
    shown: filesShown,
  };
  const { clearSelection } = useIntentWorkspaceSelection();
  // Each direct return to Optimization Candidates gives the keyboard to the
  // entry a test was opened from, once the record shows again.
  const [entryReturns, setEntryReturns] = useState(0);
  useEffect(() => {
    if (entryReturns === 0) return;
    focusReturnEntry(
      document.getElementById(intentTabPanelId(modeIdPrefix, "candidates")),
    );
  }, [entryReturns, modeIdPrefix]);
  return (
    <>
      <IntentModeTabs
        mode={mode}
        idPrefix={modeIdPrefix}
        onSelect={onModeChange}
        onHome={clearSelection}
        onCandidates={() => {
          setEntryReturns((n) => n + 1);
        }}
        files={mode === "ci" && locations !== undefined ? files : undefined}
        onShowFiles={setFilesShown}
        onBackToStory={onBackToStory}
      />
      {notice}
      {explanation !== undefined && (
        // An explanation in place of the locations browser, as the chosen
        // view's panel, which takes the reading's focus.
        <div
          role="tabpanel"
          id={intentTabPanelId(modeIdPrefix, mode)}
          aria-labelledby={intentTabId(modeIdPrefix, mode)}
          tabIndex={-1}
        >
          {explanation}
          {mode === "ci" && settled ? <IntentCiStatus /> : null}
        </div>
      )}
      {locations !== undefined && work !== undefined && (
        // Tree and Purpose read the revision shown.
        <IntentBrowser
          source={source}
          revision={shownRevision ?? work.revision}
          locations={locations}
          project={project}
          storySummary={undefined}
          story={undefined}
          files={files}
          panel={{
            id: intentTabPanelId(modeIdPrefix, "ci"),
            labelledBy: intentTabId(modeIdPrefix, "ci"),
            hidden: mode !== "ci",
          }}
        />
      )}
    </>
  );
}
