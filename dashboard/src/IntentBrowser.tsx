// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`, drawn and owned by
// `./IntentPerspective.tsx`, kept per project by `./pageIntentMode.tsx`); Intent
// shows the locations. Locations (book icon) and folders (folder icon) share
// toggle (expansion only) and name (select; toggle once selected) controls; a
// toggle never changes selection or the reading pane. A file, or nothing
// selected yet, shows its Purpose (`./IntentFileReading.tsx`); a location or
// folder name shows a Summary (`./IntentSummary.tsx`), whose child names open
// their target as the record's links do (`./IntentCandidatesRecord.tsx`). A
// failed file read keeps its own explanation and retry. Selection is owned by
// the Intent workspace (`./intentWorkspaceSelection.ts`). With a
// selected story's comparison, the trees follow it (`./useIntentStoryTree.ts`)
// under the story's summary heading the locations (`./IntentStorySummary.tsx`).
// A file the published revision does not list is never read. The browser unmounts
// with Intent, so a story selected while Intent is hidden applies when it
// opens, with the toggle off.

import { useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentCandidatesPanel } from "./IntentCandidatesRecord.tsx";
import { IntentFileReading } from "./IntentFileReading.tsx";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
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
import { overlayFilesByPath } from "./intentStoryOverlay.ts";
import type { PublishedSource } from "./publishedSource.ts";
import { useIntentFileRead } from "./useIntentFileRead.ts";
import { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";
import {
  IntentStorySummary,
  type ComparedStory,
  type StorySummary,
} from "./IntentStorySummary.tsx";

export function IntentBrowser({
  source,
  revision,
  locations,
  mode,
  modeIdPrefix,
  onModeChange,
  storySummary,
  story,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  // The selected story as the summary heading the locations names it, and
  // with its comparison, once read.
  readonly storySummary: StorySummary | undefined;
  readonly story: ComparedStory | undefined;
  // The strip's mode and ids; opening a test from the record returns this
  // browser to Intent.
} & ModeChoice) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const scope = selectionScope(selection);
  const selectedPath = selection.path;
  const [returnEntrySlug, setReturnEntrySlug] = useState<string | undefined>();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [reveal, setReveal] = useState<TreeReveal | undefined>();
  // Each revealed open starts a fresh reading, positioned on its case.
  const [revealedOpens, setRevealedOpens] = useState(0);
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
  // starts a fresh reading of its Purpose, and reveals the target in the tree:
  // its location opens and the folders holding it open.
  function openRevealed(next: IntentSelection, entrySlug?: string) {
    select(
      next.scope === undefined ? { ...next, scope: "file" } : next,
      entrySlug,
    );
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
        <div className="intent-reading" tabIndex={-1}>
          {(scope === "location" || scope === "folder") &&
          selectedLocation !== undefined ? (
            <IntentSummary
              key={`${source.id}:${revision}:${selectedPath}`}
              path={selectedPath}
              files={filesOfSelection(selectedLocation, selection)}
              location={selectedLocation}
              onOpen={openRevealed}
            />
          ) : null}
          {scope === "file" || scope === "none" ? (
            <IntentFileReading
              key={revealedOpens}
              path={selectedPath}
              revision={revision}
              read={fileRead.read}
              kind={selectedLanguage}
              caseTarget={selection.caseTarget}
              treeFile={selectedFile}
              story={story}
              onFileRetry={fileRead.retry}
            />
          ) : null}
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
