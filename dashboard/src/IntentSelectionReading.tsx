// Intent's selection reading (`./IntentBrowser.tsx`): in Project Intent the
// trunk's CI status when nothing is selected (`./IntentCiStatus.tsx`), or in
// the selected story's Changed tests, whose CI comparison is its own view
// (`./intentStoryTabs.tsx`), a prompt to choose a changed test; Summary
// (`./IntentSummary.tsx`) or Purpose and Proof tabs (`./IntentFileReading.tsx`)
// once a location, folder or file is selected. A selection the shown revision
// does not hold is explained instead (`./IntentRevisionNotice.tsx`). CI status
// and a Summary read the scope's CI evidence owner (`./IntentCiEvidence.tsx`).
// Activating Project Intent's CI status tab returns home
// (`./IntentModeTabs.tsx`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import {
  IntentFileReading,
  type FileRead,
  type IntentFileReadingPlace,
} from "./IntentFileReading.tsx";
import { IntentPathNotInRevision } from "./IntentRevisionNotice.tsx";
import { IntentSummary } from "./IntentSummary.tsx";
import { filesOfSelection } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import type { ComparedStory } from "./IntentStorySummary.tsx";

export function IntentSelectionReading({
  revision,
  fileRevision,
  failedRevision,
  selection,
  missing,
  selectedLocation,
  selectedFile,
  selectedSyntaxHint,
  treeFiles,
  story,
  read,
  onFileRetry,
  onOpen,
  readingKey,
  fileReading,
  storySelected,
}: {
  readonly revision: string;
  // The revision of the file text shown, and a later one whose read failed.
  readonly fileRevision: string;
  readonly failedRevision: string | undefined;
  readonly selection: IntentSelection;
  // The selection is not held by the shown revision.
  readonly missing: boolean;
  readonly selectedLocation: IntentLocation | undefined;
  readonly selectedFile: IntentTreeFile | undefined;
  readonly selectedSyntaxHint: string | undefined;
  // The files the tree lists by repository path, a selected story's overlay
  // included.
  readonly treeFiles: ReadonlyMap<string, IntentTreeFile>;
  readonly story: ComparedStory | undefined;
  readonly read: FileRead | undefined;
  readonly onFileRetry: () => void;
  readonly onOpen: (next: IntentSelection) => void;
  // Fresh reading key after a revealed open from the candidate record.
  readonly readingKey: number;
  // Purpose or Proof, kept across file selections.
  readonly fileReading: IntentFileReadingPlace;
  // This reading is the selected story's Changed tests view.
  readonly storySelected: boolean;
}) {
  const scope = selectionScope(selection);
  if (scope === "none") {
    return storySelected ? (
      <p className="quiet intent-changed-tests-prompt">
        Choose a test, folder or location to read its Purpose and Proof.
      </p>
    ) : (
      <IntentCiStatus />
    );
  }
  return (
    <>
      {missing ? (
        <IntentPathNotInRevision path={selection.path} revision={revision} />
      ) : (scope === "location" || scope === "folder") &&
        selectedLocation !== undefined ? (
        <IntentSummary
          key={`${revision}:${selection.path}`}
          path={selection.path}
          files={filesOfSelection(treeFiles, selection)}
          treeFiles={treeFiles}
          location={selectedLocation}
          revision={revision}
          onOpen={onOpen}
        />
      ) : scope === "file" ? (
        <IntentFileReading
          key={readingKey}
          place={fileReading}
          path={selection.path}
          revision={fileRevision}
          treeRevision={revision}
          failedRevision={failedRevision}
          read={read}
          syntaxHint={selectedSyntaxHint}
          caseTarget={selection.caseTarget}
          treeFile={selectedFile}
          story={story}
          onFileRetry={onFileRetry}
        />
      ) : null}
    </>
  );
}
