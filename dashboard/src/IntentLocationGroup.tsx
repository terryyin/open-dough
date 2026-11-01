// One configured Intent location as an expandable group
// (`./IntentBrowser.tsx`): Sessions-style header discloses the body; nested
// folder disclosure stays in the shared FileTree. Selection is the Intent
// workspace's (`./intentWorkspaceSelection.ts`), passed through the browser.
// An unsupported kind or a location with no matching files says so by path,
// kind, and include patterns inside the expanded body.

import { useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { reviewFileTree } from "./reviewFileTree.ts";
import { FileTree } from "./StoryReviewFileTree.tsx";
import "./story-review-files.css";

const fileCountWords = (count: number) => (count === 1 ? "file" : "files");

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

function locationExplanation(location: IntentLocation): string {
  if (location.problem === "unsupported-kind") {
    return `Kind ${location.kind} is not yet supported.`;
  }
  if (location.include !== undefined && location.include.length > 0) {
    return `No files matching ${location.include.join(", ")} are published at ${location.path} for this revision.`;
  }
  return `No ${location.kind} files are published at ${location.path} for this revision.`;
}

export function IntentLocationGroup({
  location,
  selectedPath,
  onSelect,
  idPrefix,
  expanded,
  onToggle,
}: {
  readonly location: IntentLocation;
  readonly selectedPath: string;
  readonly onSelect: (path: string) => void;
  readonly idPrefix: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
}) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const bodyId = `${idPrefix}-body`;
  const prefix = `${location.path}/`;
  // Arrange paths relative to the location so the tree starts inside it.
  const files = location.files.flatMap((full) => {
    if (!full.startsWith(prefix)) return [];
    return [{ path: full.slice(prefix.length) }];
  });
  const tree = reviewFileTree(files);
  const selectedRelative = selectedPath.startsWith(prefix)
    ? selectedPath.slice(prefix.length)
    : "";
  return (
    <section
      className="intent-location story-review-files"
      aria-labelledby={`${idPrefix}-heading`}
    >
      <button
        type="button"
        id={`${idPrefix}-heading`}
        className="sessions-sidebar-section-header intent-location-toggle"
        aria-expanded={expanded}
        aria-controls={bodyId}
        onClick={onToggle}
      >
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
      </button>
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
                onSelect(`${location.path}/${relative}`);
              }}
              collapsed={collapsed}
              onToggle={(folderPath) => {
                setCollapsed((was) => {
                  const next = new Set(was);
                  if (next.has(folderPath)) next.delete(folderPath);
                  else next.add(folderPath);
                  return next;
                });
              }}
              idPrefix={`${idPrefix}-tree`}
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
              fileCountWords={fileCountWords}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
