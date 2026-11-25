// Intent's selection reading (`./IntentBrowser.tsx`): in Project Intent the
// trunk's CI status when nothing is selected (`./IntentCiStatus.tsx`); Summary
// (`./IntentSummary.tsx`) or Purpose and Proof tabs (`./IntentFileReading.tsx`)
// once a location, folder or file is selected. A selection the shown revision
// does not hold is explained instead (`./IntentRevisionNotice.tsx`). CI status
// and a Summary read the scope's CI evidence owner (`./IntentCiEvidence.tsx`).
// Activating Project Intent's CI status tab returns home
// (`./IntentPage.tsx`).

import { StoryNoteView } from "./StoryDiffNote.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import {
  IntentFileReading,
  storyDiffOf,
  type IntentFileReadingPlace,
} from "./IntentFileReading.tsx";
import { IntentPathNotInRevision } from "./IntentRevisionNotice.tsx";
import { IntentSummary } from "./IntentSummary.tsx";
import { WholeStoryNote } from "./IntentStoryComparison.tsx";
import {
  filesOfSelection,
  owningLocation,
  syntaxHintOfRepositoryPath,
  treeHoldsSelection,
} from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import {
  intentLocationFiles,
  type IntentTreeFile,
} from "./intentStoryOverlay.ts";
import type { ComparedStory } from "./IntentStorySummary.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { FileMoves } from "./StoryReviewFileMoves.tsx";
import { useIntentFileRead } from "./useIntentFileRead.ts";
import {
  useStoryResultFile,
  type StoryResultBrowse,
} from "./useStoryResultRead.tsx";

export function IntentSelectionReading({
  source,
  revision,
  result,
  comparisonReading,
  locations,
  selection,
  treeFiles,
  story,
  changedFiles,
  onMove,
  onOpen,
  readingKey,
  fileReading,
  storySelected,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly result: StoryResultBrowse | undefined;
  readonly comparisonReading: boolean;
  readonly locations: readonly IntentLocation[];
  readonly selection: IntentSelection;
  // The files the tree lists by repository path, a selected story's overlay
  // included.
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile>;
  readonly story: ComparedStory | undefined;
  readonly changedFiles: readonly IntentTreeFile[];
  readonly onMove: (path: string) => void;
  readonly onOpen: (next: IntentSelection) => void;
  // Fresh reading key after a revealed open from the candidate record.
  readonly readingKey: number;
  // Purpose or Proof, kept across file selections.
  readonly fileReading: IntentFileReadingPlace;
  // Story Home owns the empty-path view for a selected story.
  readonly storySelected: boolean;
}) {
  const scope = selectionScope(selection);
  const { path } = selection;
  const selectedLocation = owningLocation(locations, selection);
  const scopeFiles =
    selectedLocation !== undefined &&
    (scope === "location" || scope === "folder")
      ? intentLocationFiles(treeFiles, selectedLocation)
      : treeFiles;
  const file = scope === "file";
  const selectedFile = file ? treeFiles.get(path) : undefined;
  const selectedChange = storyDiffOf(story, selectedFile);
  const missing =
    scope !== "none" &&
    !comparisonReading &&
    !treeHoldsSelection(locations, treeFiles, selection) &&
    !treeHoldsSelection(locations, scopeFiles, selection);
  // Diff readings never request the unchanged source.
  const unread =
    missing ||
    selectedFile?.published === false ||
    selectedChange !== undefined ||
    comparisonReading;
  const followed = useIntentFileRead({
    source,
    revision,
    path,
    file,
    unread: result !== undefined || unread,
  });
  const pinned = useStoryResultFile(
    result?.pin,
    file && !unread ? path : undefined,
  );
  const fileRead = result === undefined ? followed : pinned;

  if (result?.reading === true && selectedChange === undefined) return null;
  if (scope === "none") {
    return storySelected ? null : <IntentCiStatus />;
  }
  return (
    <>
      {missing ? (
        <IntentPathNotInRevision path={path} revision={revision} />
      ) : (scope === "location" || scope === "folder") &&
        selectedLocation !== undefined ? (
        <>
          <WholeStoryNote whole={story?.wholeStory} />
          <IntentSummary
            key={`${revision}:${path}`}
            path={path}
            files={filesOfSelection(scopeFiles, selection)}
            treeFiles={scopeFiles}
            location={selectedLocation}
            revision={revision}
            onOpen={onOpen}
          />
        </>
      ) : scope === "file" ? (
        <StoryNoteView.Provider value="Intent → Changes">
          <IntentFileReading
            key={readingKey}
            place={fileReading}
            path={path}
            revision={fileRead.revision ?? revision}
            treeRevision={revision}
            failedRevision={fileRead.failedRevision}
            read={fileRead.read}
            syntaxHint={syntaxHintOfRepositoryPath(path, locations)}
            caseTarget={selection.caseTarget}
            treeFile={selectedFile}
            story={story}
            moves={
              selectedChange !== undefined && (
                <FileMoves
                  order={changedFiles}
                  selectedPath={path}
                  onMove={({ path }) => {
                    onMove(path);
                  }}
                />
              )
            }
            onFileRetry={fileRead.retry}
          />
        </StoryNoteView.Provider>
      ) : (
        <h3>
          <code>{path}</code>
        </h3>
      )}
    </>
  );
}
