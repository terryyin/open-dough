// One configured Intent location as a folder tree of its kind's files
// (`./IntentBrowser.tsx`): nested disclosure through the shared FileTree,
// with each feature row named by its full repository path. An unsupported
// kind or a location with no features of its kind says so by path or kind.

import { useState } from "react";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { reviewFileTree } from "./reviewFileTree.ts";
import { FileTree } from "./StoryReviewFileTree.tsx";
import "./story-review-files.css";

const featureFileWords = (count: number) =>
  count === 1 ? "feature file" : "feature files";

function FeatureRow({
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

function locationExplanation(location: IntentLocation): string {
  if (location.problem === "unsupported-kind") {
    return `Kind ${location.kind} is not yet supported.`;
  }
  return `No .feature files are published at ${location.path} for this revision.`;
}

export function IntentLocationTree({
  location,
  selectedPath,
  onSelect,
  idPrefix,
}: {
  readonly location: IntentLocation;
  readonly selectedPath: string;
  readonly onSelect: (path: string) => void;
  readonly idPrefix: string;
}) {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
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
      <h3 id={`${idPrefix}-heading`}>
        <code>{location.path}</code>{" "}
        <span className="intent-location-kind">{location.kind}</span>
      </h3>
      {location.problem !== undefined ? (
        <p className="intent-location-problem">
          {locationExplanation(location)}
        </p>
      ) : (
        <FileTree
          label={`Feature files under ${location.path}`}
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
            <FeatureRow
              label={`${location.path}/${file.path}`}
              name={name}
              selected={selected}
              onSelect={() => {
                select(file.path);
              }}
            />
          )}
          fileCountWords={featureFileWords}
        />
      )}
    </section>
  );
}
