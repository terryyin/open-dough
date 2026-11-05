// Intent's selection reading (`./IntentBrowser.tsx`): CI status when nothing
// is selected (`./IntentCiStatus.tsx`); Summary (`./IntentSummary.tsx`) or
// Purpose (`./IntentFileReading.tsx`) once a location, folder or file is
// selected. A selection the shown revision does not hold is explained instead
// (`./IntentRevisionNotice.tsx`). CI status and a Summary read Intent's one CI
// evidence owner (`./IntentCiEvidence.tsx`). Activating the Intent reading
// tab returns home (`./IntentModeTabs.tsx`).

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentFileReading, type FileRead } from "./IntentFileReading.tsx";
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
  selectedLanguage,
  story,
  read,
  onFileRetry,
  onOpen,
  readingKey,
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
  readonly selectedLanguage: string | undefined;
  readonly story: ComparedStory | undefined;
  readonly read: FileRead | undefined;
  readonly onFileRetry: () => void;
  readonly onOpen: (next: IntentSelection) => void;
  // Fresh reading key after a revealed open from the candidate record.
  readonly readingKey: number;
}) {
  const scope = selectionScope(selection);
  if (scope === "none") {
    return <IntentCiStatus />;
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
          files={filesOfSelection(selectedLocation, selection)}
          location={selectedLocation}
          revision={revision}
          onOpen={onOpen}
        />
      ) : scope === "file" ? (
        <IntentFileReading
          key={readingKey}
          path={selection.path}
          revision={fileRevision}
          failedRevision={failedRevision}
          read={read}
          kind={selectedLanguage}
          caseTarget={selection.caseTarget}
          treeFile={selectedFile}
          story={story}
          onFileRetry={onFileRetry}
        />
      ) : null}
    </>
  );
}
