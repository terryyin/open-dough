// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`, drawn and owned by
// `./IntentPerspective.tsx`, kept per project by `./pageIntentMode.tsx`); Intent
// shows the locations. Locations (book icon) and folders (folder icon) share
// toggle (expansion only) and name (select; toggle once selected) controls; a
// toggle never changes selection or the reading pane. Nothing selected shows
// CI status as Intent's homepage; a file shows Purpose and Proof; a location
// or folder name shows a Summary — all in `./IntentSelectionReading.tsx`;
// directly activating the Intent tab clears the selection back to CI status
// (`./IntentModeTabs.tsx`), while the opens below keep their target. A failed
// file read keeps its own explanation and retry; a failed proof read's retry
// reads the locations again without changing the selection. Selection is
// owned by the Intent workspace (`./intentWorkspaceSelection.ts`). With a
// selected story's comparison, the trees follow it (`./useIntentStoryTree.ts`)
// under the story's summary heading the locations (`./IntentStorySummary.tsx`).
// A file the published revision does not list is never read. The browser
// unmounts with Intent, so a story selected while Intent is hidden applies
// when it opens, with the toggle off.

import { useId, useRef, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentCandidatesPanel } from "./IntentCandidatesRecord.tsx";
import {
  type IntentReadingLayout,
  type IntentReadingTab,
} from "./IntentFileReading.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { IntentSelectionReading } from "./IntentSelectionReading.tsx";
import { keptChoice } from "./keptPreference.ts";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { owningLocation } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { overlayFilesByPath } from "./intentStoryOverlay.ts";
import type { PublishedSource } from "./publishedSource.ts";
import type { PublishedWork } from "./publishedWork.ts";
import { useIntentFileRead } from "./useIntentFileRead.ts";
import { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";
import {
  IntentStorySummary,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";

// The reader layout this browser keeps for every project, tabs where it keeps
// an unusable one, and otherwise the one chosen on this page, even where the
// browser keeps nothing.
const keptLayout = keptChoice<IntentReadingLayout>(
  "open-dough.intent.layout",
  "tabs",
  (kept) => (kept === "side-by-side" ? "side-by-side" : "tabs"),
);

export function IntentBrowser({
  source,
  work,
  selectedIdentity,
  revision,
  locations,
  proofRereading,
  onProofRetry,
  mode,
  modeIdPrefix,
  onModeChange,
  storySummary,
  story,
}: {
  readonly source: PublishedSource;
  readonly work: PublishedWork;
  readonly selectedIdentity: string | undefined;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  // The selected story as the summary heading the locations names it, and
  // with its comparison, once read.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
  // Whether the locations, with their proof, are being read again after a
  // proof read failed; the selection and reader stay as they are.
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
  // The strip's mode and ids; opening a test from the record returns this
  // browser to Intent.
} & ModeChoice) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const scope = selectionScope(selection);
  const selectedPath = selection.path;
  const [returnEntrySlug, setReturnEntrySlug] = useState<string | undefined>();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [reveal, setReveal] = useState<TreeReveal | undefined>();
  // Purpose or Proof, kept across file selections (`./IntentFileReading.tsx`).
  const [readingTab, setReadingTab] = useState<IntentReadingTab>("purpose");
  // Tabs or side by side, one choice this browser keeps for every project;
  // held here so a revealed open, which starts a fresh reading, keeps it.
  const [readingLayout, setReadingLayout] = useState(keptLayout.read);
  // Each revealed open starts a fresh reading, positioned on its case.
  const [revealedOpens, setRevealedOpens] = useState(0);
  const readingArea = useRef<HTMLDivElement | null>(null);
  const readingIdPrefix = useId();
  const treeSelection: IntentSelection =
    mode === "intent" ? selection : { path: "" };
  const {
    overlay,
    shownOverlay,
    changesOnly,
    locationExpansion,
    scope: storyScope,
  } = useIntentStoryTree({
    source: source.id,
    locations,
    story,
    onExpandLocation: setExpandedPath,
  });

  function select(next: IntentSelection, entrySlug?: string) {
    setSelection(next);
    setReturnEntrySlug(entrySlug);
    onModeChange("intent");
  }

  // Opening from the candidate record or drilling down from a summary
  // selects as the tree does (a record entry is a file without a scope),
  // starts a fresh reading on Purpose, and reveals the target in the tree:
  // its location opens and the folders holding it open.
  function openRevealed(next: IntentSelection, entrySlug?: string) {
    select(
      next.scope === undefined ? { ...next, scope: "file" } : next,
      entrySlug,
    );
    setReadingTab("purpose");
    setRevealedOpens((n) => n + 1);
    const owning = owningLocation(locations, next);
    if (owning !== undefined) setExpandedPath(owning.path);
    setReveal({ path: next.path });
  }

  // Clearing selection when the project or locations change is owned by the
  // Intent workspace provider remounting on source/revision identity.
  const selectedFile =
    scope === "file"
      ? overlayFilesByPath(locations, overlay).get(selectedPath)
      : undefined;
  // A file the published revision does not list has no published text.
  const unpublished = selectedFile?.published === false;
  const fileRead = useIntentFileRead({
    source,
    revision,
    path: selectedPath,
    file: scope === "file",
    unpublished,
  });

  const selectedLocation = owningLocation(locations, selection);
  const selectedLanguage =
    scope === "file" ? selectedLocation?.kind : undefined;

  return (
    <>
      <div
        className="intent-browser"
        role="tabpanel"
        id={intentTabPanelId(modeIdPrefix, "intent")}
        aria-labelledby={intentTabId(modeIdPrefix, "intent")}
        hidden={mode !== "intent"}
      >
        <div className="intent-locations">
          <h3 className="visually-hidden">Purpose locations</h3>
          {storySummary !== undefined && (
            <IntentStorySummary summary={storySummary} scope={storyScope} />
          )}
          {locations.map((location, index) => {
            const shown = shownOverlay.locations[index];
            if (changesOnly && !shown?.containsChanges) return null;
            return (
              <IntentLocationGroup
                key={location.path}
                location={location}
                files={shown?.files ?? []}
                containsChanges={shown?.containsChanges ?? false}
                expansion={locationExpansion(index)}
                selection={treeSelection}
                onSelect={select}
                reveal={reveal}
                idPrefix={intentLocationIdPrefix(location.path)}
                expanded={expandedPath === location.path}
                onToggle={() => {
                  setExpandedPath((was) =>
                    was === location.path ? null : location.path,
                  );
                }}
              />
            );
          })}
        </div>
        <div className="intent-reading" tabIndex={-1} ref={readingArea}>
          <IntentSelectionReading
            source={source}
            work={work}
            selectedIdentity={selectedIdentity}
            revision={revision}
            selection={selection}
            selectedLocation={selectedLocation}
            selectedFile={selectedFile}
            selectedLanguage={selectedLanguage}
            story={story}
            read={fileRead.read}
            onFileRetry={fileRead.retry}
            proofRereading={proofRereading}
            onProofRetry={onProofRetry}
            onOpen={openRevealed}
            readingTab={readingTab}
            onChooseTab={setReadingTab}
            readingLayout={readingLayout}
            onChooseLayout={(next) => {
              setReadingLayout(next);
              keptLayout.choose(next);
            }}
            readingIdPrefix={readingIdPrefix}
            readingArea={readingArea}
            readingKey={revealedOpens}
          />
        </div>
      </div>
      <IntentCandidatesPanel
        source={source}
        revision={revision}
        locations={locations}
        mode={mode}
        modeIdPrefix={modeIdPrefix}
        returnEntrySlug={returnEntrySlug}
        onOpenLocation={openRevealed}
      />
    </>
  );
}
