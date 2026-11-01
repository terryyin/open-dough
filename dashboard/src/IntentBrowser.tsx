// Configured Intent locations browser (`./IntentPerspective.tsx`): each
// location is an exclusive expandable group; Purpose shows a selected
// feature's published text with line numbers and Gherkin styling; Proof lists
// its scenarios' latest committed observations (`./IntentProof.tsx`) from the
// location's proof, read with the locations. The Test Optimization Candidates
// record is the default reading view; selecting a location file shows Purpose
// while the location tree stays usable. A failed file read keeps its own
// explanation and retry; a failed proof read's retry reads the locations again
// without changing the selection. File selection (and an optional case target)
// is owned by the Intent workspace (`./intentWorkspaceSelection.ts`). Opening a
// test from the record keeps that view mounted so returning does not reread
// the record.

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
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

type ReadingView = "candidates" | "purpose";

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
  const [view, setView] = useState<ReadingView>("candidates");
  const [returnEntrySlug, setReturnEntrySlug] = useState<string | undefined>();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  // The answered read of one path; Purpose and Proof show it only while that
  // path is the one selected, so a new selection never pairs with the
  // previous text, and anything else reads as still reading.
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  const proofId = useId();
  const candidatesControlId = useId();
  const inventory = inventoryFromIntentLocations(locations);

  function openFromRecord(next: IntentSelection, entrySlug: string) {
    setSelection(next);
    setReturnEntrySlug(entrySlug);
    setView("purpose");
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

  return (
    <div className="intent-browser">
      <div className="intent-locations">
        <div className="intent-candidates-nav">
          <button
            type="button"
            id={candidatesControlId}
            className={
              view === "candidates"
                ? "intent-candidates-nav-button is-selected"
                : "intent-candidates-nav-button"
            }
            aria-pressed={view === "candidates"}
            onClick={() => {
              setView("candidates");
            }}
          >
            Test Optimization Candidates
          </button>
        </div>
        <h3 className="visually-hidden">Purpose locations</h3>
        {locations.map((location) => (
          <IntentLocationGroup
            key={location.path}
            location={location}
            selectedPath={view === "purpose" ? selectedPath : ""}
            onSelect={(path) => {
              setSelection({ path });
              setReturnEntrySlug(undefined);
              setView("purpose");
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
        <div hidden={view !== "candidates"}>
          <IntentCandidatesRecord
            source={source}
            revision={revision}
            inventory={inventory}
            onOpenLocation={openFromRecord}
            {...(view === "candidates" && returnEntrySlug !== undefined
              ? { focusEntrySlug: returnEntrySlug }
              : {})}
          />
        </div>
        {view === "purpose" ? (
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
  );
}
