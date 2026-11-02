// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`); entering Intent shows the
// locations. Locations and folders share caret (expansion only) and name
// (select; toggle once selected) controls; a caret never changes selection or
// the reading pane. A file shows Purpose and Proof; a location or folder name
// shows a Summary (`./IntentSummary.tsx`). The record fills the content area
// without the locations; it is read the first time it is chosen and stays
// mounted after, so opening a test from it and returning does not reread it. A
// failed file read keeps its own explanation and retry; a failed proof read's
// retry reads the locations again without changing the selection. Selection is
// owned by the Intent workspace (`./intentWorkspaceSelection.ts`).

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { IntentModeTabs, type IntentMode } from "./IntentModeTabs.tsx";
import { IntentProof } from "./IntentProof.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import { IntentSummary } from "./IntentSummary.tsx";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import { filesOfSelection, owningLocation } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";

type FileRead =
  | { readonly path: string; readonly state: "failed" }
  | { readonly path: string; readonly state: "ready"; readonly text: string };

export function IntentBrowser({
  source,
  revision,
  locations,
  proofRereading,
  onProofRetry,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  // Whether the locations, with their proof, are being read again after a
  // proof read failed; the selection and reader stay as they are.
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const scope = selectionScope(selection);
  const selectedPath = selection.path;
  const [mode, setMode] = useState<IntentMode>("intent");
  const [candidatesChosen, setCandidatesChosen] = useState(false);
  const [returnEntrySlug, setReturnEntrySlug] = useState<string | undefined>();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  // The answered read of one path; Purpose and Proof show it only while that
  // path is the one selected, so a new selection never pairs with the
  // previous text, and anything else reads as still reading.
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  const proofId = useId();
  const modeIdPrefix = useId();
  const inventory = inventoryFromIntentLocations(locations);
  const treeSelection: IntentSelection =
    mode === "intent" ? selection : { path: "" };

  function openFromRecord(next: IntentSelection, entrySlug: string) {
    setSelection(next.scope === undefined ? { ...next, scope: "file" } : next);
    setReturnEntrySlug(entrySlug);
    setMode("intent");
    const owning = locations.find((location) =>
      location.files.includes(next.path),
    );
    if (owning !== undefined) setExpandedPath(owning.path);
  }

  function selectInTree(next: IntentSelection) {
    setSelection(next);
    setReturnEntrySlug(undefined);
    setMode("intent");
  }

  function chooseMode(next: IntentMode) {
    setMode(next);
    if (next === "candidates") setCandidatesChosen(true);
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
  const text = selectedRead?.state === "ready" ? selectedRead.text : undefined;

  const selectedLocation = owningLocation(locations, selection);
  const selectedLanguage =
    scope === "file" ? selectedLocation?.kind : undefined;

  return (
    <>
      <IntentModeTabs
        mode={mode}
        idPrefix={modeIdPrefix}
        onSelect={chooseMode}
      />
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
        <div className="intent-reading" tabIndex={-1}>
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
            <>
              <section className="intent-purpose" aria-label="Purpose">
                <h3>Purpose</h3>
                {selectedPath === "" ? (
                  <p className="quiet">
                    Select a feature file to read its Purpose.
                  </p>
                ) : selectedRead?.state === "failed" ? (
                  <p className="intent-file-problem" role="alert">
                    {selectedPath} could not be read.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setFileRetry((n) => n + 1);
                      }}
                    >
                      Retry
                    </button>
                  </p>
                ) : text !== undefined ? (
                  <IntentSourceLines
                    text={text}
                    revision={revision}
                    path={selectedPath}
                    {...(selectedLanguage === undefined
                      ? {}
                      : { language: selectedLanguage })}
                    {...(selection.caseTarget === undefined
                      ? {}
                      : { caseTarget: selection.caseTarget })}
                  />
                ) : (
                  <p className="quiet">Reading {selectedPath}…</p>
                )}
              </section>
              <section className="intent-proof" aria-labelledby={proofId}>
                <h3 id={proofId}>Proof</h3>
                <IntentProof
                  path={selectedPath}
                  kind={selectedLanguage}
                  text={text}
                  proof={selectedLocation?.proof}
                  rereading={proofRereading}
                  onRetry={onProofRetry}
                />
              </section>
            </>
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
