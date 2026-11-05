// Intent's selection reading (`./IntentBrowser.tsx`): CI status when nothing
// is selected (`./IntentCiStatus.tsx`); Summary (`./IntentSummary.tsx`) or
// Purpose and Proof (`./IntentFileReading.tsx`) once a location, folder or
// file is selected. CI status and a Summary read Intent's one CI evidence
// owner (`./IntentCiEvidence.tsx`). Activating the Intent reading tab returns home
// (`./IntentModeTabs.tsx`).

import type { RefObject } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import {
  IntentFileReading,
  type IntentReadingLayout,
  type IntentReadingTab,
  type FileRead,
} from "./IntentFileReading.tsx";
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
  selection,
  selectedLocation,
  selectedFile,
  selectedLanguage,
  story,
  read,
  onFileRetry,
  proofRereading,
  onProofRetry,
  onOpen,
  readingTab,
  onChooseTab,
  readingLayout,
  onChooseLayout,
  readingIdPrefix,
  readingArea,
  readingKey,
}: {
  readonly revision: string;
  readonly selection: IntentSelection;
  readonly selectedLocation: IntentLocation | undefined;
  readonly selectedFile: IntentTreeFile | undefined;
  readonly selectedLanguage: string | undefined;
  readonly story: ComparedStory | undefined;
  readonly read: FileRead | undefined;
  readonly onFileRetry: () => void;
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
  readonly onOpen: (next: IntentSelection) => void;
  readonly readingTab: IntentReadingTab;
  readonly onChooseTab: (next: IntentReadingTab) => void;
  readonly readingLayout: IntentReadingLayout;
  readonly onChooseLayout: (next: IntentReadingLayout) => void;
  readonly readingIdPrefix: string;
  readonly readingArea: RefObject<HTMLDivElement | null>;
  // Fresh reading key after a revealed open from the candidate record.
  readonly readingKey: number;
}) {
  const scope = selectionScope(selection);
  if (scope === "none") {
    return <IntentCiStatus />;
  }
  return (
    <>
      {(scope === "location" || scope === "folder") &&
      selectedLocation !== undefined ? (
        <IntentSummary
          key={`${revision}:${selection.path}`}
          path={selection.path}
          files={filesOfSelection(selectedLocation, selection)}
          location={selectedLocation}
          revision={revision}
          onOpen={onOpen}
        />
      ) : null}
      {scope === "file" ? (
        <IntentFileReading
          key={readingKey}
          tab={readingTab}
          onChooseTab={onChooseTab}
          layout={readingLayout}
          onChooseLayout={onChooseLayout}
          idPrefix={readingIdPrefix}
          readingArea={readingArea}
          path={selection.path}
          revision={revision}
          read={read}
          kind={selectedLanguage}
          caseTarget={selection.caseTarget}
          location={selectedLocation}
          treeFile={selectedFile}
          story={story}
          proofRereading={proofRereading}
          onFileRetry={onFileRetry}
          onProofRetry={onProofRetry}
        />
      ) : null}
    </>
  );
}
