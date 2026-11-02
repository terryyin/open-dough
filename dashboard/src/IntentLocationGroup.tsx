// One configured Intent location as an expandable group
// (`./IntentBrowser.tsx`): caret discloses the body without changing
// selection; the name selects the location (and toggles once selected).
// Nested folders use the shared FileTree's opt-in caret + selectable name.
// Every folder starts collapsed; the folders holding the selection open
// whenever the selection moves to another file or folder, so a test opened
// from elsewhere (the candidates record) shows selected in the tree.
// Selection is the Intent workspace's (`./intentWorkspaceSelection.ts`),
// passed through the browser. An unsupported kind or a location with no
// matching files says so by path, kind, and include patterns inside the
// expanded body.

import { useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import {
  selectionScope,
  type IntentSelection,
} from "./intentWorkspaceSelection.ts";
import {
  reviewFileTree,
  reviewFolderPaths,
  reviewFoldersHolding,
} from "./reviewFileTree.ts";
import { FileTree } from "./StoryReviewFileTree.tsx";
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
  selection,
  onSelect,
  idPrefix,
  expanded,
  onToggle,
}: {
  readonly location: IntentLocation;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly idPrefix: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}) {
  const bodyId = `${idPrefix}-body`;
  const prefix = `${location.path}/`;
  // Arrange paths relative to the location so the tree starts inside it.
  const files = location.files.flatMap((full) => {
    if (!full.startsWith(prefix)) return [];
    return [{ path: full.slice(prefix.length) }];
  });
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

  // Folders are tracked by the ones open, so a folder not yet seen starts
  // collapsed and only those holding the selection start open; the selection
  // last revealed keeps a moved selection opening its folders without
  // reopening one collapsed around it since.
  const [openFolders, setOpenFolders] = useState<ReadonlySet<string>>(
    () => new Set(reviewFoldersHolding(tree, revealPath)),
  );
  const [revealed, setRevealed] = useState(revealPath);
  if (revealed !== revealPath) {
    setRevealed(revealPath);
    const holding = reviewFoldersHolding(tree, revealPath);
    if (holding.some((folderPath) => !openFolders.has(folderPath))) {
      setOpenFolders(new Set([...openFolders, ...holding]));
    }
  }
  const collapsed = new Set(
    reviewFolderPaths(tree).filter(
      (folderPath) => !openFolders.has(folderPath),
    ),
  );

  function toggleFolder(folderPath: string) {
    setOpenFolders((was) => {
      const next = new Set(was);
      if (next.has(folderPath)) next.delete(folderPath);
      else next.add(folderPath);
      return next;
    });
  }

  return (
    <section
      className="intent-location story-review-files"
      aria-labelledby={`${idPrefix}-heading`}
    >
      <div className="intent-location-header">
        <button
          type="button"
          className="intent-location-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${location.path}`}
          onClick={onToggle}
        />
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
          {location.problem !== undefined ? (
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
                  label={`${location.path}/${file.path}`}
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
