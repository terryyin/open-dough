// One configured Intent location as an expandable group
// (`./IntentBrowser.tsx`): a toggle showing an open or closed book, unlike the
// folders inside it, discloses the body without changing selection; the name
// selects the location (and toggles once selected). Nested folders use the
// shared FileTree's opt-in folder-icon toggle + selectable name.
// Which folders are open is `./useLocationOpenFolders.ts`'s; a `reveal`
// request inside the location also scrolls the selected row into view. A
// selected story's overlay (`./intentStoryOverlay.ts`) supplies the files with
// their change kinds; a group that contains changes carries a change mark on
// its header, which keeps its own location background or, when selected, the
// selected background across the whole header.
// Selection is the Intent workspace's (`./intentWorkspaceSelection.ts`),
// passed through the browser. An unsupported kind or a location with no
// matching files says so by path, kind, and include patterns inside the
// expanded body.

import { useEffect, useRef } from "react";
import { Book, BookOpen } from "lucide-react";
import { Icon } from "./Icon.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import type { IntentTreeFile } from "./intentStoryOverlay.ts";
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

function FileRow({
  label,
  name,
  selected,
  onSelect,
}: {
  readonly label: string;
  readonly name: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <code>{name}</code>
    </button>
  );
}

function selectionPhrase(location: IntentLocation): string {
  if (location.include === undefined || location.include.length === 0) {
    return location.kind;
  }
  return `${location.kind}, ${location.include.join(", ")}`;
}

function LocationLabel({ location }: { readonly location: IntentLocation }) {
  return (
    <>
      <code>{location.path}</code>{" "}
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

  return (
    <section
      ref={sectionRef}
      className="intent-location story-review-files"
      aria-labelledby={`${idPrefix}-heading`}
      data-contains-changes={containsChanges || undefined}
    >
      <div
        className="intent-location-header"
        data-selected={locationSelected || undefined}
      >
        <button
          type="button"
          className="intent-location-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${location.path}`}
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
                <FileRow
                  label={
                    file.change === undefined
                      ? `${location.path}/${file.path}`
                      : reviewedFileWords(file.change)
                  }
                  name={name}
                  selected={selected}
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
