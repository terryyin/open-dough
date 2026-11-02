// A selected Intent file's Purpose and Proof (`./IntentBrowser.tsx`), or the
// prompt to select one. Purpose reads the file's exact published text at the
// observed revision; a failed read keeps its own explanation and retry. A
// file the selected story changed (`./intentStoryOverlay.ts`) shows Review
// changes' own diff of it as its Purpose, and its Proof says it describes the
// published revision; a file the published revision does not list is never
// read there.

import { useEffect, useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { readRepositoryFileAt } from "./authenticatedRead.ts";
import { IntentProof } from "./IntentProof.tsx";
import { IntentSourceLines } from "./IntentSourceLines.tsx";
import type { ComparedStory } from "./IntentStoryLens.tsx";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision } from "./publishedWork.ts";
import { FileDiff } from "./StoryReviewFileDiff.tsx";
import { ReviewedFileName } from "./StoryReviewSnapshotView.tsx";

type FileRead =
  | { readonly path: string; readonly state: "failed" }
  | { readonly path: string; readonly state: "ready"; readonly text: string };

export function IntentFileReading({
  source,
  revision,
  selection,
  location,
  treeFile,
  story,
  proofRereading,
  onProofRetry,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  // A file selection, or none.
  readonly selection: IntentSelection;
  // The location owning the selected file.
  readonly location: IntentLocation | undefined;
  // The selected file as the location's tree shows it.
  readonly treeFile: IntentTreeFile | undefined;
  readonly story: ComparedStory | undefined;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const selectedPath = selection.path;
  // The answered read of one path; Purpose and Proof show it only while that
  // path is the one selected, so a new selection never pairs with the
  // previous text, and anything else reads as still reading.
  const [fileRead, setFileRead] = useState<FileRead | undefined>(undefined);
  const [fileRetry, setFileRetry] = useState(0);
  const proofId = useId();
  const change = treeFile?.change;
  // The selected change's *from* tree, as Review changes reads it.
  const changeFrom =
    change?.includesTrunkFrom ?? story?.shown.comparison.from ?? "";
  // A file the published revision does not list has no published text.
  const unpublished = treeFile?.published === false;
  useEffect(() => {
    if (selectedPath === "" || unpublished) return;
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
  }, [source, revision, selectedPath, fileRetry, unpublished]);

  const selectedRead = fileRead?.path === selectedPath ? fileRead : undefined;
  const text = selectedRead?.state === "ready" ? selectedRead.text : undefined;
  const language = selectedPath === "" ? undefined : location?.kind;

  return (
    <>
      <section className="intent-purpose" aria-label="Purpose">
        <h3>Purpose</h3>
        {selectedPath === "" ? (
          <p className="quiet">Select a feature file to read its Purpose.</p>
        ) : story !== undefined && change !== undefined ? (
          <div className="intent-story-diff">
            <p className="intent-story-diff-name">
              <ReviewedFileName file={change} />
            </p>
            <FileDiff
              // A new comparison or file is a new read.
              key={`${changeFrom}:${story.shown.tree}:${change.path}`}
              reviewed={story.shown.reviewed}
              from={changeFrom}
              tree={story.shown.tree}
              file={change}
            />
          </div>
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
            {...(language === undefined ? {} : { language })}
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
        {change !== undefined && (
          <p className="intent-proof-published">
            Proof describes the published revision{" "}
            <code>{shortRevision(revision)}</code>, not this story&apos;s
            version of the file.
          </p>
        )}
        {unpublished ? (
          <p className="quiet">The published revision has no {selectedPath}.</p>
        ) : (
          <IntentProof
            path={selectedPath}
            kind={language}
            text={text}
            proof={location?.proof}
            rereading={proofRereading}
            onRetry={onProofRetry}
          />
        )}
      </section>
    </>
  );
}
