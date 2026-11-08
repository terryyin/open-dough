// One configured Intent location as an expandable group (`./IntentBrowser.tsx`):
// book-icon toggle discloses without changing selection; the name selects (and
// toggles once selected). Nested folders use FileTree's folder-icon toggle +
// name. Open folders are `./useLocationOpenFolders.ts`'s; `reveal` also scrolls
// the selected row into view. Overlay files (`./intentStoryOverlay.ts`) carry
// change kinds; a group with changes marks its header (own background, selected
// fill, or accent border when a duration tint would hide that fill). Selection
// is `./intentWorkspaceSelection.ts`. Unsupported kind or empty match explains
// inside the body. Story comparison: file rows and compared-entry location
// headers reuse shared cells/cues (`./intentTreeComparison.ts`); folders uncued.

import { useEffect, useRef } from "react";
import { Book, BookOpen } from "lucide-react";
import { scopeCueElementAttrs } from "./ciScopeComparisonCuePresentation.ts";
import { Icon } from "./Icon.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { useIntentCiEvidence } from "./IntentCiEvidence.tsx";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
import { IntentTreeFileRow } from "./IntentTreeFileRow.tsx";
import {
  treeComparisonAccessibleName,
  treeComparisonReadingOf,
  treeLocationCellsOf,
} from "./intentTreeComparison.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import { reviewFileTree } from "./reviewFileTree.ts";
import { FileTree, reviewedFileWords } from "./StoryReviewFileTree.tsx";
import {
  useLocationOpenFolders,
  type LocationExpansion,
  type TreeReveal,
} from "./useLocationOpenFolders.ts";
import "./story-review-files.css";
import "./intent-ci-cues.css";
import "./intent-location-group.css";

function selectionPhrase(location: IntentLocation): string {
  if (location.include === undefined || location.include.length === 0) {
    return location.kind;
  }
  return `${location.kind}, ${location.include.join(", ")}`;
}

function LocationLabel({ location }: { readonly location: IntentLocation }) {
  return (
    <>
      {location.label === undefined ? (
        <code>{location.path}</code>
      ) : (
        <span title={location.path}>{location.label}</span>
      )}{" "}
      <span className="intent-location-kind">{location.kind}</span>
      {location.include !== undefined && location.include.length > 0
        ? location.include.map((pattern) => (
            <span key={pattern} className="intent-location-pattern">
              {" "}
              <code>{pattern}</code>
            </span>
          ))
        : null}
    </>
  );
}

function locationBaseName(location: IntentLocation): string {
  const patterns =
    location.include === undefined || location.include.length === 0
      ? ""
      : `, ${location.include.join(", ")}`;
  return `${location.label ?? location.path}, ${location.kind}${patterns}`;
}

export function IntentLocationGroup({
  location,
  files,
  containsChanges,
  expansion,
  selection,
  onSelect,
  idPrefix,
  expanded,
  onToggle,
  reveal,
}: {
  readonly location: IntentLocation;
  // The location's tree files, relative to it (`./intentStoryOverlay.ts`).
  readonly files: readonly IntentTreeFile[];
  readonly containsChanges: boolean;
  readonly expansion: LocationExpansion | undefined;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly idPrefix: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly reveal?: TreeReveal | undefined;
}) {
  const bodyId = `${idPrefix}-body`;
  const prefix = `${location.path}/`;
  const tree = reviewFileTree(files);
  const scope = selectionScope(selection);
  const selectedRelative =
    scope === "file" && selection.path.startsWith(prefix)
      ? selection.path.slice(prefix.length)
      : "";
  const selectedFolderRelative =
    scope === "folder" && selection.path.startsWith(prefix)
      ? selection.path.slice(prefix.length)
      : "";
  const locationSelected =
    scope === "location" && selection.path === location.path;
  const revealPath = selectedRelative || selectedFolderRelative;

  const revealHere =
    reveal !== undefined &&
    (reveal.path === location.path || reveal.path.startsWith(prefix));
  const { collapsed, toggleFolder } = useLocationOpenFolders({
    location: location.path,
    tree,
    revealPath,
    expansion,
    reveal: revealHere
      ? { request: reveal, path: reveal.path.slice(prefix.length) }
      : undefined,
  });
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!revealHere) return;
    sectionRef.current
      ?.querySelector('[aria-pressed="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [reveal, revealHere]);

  const comparison = treeComparisonReadingOf(useIntentCiEvidence());
  const locationCells = treeLocationCellsOf(comparison, location.path);
  const locationHeaderAttrs = scopeCueElementAttrs(
    "intent-location-header",
    locationCells?.cues,
  );
  const locationName =
    locationCells === undefined || comparison.kind !== "comparison"
      ? undefined
      : treeComparisonAccessibleName(
          locationBaseName(location),
          locationCells,
          comparison.afterSide,
        );

  return (
    <section
      ref={sectionRef}
      className="intent-location story-review-files"
      aria-labelledby={`${idPrefix}-heading`}
      data-contains-changes={containsChanges || undefined}
    >
      <div
        {...locationHeaderAttrs}
        data-selected={locationSelected || undefined}
      >
        <button
          type="button"
          className="intent-location-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${location.label ?? location.path}`}
          onClick={onToggle}
        >
          <Icon icon={expanded ? BookOpen : Book} />
        </button>
        <button
          type="button"
          id={`${idPrefix}-heading`}
          className="sessions-sidebar-section-header intent-location-name"
          data-location-path={location.path}
          aria-pressed={locationSelected}
          {...(locationName === undefined
            ? {}
            : { "aria-label": locationName })}
          onClick={() => {
            if (locationSelected) {
              onToggle();
              return;
            }
            onSelect({ path: location.path, scope: "location" });
          }}
        >
          <LocationLabel location={location} />
        </button>
      </div>
      {expanded ? (
        <div id={bodyId} className="intent-location-body">
          {location.problem !== undefined && files.length === 0 ? (
            <p className="intent-location-problem">
              {locationExplanation(location)}
            </p>
          ) : (
            <FileTree
              label={`${selectionPhrase(location)} files under ${location.path}`}
              nodes={tree}
              selectedPath={selectedRelative}
              onSelect={(relative) => {
                onSelect({
                  path: `${location.path}/${relative}`,
                  scope: "file",
                });
              }}
              collapsed={collapsed}
              onToggle={toggleFolder}
              idPrefix={`${idPrefix}-tree`}
              folderSelection={{
                selectedPath: selectedFolderRelative,
                onSelect: (folderPath) => {
                  const full = `${location.path}/${folderPath}`;
                  if (scope === "folder" && selection.path === full) {
                    toggleFolder(folderPath);
                    return;
                  }
                  onSelect({ path: full, scope: "folder" });
                },
              }}
              renderFile={({ file, name, selected, onSelect: select }) => (
                <IntentTreeFileRow
                  label={
                    file.change === undefined
                      ? `${location.path}/${file.path}`
                      : reviewedFileWords(file.change)
                  }
                  name={name}
                  selected={selected}
                  reading={comparison}
                  path={`${location.path}/${file.path}`}
                  treeFile={file}
                  onSelect={() => {
                    select(file.path);
                  }}
                />
              )}
              fileCountWords={intentFileCountWords}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
