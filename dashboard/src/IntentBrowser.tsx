// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`); entering Intent shows the
// locations. Each location is an exclusive expandable group; Purpose shows a
// selected feature's published text with line numbers and Gherkin styling;
// Proof lists its scenarios' latest committed observations
// (`./IntentProof.tsx`) from the location's proof, read with the locations.
// The record fills the content area without the locations; it is read the
// first time it is chosen and stays mounted after, so opening a test from it
// and returning does not reread it. A failed file read keeps its own
// explanation and retry; a failed proof read's retry reads the locations
// again without changing the selection. File selection (and an optional case
// target) is owned by the Intent workspace (`./intentWorkspaceSelection.ts`).

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import {
  IntentModeTabs,
  intentModePanelId,
  intentModeTabId,
  type IntentMode,
} from "./IntentModeTabs.tsx";
import { IntentProof } from "./IntentProof.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import {
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
  // proof read failed; the selection and Purpose stay as they are.
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
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

  function openFromRecord(next: IntentSelection, entrySlug: string) {
    setSelection(next);
    setReturnEntrySlug(entrySlug);
    setMode("intent");
    const owning = locations.find((location) =>
      location.files.includes(next.path),
    );
    if (owning !== undefined) setExpandedPath(owning.path);
  }

  // Clearing selection when the project or locations change is owned by the
  // Intent workspace provider remounting on source/revision identity.
  useEffect(() => {
    if (selectedPath === "") return;
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
  }, [source, revision, selectedPath, fileRetry]);

  const selectedRead = fileRead?.path === selectedPath ? fileRead : undefined;
  const text = selectedRead?.state === "ready" ? selectedRead.text : undefined;

  // The location's kind (with path for typescript/.tsx) selects the grammar.
  const selectedLocation = locations.find((location) =>
    location.files.includes(selectedPath),
  );
  const selectedLanguage = selectedLocation?.kind;

  function chooseMode(next: IntentMode) {
    setMode(next);
    if (next === "candidates") setCandidatesChosen(true);
  }

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
              selectedPath={selectedPath}
              onSelect={(path) => {
                setSelection({ path });
                setReturnEntrySlug(undefined);
              }}
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
