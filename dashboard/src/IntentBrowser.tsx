// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`, drawn and owned by
// `./IntentPerspective.tsx`, kept per project by `./pageIntentMode.tsx`); Intent
// shows the locations. Locations and folders share caret (expansion only) and name
// (select; toggle once selected) controls; a caret never changes selection or
// the reading pane. A file, or nothing selected yet, shows Purpose and Proof
// as tabs or side by side (`./IntentFileReading.tsx`), one reader layout this
// browser keeps (`./keptPreference.ts`); a location or folder name shows a
// Summary (`./IntentSummary.tsx`). The record fills the content area
// without the locations; it is read the first time it is chosen and stays
// mounted after, so opening a test from it and returning does not reread it. A
// failed file read keeps its own explanation and retry; a failed proof read's
// retry reads the locations again without changing the selection. Selection is
// owned by the Intent workspace (`./intentWorkspaceSelection.ts`).

import { useEffect, useId, useRef, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import {
  IntentFileReading,
  type FileRead,
  type IntentReadingLayout,
  type IntentReadingTab,
} from "./IntentFileReading.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { keptChoice } from "./keptPreference.ts";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { IntentSummary } from "./IntentSummary.tsx";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { filesOfSelection, owningLocation } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";

// The reader layout this browser keeps for every project, tabs where it keeps
// an unusable one, and otherwise the one chosen on this page, even where the
// browser keeps nothing.
const keptLayout = keptChoice<IntentReadingLayout>(
  "open-dough.intent.layout",
  "tabs",
  (kept) => (kept === "side-by-side" ? "side-by-side" : "tabs"),
);

export function IntentBrowser({
  source,
  revision,
  locations,
  proofRereading,
  onProofRetry,
  mode,
  modeIdPrefix,
  onModeChange,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  // Whether the locations, with their proof, are being read again after a
  // proof read failed; the selection and reader stay as they are.
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
  // The strip's mode and ids; opening a test from the record returns this
  // browser to Intent.
} & ModeChoice) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const scope = selectionScope(selection);
  const selectedPath = selection.path;
  // The record is read the first time Candidates is shown, then kept.
  const [candidatesChosen, setCandidatesChosen] = useState(
    mode === "candidates",
  );
  if (mode === "candidates" && !candidatesChosen) setCandidatesChosen(true);
  const [returnEntrySlug, setReturnEntrySlug] = useState<string | undefined>();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  // The answered read of one path; Purpose and Proof show it only while that
  // path is the one selected, so a new selection never pairs with the
  // previous text, and anything else reads as still reading.
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  // Purpose or Proof, kept across file selections (`./IntentFileReading.tsx`).
  const [readingTab, setReadingTab] = useState<IntentReadingTab>("purpose");
  // Tabs or side by side, one choice this browser keeps for every project;
  // held here so a record open, which starts a fresh reading, keeps it.
  const [readingLayout, setReadingLayout] = useState(keptLayout.read);
  // Each open from the record starts a fresh reading, positioned on its case.
  const [recordOpens, setRecordOpens] = useState(0);
  const readingArea = useRef<HTMLDivElement | null>(null);
  const readingIdPrefix = useId();
  const inventory = inventoryFromIntentLocations(locations);
  const treeSelection: IntentSelection =
    mode === "intent" ? selection : { path: "" };

  function openFromRecord(next: IntentSelection, entrySlug: string) {
    setSelection(next.scope === undefined ? { ...next, scope: "file" } : next);
    setReturnEntrySlug(entrySlug);
    onModeChange("intent");
    setReadingTab("purpose");
    setRecordOpens((n) => n + 1);
    const owning = locations.find((location) =>
      location.files.includes(next.path),
    );
    if (owning !== undefined) setExpandedPath(owning.path);
  }

  function selectInTree(next: IntentSelection) {
    setSelection(next);
    setReturnEntrySlug(undefined);
    onModeChange("intent");
  }

  // Clearing selection when the project or locations change is owned by the
  // Intent workspace provider remounting on source/revision identity.
  useEffect(() => {
    if (scope !== "file" || selectedPath === "") return;
    const controller = new AbortController();
    setFileRead(undefined);
    void readRepositoryFileAt(source, selectedPath, revision, controller.signal)
      .then((text) => {
        if (!controller.signal.aborted) {
          setFileRead({ path: selectedPath, state: "ready", text });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFileRead({ path: selectedPath, state: "failed" });
        }
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, selectedPath, scope, fileRetry]);

  const selectedRead =
    scope === "file" && fileRead?.path === selectedPath ? fileRead : undefined;

  const selectedLocation = owningLocation(locations, selection);
  const selectedLanguage =
    scope === "file" ? selectedLocation?.kind : undefined;

  return (
    <>
      <div
        className="intent-browser"
        role="tabpanel"
        id={intentTabPanelId(modeIdPrefix, "intent")}
        aria-labelledby={intentTabId(modeIdPrefix, "intent")}
        hidden={mode !== "intent"}
      >
        <div className="intent-locations">
          <h3 className="visually-hidden">Purpose locations</h3>
          {locations.map((location) => (
            <IntentLocationGroup
              key={location.path}
              location={location}
              selection={treeSelection}
              onSelect={selectInTree}
              idPrefix={intentLocationIdPrefix(location.path)}
              expanded={expandedPath === location.path}
              onToggle={() => {
                setExpandedPath((was) =>
                  was === location.path ? null : location.path,
                );
              }}
            />
          ))}
        </div>
        <div className="intent-reading" tabIndex={-1} ref={readingArea}>
          {(scope === "location" || scope === "folder") &&
          selectedLocation !== undefined ? (
            <IntentSummary
              key={`${source.id}:${revision}:${selectedPath}`}
              path={selectedPath}
              files={filesOfSelection(selectedLocation, selection)}
              location={selectedLocation}
              source={source}
              revision={revision}
              proofRereading={proofRereading}
              onProofRetry={onProofRetry}
            />
          ) : null}
          {scope === "file" || scope === "none" ? (
            <IntentFileReading
              key={recordOpens}
              tab={readingTab}
              onChooseTab={setReadingTab}
              layout={readingLayout}
              onChooseLayout={(next) => {
                setReadingLayout(next);
                keptLayout.choose(next);
              }}
              idPrefix={readingIdPrefix}
              readingArea={readingArea}
              path={selectedPath}
              revision={revision}
              read={selectedRead}
              kind={selectedLanguage}
              caseTarget={selection.caseTarget}
              location={selectedLocation}
              proofRereading={proofRereading}
              onFileRetry={() => {
                setFileRetry((n) => n + 1);
              }}
              onProofRetry={onProofRetry}
            />
          ) : null}
        </div>
      </div>
      <div
        className="intent-candidates-panel"
        role="tabpanel"
        id={intentTabPanelId(modeIdPrefix, "candidates")}
        aria-labelledby={intentTabId(modeIdPrefix, "candidates")}
        hidden={mode !== "candidates"}
        tabIndex={-1}
      >
        {candidatesChosen ? (
          <IntentCandidatesRecord
            source={source}
            revision={revision}
            inventory={inventory}
            onOpenLocation={openFromRecord}
            {...(mode === "candidates" && returnEntrySlug !== undefined
              ? { focusEntrySlug: returnEntrySlug }
              : {})}
          />
        ) : null}
      </div>
    </>
  );
}
