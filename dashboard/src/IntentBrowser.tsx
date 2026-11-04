// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`, drawn and owned by
// `./IntentPerspective.tsx`, kept per project by `./pageIntentMode.tsx`); Intent
// shows the locations. Locations and folders share folder-icon toggle (expansion
// only) and name (select; toggle once selected) controls; a toggle never changes
// selection or the reading pane. A file, or nothing selected yet, shows Purpose and Proof
// as tabs or side by side (`./IntentFileReading.tsx`), one reader layout this
// browser keeps (`./keptPreference.ts`); a location or folder name shows a
// Summary (`./IntentSummary.tsx`), whose child names and slowest rows open
// their target as the record's links do. The record fills the content area
// without the locations; it is read the first time it is chosen and stays
// mounted after, so opening a test from it and returning does not reread it. A
// failed file read keeps its own explanation and retry; a failed proof read's
// retry reads the locations again without changing the selection. Selection is
// owned by the Intent workspace (`./intentWorkspaceSelection.ts`). With a
// selected story's comparison, the trees are its overlay on the published
// files (`./intentStoryOverlay.ts`), or with "Selected story only" its changed
// entries alone, locations without changes left out: the first time this
// browser has one, and at each toggle either way, it opens the first
// location and the folders containing changes and collapses the rest. A file
// the published revision does not list is never read. The browser unmounts
// with Intent, so a story selected while Intent is hidden applies when it
// opens, with the toggle off.

import { useId, useRef, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import {
  IntentFileReading,
  type IntentReadingLayout,
  type IntentReadingTab,
} from "./IntentFileReading.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { keptChoice } from "./keptPreference.ts";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { IntentSummary } from "./IntentSummary.tsx";
import { intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import type { ModeChoice } from "./pageIntentMode.tsx";
import { filesOfSelection, owningLocation } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import {
  intentStoryOverlay,
  overlayFilesByPath,
  storyChangesOnly,
  storyOverlayExpansion,
  type StoryOverlayExpansion,
} from "./intentStoryOverlay.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useIntentFileRead } from "./useIntentFileRead.ts";
import type {
  LocationExpansion,
  TreeReveal,
} from "./useLocationOpenFolders.ts";
import { StoryChangesScope, type ComparedStory } from "./IntentStoryLens.tsx";

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
  revision,
  locations,
  proofRereading,
  onProofRetry,
  mode,
  modeIdPrefix,
  onModeChange,
  story,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  // The selected story and its comparison, once read.
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
  // The record is read the first time Candidates is shown, then kept.
  const [candidatesChosen, setCandidatesChosen] = useState(
    mode === "candidates",
  );
  if (mode === "candidates" && !candidatesChosen) setCandidatesChosen(true);
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
  const inventory = inventoryFromIntentLocations(locations);
  const treeSelection: IntentSelection =
    mode === "intent" ? selection : { path: "" };
  const overlay = intentStoryOverlay(locations, story?.shown.comparison.files);
  const [storyOnly, setStoryOnly] = useState(false);
  const changesOnly = story !== undefined && storyOnly;
  const shownOverlay = changesOnly ? storyChangesOnly(overlay) : overlay;
  // The expansion the story's overlay last asked for here: when it first had
  // one, and at each toggle.
  const [expansion, setExpansion] = useState<
    { readonly round: number; readonly plan: StoryOverlayExpansion } | undefined
  >();
  function expandStory(round: number) {
    const plan = storyOverlayExpansion(locations, overlay);
    setExpansion({ round, plan });
    setExpandedPath(plan.location ?? null);
  }
  if (story !== undefined && expansion === undefined) expandStory(1);
  const locationExpansion = (index: number): LocationExpansion | undefined =>
    expansion === undefined
      ? undefined
      : {
          round: expansion.round,
          folders: expansion.plan.folders[index] ?? [],
        };

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
          {story !== undefined && (
            <StoryChangesScope
              source={source.id}
              story={story.lens}
              outside={overlay.outside}
              only={storyOnly}
              noneInLocations={
                !overlay.locations.some((each) => each.containsChanges)
              }
              onOnly={(only) => {
                setStoryOnly(only);
                expandStory((expansion?.round ?? 0) + 1);
              }}
            />
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
          {(scope === "location" || scope === "folder") &&
          selectedLocation !== undefined ? (
            <IntentSummary
              key={`${source.id}:${revision}:${selectedPath}`}
              path={selectedPath}
              files={filesOfSelection(selectedLocation, selection)}
              location={selectedLocation}
              source={source}
              revision={revision}
              proofRereading={proofRereading}
              onProofRetry={onProofRetry}
              onOpen={openRevealed}
            />
          ) : null}
          {scope === "file" || scope === "none" ? (
            <IntentFileReading
              key={revealedOpens}
              tab={readingTab}
              onChooseTab={setReadingTab}
              layout={readingLayout}
              onChooseLayout={(next) => {
                setReadingLayout(next);
                keptLayout.choose(next);
              }}
              idPrefix={readingIdPrefix}
              readingArea={readingArea}
              path={selectedPath}
              revision={revision}
              read={fileRead.read}
              kind={selectedLanguage}
              caseTarget={selection.caseTarget}
              location={selectedLocation}
              treeFile={selectedFile}
              story={story}
              proofRereading={proofRereading}
              onFileRetry={fileRead.retry}
              onProofRetry={onProofRetry}
            />
          ) : null}
        </div>
      </div>
      <div
        className="intent-candidates-panel"
        role="tabpanel"
        id={intentTabPanelId(modeIdPrefix, "candidates")}
        aria-labelledby={intentTabId(modeIdPrefix, "candidates")}
        hidden={mode !== "candidates"}
        tabIndex={-1}
      >
        {candidatesChosen ? (
          <IntentCandidatesRecord
            source={source}
            revision={revision}
            inventory={inventory}
            onOpenLocation={openRevealed}
            {...(mode === "candidates" && returnEntrySlug !== undefined
              ? { focusEntrySlug: returnEntrySlug }
              : {})}
          />
        ) : null}
      </div>
    </>
  );
}
