// The configured locations and reading of one Intent scope. The comparison
// overlays its tree. Disclosure only expands, selection opens the reading, and
// the caller may hide a tab or column without losing its place.

import type { ReactNode } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import type { FileBrowserPlace } from "./FileBrowserToggle.tsx";
import { IntentBrowserFrame } from "./IntentBrowserFrame.tsx";
import { IntentCandidatesPanel } from "./IntentCandidatesRecord.tsx";
import { useKeptFileReadingPlace } from "./IntentFileReading.tsx";
import { IntentBrowserTree } from "./IntentBrowserTree.tsx";
import { StoryHomeButton } from "./IntentStoryEvidence.tsx";
import { IntentSelectionReading } from "./IntentSelectionReading.tsx";
import type { IntentTabPanelAttributes } from "./IntentTabs.tsx";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { useKeptArrangement, useKeptReading } from "./pageIntentReading.tsx";
import { owningLocation } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { storyFileSelection } from "./intentStorySelection.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { intentStoryPathAttributes } from "./storyCardFocus.ts";
import { useFirstStoryChangedFile } from "./useFirstStoryChangedFile.ts";
import { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";
import type { ComparedStory, StorySummary } from "./IntentStorySummary.tsx";
import type { StoryResultBrowse } from "./useStoryResultRead.tsx";

export function IntentBrowser({
  source,
  revision,
  result,
  locations,
  lead,
  project,
  storySummary,
  story,
  reviewFileReady,
  files,
  panel,
  storyPath,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly result?: StoryResultBrowse | undefined;
  readonly locations: readonly IntentLocation[];
  readonly lead?: ReactNode;
  // The selected story with what is known of its comparison, and the
  // comparison once read.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
  readonly reviewFileReady: boolean;
  // The locations column's id and whether Hide files / Show files shows it.
  readonly files: FileBrowserPlace;
  readonly panel: IntentTabPanelAttributes;
  readonly storyPath:
    | {
        readonly id: string;
        readonly hidden: boolean;
        readonly onHome: () => void;
      }
    | undefined;
  // Project Intent's chosen view and ids, in Project Intent: opening a test
  // from the record returns this browser to CI status.
  readonly project: ModeChoice | undefined;
}) {
  const { selection: keptSelection, setSelection } =
    useIntentWorkspaceSelection();
  const comparisonReading = storySummary?.comparison.state === "reading";
  const storyTree = useIntentStoryTree({
    locations,
    story,
    inventory: result?.paths,
    comparisonReading,
    resultKey: result?.key,
  });
  const selection = storyFileSelection(storyTree.overlay, keptSelection);
  const scope = selectionScope(selection);
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

  function select(next: IntentSelection, entrySlug?: string) {
    setSelection(next);
    setReturnEntrySlug(entrySlug);
    project?.onModeChange("ci");
  }

  function revealInTree(path: string, location: string | undefined) {
    if (location !== undefined) setExpandedPath(location);
    setReveal({ path });
  }

  function moveTo(path: string) {
    select({ path, scope: "file" });
    revealInTree(path, undefined);
    fileReading.readingArea.current?.scrollTo({ top: 0 });
  }

  // Directed file opens reveal their row and start a fresh Purpose reading.
  function openRevealed(next: IntentSelection, entrySlug?: string) {
    const target = storyFileSelection(storyTree.overlay, next);
    select(
      target.scope === undefined ? { ...target, scope: "file" } : target,
      entrySlug,
    );
    fileReading.setTab("purpose");
    setRevealedOpens((n) => n + 1);
    revealInTree(target.path, owningLocation(locations, target)?.path);
  }
  useFirstStoryChangedFile({
    project: source.id,
    storyIdentity: storySummary?.story.identity,
    canChooseFile: reviewFileReady,
    changedFiles: storyTree.shown.changedFiles,
    hasSelection: scope !== "none",
    open: openRevealed,
  });

  const browser = (
    <>
      <div className="intent-locations" id={files.id} hidden={!files.shown}>
        <h3 className="visually-hidden">Purpose locations</h3>
        {storyPath && <StoryHomeButton onHome={storyPath.onHome} />}
        {lead}
        <IntentBrowserTree
          locations={locations}
          tree={storyTree}
          storySelected={storySummary !== undefined}
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
        {...(storyPath &&
          intentStoryPathAttributes(storyPath.id, storyPath.hidden))}
      >
        <IntentSelectionReading
          source={source}
          revision={revision}
          result={result}
          comparisonReading={comparisonReading}
          locations={locations}
          treeFiles={storyTree.overlay.files}
          selection={selection}
          story={story}
          changedFiles={storyTree.shown.changedFiles}
          onMove={moveTo}
          onOpen={openRevealed}
          readingKey={revealedOpens}
          fileReading={fileReading.place}
          storySelected={storySummary !== undefined}
        />
      </div>
    </>
  );
  if (project === undefined) return browser;

  return (
    <>
      <IntentBrowserFrame filesShown={files.shown} panel={panel}>
        {browser}
      </IntentBrowserFrame>
      <IntentCandidatesPanel
        source={source}
        revision={revision}
        locations={locations}
        mode={project.mode}
        modeIdPrefix={project.modeIdPrefix}
        returnEntrySlug={returnEntrySlug}
        onOpenLocation={openRevealed}
      />
    </>
  );
}
