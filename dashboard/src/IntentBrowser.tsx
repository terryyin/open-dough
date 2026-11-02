// Configured Intent locations browser (`./IntentPerspective.tsx`) and the
// Test Optimization Candidates record, each one Intent reading mode chosen
// under the banner (`./IntentModeTabs.tsx`); entering Intent shows the
// locations. Locations and folders share caret (expansion only) and name
// (select; toggle once selected) controls; a caret never changes selection or
// the reading pane. A file shows Purpose and Proof (`./IntentFileReading.tsx`);
// a location or folder name shows a Summary (`./IntentSummary.tsx`). The
// record fills the content area without the locations; it is read the first
// time it is chosen and stays mounted after, so opening a test from it and
// returning does not reread it. A failed proof read's retry reads the
// locations again without changing the selection. Selection is owned by the
// Intent workspace (`./intentWorkspaceSelection.ts`). With a selected story's
// comparison, the trees are its overlay on the published files
// (`./intentStoryOverlay.ts`): the first time this browser has one, it opens
// the first location and the folders containing changes and collapses the
// rest.

import { useId, useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { inventoryFromIntentLocations } from "./intentCandidatesLocationMatch.ts";
import { IntentCandidatesRecord } from "./IntentCandidatesRecord.tsx";
import {
  IntentLocationGroup,
  type LocationExpansion,
} from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import {
  IntentModeTabs,
  intentModePanelId,
  intentModeTabId,
  type IntentMode,
} from "./IntentModeTabs.tsx";
import { IntentFileReading } from "./IntentFileReading.tsx";
import { IntentSummary } from "./IntentSummary.tsx";
import { filesOfSelection, owningLocation } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  useIntentWorkspaceSelection,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import {
  intentStoryOverlay,
  overlayFilesByPath,
  storyOverlayExpansion,
  type StoryOverlayExpansion,
} from "./intentStoryOverlay.ts";
import type { PublishedSource } from "./publishedSource.ts";
import {
  StoryOutsideLocations,
  type ComparedStory,
} from "./IntentStoryLens.tsx";

export function IntentBrowser({
  source,
  revision,
  locations,
  proofRereading,
  onProofRetry,
  story,
}: {
  readonly source: PublishedSource;
  readonly revision: string;
  readonly locations: readonly IntentLocation[];
  // The selected story and its comparison, once read.
  readonly story?: ComparedStory | undefined;
  // Whether the locations, with their proof, are being read again after a
  // proof read failed; the selection and reader stay as they are.
  readonly proofRereading: boolean;
  readonly onProofRetry: () => void;
}) {
  const { selection, setSelection } = useIntentWorkspaceSelection();
  const scope = selectionScope(selection);
  const selectedPath = selection.path;
  const [mode, setMode] = useState<IntentMode>("intent");
  const [candidatesChosen, setCandidatesChosen] = useState(false);
  const [returnEntrySlug, setReturnEntrySlug] = useState<string | undefined>();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const modeIdPrefix = useId();
  const inventory = inventoryFromIntentLocations(locations);
  const treeSelection: IntentSelection =
    mode === "intent" ? selection : { path: "" };
  const overlay = intentStoryOverlay(locations, story?.shown.comparison.files);
  // The expansion the story's overlay first asked for here.
  const [expansion, setExpansion] = useState<
    { readonly round: number; readonly plan: StoryOverlayExpansion } | undefined
  >();
  if (story !== undefined && expansion === undefined) {
    const plan = storyOverlayExpansion(locations, overlay);
    setExpansion({ round: 1, plan });
    setExpandedPath(plan.location ?? null);
  }
  const locationExpansion = (index: number): LocationExpansion | undefined =>
    expansion === undefined
      ? undefined
      : {
          round: expansion.round,
          folders: expansion.plan.folders[index] ?? [],
        };

  function openFromRecord(next: IntentSelection, entrySlug: string) {
    setSelection(next.scope === undefined ? { ...next, scope: "file" } : next);
    setReturnEntrySlug(entrySlug);
    setMode("intent");
    const owning = locations.find((location) =>
      location.files.includes(next.path),
    );
    if (owning !== undefined) setExpandedPath(owning.path);
  }

  function selectInTree(next: IntentSelection) {
    setSelection(next);
    setReturnEntrySlug(undefined);
    setMode("intent");
  }

  function chooseMode(next: IntentMode) {
    setMode(next);
    if (next === "candidates") setCandidatesChosen(true);
  }

  // Clearing selection when the project or locations change is owned by the
  // Intent workspace provider remounting on source/revision identity.
  const selectedFile =
    scope === "file"
      ? overlayFilesByPath(locations, overlay).get(selectedPath)
      : undefined;
  const selectedLocation = owningLocation(locations, selection);

  return (
    <>
      <IntentModeTabs
        mode={mode}
        idPrefix={modeIdPrefix}
        onSelect={chooseMode}
      />
      <div
        className="intent-browser"
        role="tabpanel"
        id={intentModePanelId(modeIdPrefix, "intent")}
        aria-labelledby={intentModeTabId(modeIdPrefix, "intent")}
        hidden={mode !== "intent"}
      >
        <div className="intent-locations">
          <h3 className="visually-hidden">Purpose locations</h3>
          {story !== undefined && (
            <StoryOutsideLocations
              source={source.id}
              story={story.lens}
              outside={overlay.outside}
            />
          )}
          {locations.map((location, index) => (
            <IntentLocationGroup
              key={location.path}
              location={location}
              files={overlay.locations[index]?.files ?? []}
              containsChanges={
                overlay.locations[index]?.containsChanges ?? false
              }
              expansion={locationExpansion(index)}
              selection={treeSelection}
              onSelect={selectInTree}
              idPrefix={intentLocationIdPrefix(location.path)}
              expanded={expandedPath === location.path}
              onToggle={() => {
                setExpandedPath((was) =>
                  was === location.path ? null : location.path,
                );
              }}
            />
          ))}
        </div>
        <div className="intent-reading" tabIndex={-1}>
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
            />
          ) : null}
          {scope === "file" || scope === "none" ? (
            <IntentFileReading
              source={source}
              revision={revision}
              selection={selection}
              location={selectedLocation}
              treeFile={selectedFile}
              story={story}
              proofRereading={proofRereading}
              onProofRetry={onProofRetry}
            />
          ) : null}
        </div>
      </div>
      <div
        className="intent-candidates-panel"
        role="tabpanel"
        id={intentModePanelId(modeIdPrefix, "candidates")}
        aria-labelledby={intentModeTabId(modeIdPrefix, "candidates")}
        hidden={mode !== "candidates"}
        tabIndex={-1}
      >
        {candidatesChosen ? (
          <IntentCandidatesRecord
            source={source}
            revision={revision}
            inventory={inventory}
            onOpenLocation={openFromRecord}
            {...(mode === "candidates" && returnEntrySlug !== undefined
              ? { focusEntrySlug: returnEntrySlug }
              : {})}
          />
        ) : null}
      </div>
    </>
  );
}
