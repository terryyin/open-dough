// Configured Intent locations browser (`./IntentPerspective.tsx`): Purpose
// shows a selected feature's published text with line numbers; Proof says
// none is available yet. A failed file read keeps its own explanation and
// retry while the location tree stays usable. Plain `IntentSourceLines`
// remains the source pane for later styling.

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { IntentLocationTree } from "./IntentLocationTree.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import type { PublishedSource } from "./publishedSource.ts";

export function IntentBrowser({
  source,
  revision,
  locations,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
}) {
  const [selectedPath, setSelectedPath] = useState("");
  const [text, setText] = useState<string | undefined>(undefined);
  const [fileState, setFileState] = useState<
    "none" | "reading" | "ready" | "failed"
  >("none");
  const [fileRetry, setFileRetry] = useState(0);
  const proofId = useId();

  // Clearing selection when the project or locations change is owned by the
  // parent remounting this browser on source/revision identity.
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

  return (
    <div className="intent-browser">
      <div className="intent-locations">
        <h3 className="visually-hidden">Purpose locations</h3>
        {locations.map((location) => (
          <IntentLocationTree
            key={location.path}
            location={location}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
            idPrefix={`intent-${location.path.replaceAll("/", "-")}`}
          />
        ))}
      </div>
      <div className="intent-reading">
        <section className="intent-purpose" aria-label="Purpose">
          <h3>Purpose</h3>
          {selectedPath === "" ? (
            <p className="quiet">Select a feature file to read its Purpose.</p>
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
              No Proof is available for this file yet. Intent does not collect
              or show test run observations here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
