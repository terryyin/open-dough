// Configured Intent locations browser, drawn once for each reading scope
// (`./pageIntentReading.tsx`), each with its own selection, reading and
// arrangement: Project Intent's CI status view, beside its Test Optimization
// Candidates record, or the selected story's **Changes** view (each
// `./IntentPage.tsx`'s), its panel named by the caller and hidden, still
// mounted, while another view shows. Locations (book icon) and folders (folder
// icon) share toggle (expansion only) and name (select; toggle once selected)
// controls; a toggle never changes selection or the reading pane. What a
// selection reads is `./IntentSelectionReading.tsx`'s; a Summary's child names
// open their target as the record's links do (`./IntentCandidatesRecord.tsx`).
// A failed file read keeps its own explanation and retry. Selection is owned by
// the scope's Intent workspace (`./intentWorkspaceSelection.ts`). With a
// selected story's comparison, the trees follow it (`./useIntentStoryTree.ts`)
// under its "Selected story only" choice. A file the published revision does
// not list is never read. The kept reading place owns selection, reveal, tabs
// and scroll across unmounts. The outside files follow the locations. Hide
// files hides the column without unmounting it.

import type { ReactNode } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import { IntentCandidatesPanel } from "./IntentCandidatesRecord.tsx";
import { storyDiffOf, useKeptFileReadingPlace } from "./IntentFileReading.tsx";
import { IntentTreeGroups } from "./IntentTreeGroups.tsx";
import { IntentSelectionReading } from "./IntentSelectionReading.tsx";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { useKeptArrangement, useKeptReading } from "./pageIntentReading.tsx";
import {
  owningLocation,
  syntaxHintOfRepositoryPath,
  treeHoldsSelection,
} from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { FileMoves } from "./StoryReviewFileMoves.tsx";
import {
  intentChangedFileOrder,
  overlayFilesByPath,
} from "./intentStoryOverlay.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useIntentFileRead } from "./useIntentFileRead.ts";
import { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";
import {
  StoryTreeScopeChoice,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import "./intent-browser.css";

// The browser's tabpanel: its id, naming tab, and whether it is hidden.
export type IntentBrowserPanel = {
  readonly id: string;
  readonly labelledBy: string;
  readonly hidden: boolean;
};

export function IntentBrowser({
  source,
  revision,
  locations,
  lead,
  project,
  storySummary,
  story,
  files,
  panel,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  readonly lead?: ReactNode;
  // The selected story with what is known of its comparison, and the
  // comparison once read.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
  // The locations column's id and whether Hide files / Show files shows it.
  readonly files: FileBrowserPlace;
  readonly panel: IntentBrowserPanel;
  // Project Intent's chosen view and ids, in Project Intent: opening a test
  // from the record returns this browser to CI status.
  readonly project: ModeChoice | undefined;
}) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const scope = selectionScope(selection);
  const selectedPath = selection.path;
  const [returnEntrySlug, setReturnEntrySlug] = useKeptReading<
    string | undefined
  >("returnEntrySlug", () => undefined);
  const [expandedPath, setExpandedPath] = useKeptArrangement<string | null>(
    "expandedPath",
    () => null,
  );
  const [reveal, setReveal] = useKeptArrangement<TreeReveal | undefined>(
    "reveal",
    () => undefined,
  );
  // Each revealed open starts a fresh reading, positioned on its case.
  const [revealedOpens, setRevealedOpens] = useKeptReading(
    "revealedOpens",
    () => 0,
  );
  const fileReading = useKeptFileReadingPlace();
  const treeSelection: IntentSelection =
    project === undefined || project.mode === "ci" ? selection : { path: "" };
  const storyTree = useIntentStoryTree({
    locations,
    story,
    onExpandLocation: setExpandedPath,
  });
  const { overlay, scope: storyScope } = storyTree;

  function select(next: IntentSelection, entrySlug?: string) {
    setSelection(next);
    setReturnEntrySlug(entrySlug);
    project?.onModeChange("ci");
  }

  function revealInTree(path: string, location: string | undefined) {
    if (location !== undefined) setExpandedPath(location);
    setReveal({ path });
  }

  // Candidate and summary opens start fresh in Purpose at the case.
  function openRevealed(next: IntentSelection, entrySlug?: string) {
    select(
      next.scope === undefined ? { ...next, scope: "file" } : next,
      entrySlug,
    );
    fileReading.setTab("purpose");
    setRevealedOpens((n) => n + 1);
    revealInTree(next.path, owningLocation(locations, next)?.path);
  }

  const treeFiles = overlayFilesByPath(locations, overlay);
  const selectedFile =
    scope === "file" ? treeFiles.get(selectedPath) : undefined;
  const selectedChange = storyDiffOf(story, selectedFile);
  const moves =
    selectedChange === undefined ? undefined : (
      <FileMoves
        order={intentChangedFileOrder(locations, storyTree.shownOverlay)}
        selectedPath={selectedPath}
        onMove={({ path, location }) => {
          select({ path, scope: "file" });
          revealInTree(path, location);
          fileReading.readingArea.current?.scrollTo({ top: 0 });
        }}
      />
    );
  // A selected path the shown revision does not hold, as after moving to a
  // revision that deleted it, is explained in Purpose, nothing else selected.
  // A file the story's comparison adds may yet appear while it is read.
  const missing =
    scope !== "none" &&
    storySummary?.comparison.state !== "reading" &&
    !treeHoldsSelection(locations, treeFiles, selection);
  // A file the published revision does not list has no published text, and
  // one whose Purpose is the story's diff needs none; while the comparison is
  // read, as when Intent reopens on a kept selection, that is not yet known.
  const fileRead = useIntentFileRead({
    source,
    revision,
    path: selectedPath,
    file: scope === "file",
    unread:
      missing ||
      selectedFile?.published === false ||
      selectedChange !== undefined ||
      storySummary?.comparison.state === "reading",
  });

  const selectedLocation = owningLocation(locations, selection);
  const selectedSyntaxHint =
    scope === "file"
      ? syntaxHintOfRepositoryPath(selectedPath, locations)
      : undefined;

  return (
    <>
      <div
        className={
          files.shown ? "intent-browser" : "intent-browser intent-files-hidden"
        }
        role="tabpanel"
        id={panel.id}
        aria-labelledby={panel.labelledBy}
        hidden={panel.hidden}
      >
        <div className="intent-locations" id={files.id} hidden={!files.shown}>
          <h3 className="visually-hidden">Purpose locations</h3>
          {lead}
          {storyScope !== undefined && (
            <StoryTreeScopeChoice scope={storyScope} />
          )}
          <IntentTreeGroups
            locations={locations}
            tree={storyTree}
            selection={treeSelection}
            onSelect={select}
            reveal={reveal}
            expandedPath={expandedPath}
            onExpandedPath={setExpandedPath}
          />
        </div>
        <div
          ref={fileReading.readingArea}
          className="intent-reading"
          tabIndex={-1}
        >
          <IntentSelectionReading
            revision={revision}
            fileRevision={fileRead.revision ?? revision}
            failedRevision={fileRead.failedRevision}
            selection={selection}
            missing={missing}
            selectedLocation={selectedLocation}
            selectedFile={selectedFile}
            selectedSyntaxHint={selectedSyntaxHint}
            treeFiles={treeFiles}
            story={story}
            moves={moves}
            read={fileRead.read}
            onFileRetry={fileRead.retry}
            onOpen={openRevealed}
            readingKey={revealedOpens}
            fileReading={fileReading.place}
            storySelected={storySummary !== undefined}
          />
        </div>
      </div>
      {project !== undefined && (
        <IntentCandidatesPanel
          source={source}
          revision={revision}
          locations={locations}
          mode={project.mode}
          modeIdPrefix={project.modeIdPrefix}
          returnEntrySlug={returnEntrySlug}
          onOpenLocation={openRevealed}
        />
      )}
    </>
  );
}
