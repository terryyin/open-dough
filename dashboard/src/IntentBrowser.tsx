// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`, drawn and owned by
// `./IntentPerspective.tsx`, kept per project by `./pageIntentMode.tsx`);
// Intent shows the locations. Locations and folders share caret (expansion
// only) and name (select; toggle once selected) controls; a caret never
// changes selection or the reading pane. A file shows Purpose and Proof; a
// location or folder name shows a Summary (`./IntentSummary.tsx`), whose child
// names and slowest rows open their target as the record's links do. The
// record replaces the locations in the content area, read once chosen and kept
// mounted. A failed file read keeps its own explanation and retry; a failed
// proof read's retry rereads the locations without changing the selection.
// Selection is owned by the Intent workspace (`./intentWorkspaceSelection.ts`).

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import {
  IntentLocationGroup,
  type TreeReveal,
} from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { intentModePanelId, intentModeTabId } from "./IntentModeTabs.tsx";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { IntentProof } from "./IntentProof.tsx";
import { IntentProofGeneration } from "./IntentProofGeneration.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import { IntentSummary } from "./IntentSummary.tsx";
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
  const [reveal, setReveal] = useState<TreeReveal | undefined>();
  // The answered read of one path; Purpose and Proof show it only while that
  // path is the one selected, so a new selection never pairs with the
  // previous text, and anything else reads as still reading.
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  const proofId = useId();
  const inventory = inventoryFromIntentLocations(locations);
  const treeSelection: IntentSelection =
    mode === "intent" ? selection : { path: "" };

  function select(next: IntentSelection, entrySlug?: string) {
    setSelection(next);
    setReturnEntrySlug(entrySlug);
    onModeChange("intent");
  }

  // Opening from the candidate record or drilling down from a summary
  // selects as the tree does (a record entry is a file without a scope) and
  // reveals it there: its location opens, its ancestor folders un-collapse.
  function openRevealed(next: IntentSelection, entrySlug?: string) {
    select(
      next.scope === undefined ? { ...next, scope: "file" } : next,
      entrySlug,
    );
    const owning = owningLocation(locations, next);
    if (owning !== undefined) setExpandedPath(owning.path);
    setReveal({ path: next.path });
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
      <div
        className="intent-browser"
        role="tabpanel"
        id={intentModePanelId(modeIdPrefix, "intent")}
        aria-labelledby={intentModeTabId(modeIdPrefix, "intent")}
        hidden={mode !== "intent"}
      >
        <div className="intent-locations">
          <h3 className="visually-hidden">Purpose locations</h3>
          {locations.map((location) => (
            <IntentLocationGroup
              key={location.path}
              location={location}
              selection={treeSelection}
              onSelect={select}
              reveal={reveal}
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
              onOpen={openRevealed}
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
                <IntentProofGeneration location={selectedLocation} />
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
        id={intentModePanelId(modeIdPrefix, "candidates")}
        aria-labelledby={intentModeTabId(modeIdPrefix, "candidates")}
        hidden={mode !== "candidates"}
        tabIndex={-1}
      >
        {candidatesChosen ? (
          <IntentCandidatesRecord
            source={source}
            revision={revision}
            inventory={inventory}
            onOpenLocation={openRevealed}
            {...(mode === "candidates" && returnEntrySlug !== undefined
              ? { focusEntrySlug: returnEntrySlug }
              : {})}
          />
        ) : null}
      </div>
    </>
  );
}
