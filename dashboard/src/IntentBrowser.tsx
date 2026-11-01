// Configured Intent locations browser (`./IntentPerspective.tsx`): Purpose
// shows a selected feature's published text with line numbers and Gherkin
// styling; Proof says none is available yet. The Test Optimization
// Candidates record is the default reading view; selecting a location file
// shows Purpose while the location tree stays usable. A failed file read
// keeps its own explanation and retry. File selection (and an optional case
// target) is owned by the Intent workspace (`./intentWorkspaceSelection.ts`).

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import { IntentLocationTree } from "./IntentLocationTree.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import { useIntentWorkspaceSelection } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";

type ReadingView = "candidates" | "purpose";

export function IntentBrowser({
  source,
  revision,
  locations,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
}) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const selectedPath = selection.path;
  const [view, setView] = useState<ReadingView>("candidates");
  const [text, setText] = useState<string | undefined>(undefined);
  const [fileState, setFileState] = useState<
    "none" | "reading" | "ready" | "failed"
  >("none");
  const [fileRetry, setFileRetry] = useState(0);
  const proofId = useId();
  const candidatesControlId = useId();

  // Clearing selection when the project or locations change is owned by the
  // Intent workspace provider remounting on source/revision identity.
  useEffect(() => {
    if (selectedPath === "") {
      setText(undefined);
      setFileState("none");
      return;
    }
    const controller = new AbortController();
    setFileState("reading");
    setText(undefined);
    void readRepositoryFileAt(source, selectedPath, revision, controller.signal)
      .then((body) => {
        if (!controller.signal.aborted) {
          setText(body);
          setFileState("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setText(undefined);
          setFileState("failed");
        }
      });
    return () => {
      controller.abort();
    };
  }, [source, revision, selectedPath, fileRetry]);

  // The location's kind (with path for typescript/.tsx) selects the grammar.
  const selectedLanguage = locations.find((location) =>
    location.files.includes(selectedPath),
  )?.kind;

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
          <IntentLocationTree
            key={location.path}
            location={location}
            selectedPath={view === "purpose" ? selectedPath : ""}
            onSelect={(path) => {
              setSelection({ path });
              setView("purpose");
            }}
            idPrefix={`intent-${location.path.replaceAll("/", "-")}`}
          />
        ))}
      </div>
      <div className="intent-reading" tabIndex={-1}>
        {view === "candidates" ? (
          <IntentCandidatesRecord source={source} revision={revision} />
        ) : (
          <>
            <section className="intent-purpose" aria-label="Purpose">
              <h3>Purpose</h3>
              {selectedPath === "" ? (
                <p className="quiet">
                  Select a feature file to read its Purpose.
                </p>
              ) : fileState === "reading" ? (
                <p className="quiet">Reading {selectedPath}…</p>
              ) : fileState === "failed" ? (
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
                />
              ) : (
                <p className="quiet">Reading {selectedPath}…</p>
              )}
            </section>
            <section className="intent-proof" aria-labelledby={proofId}>
              <h3 id={proofId}>Proof</h3>
              {selectedPath === "" ? (
                <p className="quiet">Select a feature file to see its Proof.</p>
              ) : (
                <p>
                  No Proof is available for this file yet. Intent does not
                  collect or show test run observations here.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
