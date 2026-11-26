// The story's repository tree or Project Intent's configured location groups.

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { IntentLocationGroup } from "./IntentLocationGroup.tsx";
import { intentLocationIdPrefix } from "./intentLocationIds.ts";
import { IntentStoryFileTree } from "./IntentStoryFileTree.tsx";
import { NoFilesMatchNote } from "./FilesSidebarActions.tsx";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";
import {
  filtersMatchNothing,
  intentLocationFiles,
} from "./intentStoryOverlay.ts";
import type { useIntentStoryTree } from "./useIntentStoryTree.ts";
import type { TreeReveal } from "./useLocationOpenFolders.ts";

export function IntentBrowserTree({
  locations,
  tree,
  storySelected,
  selection,
  onSelect,
  reveal,
  expandedPath,
  onExpandedPath,
}: {
  readonly locations: readonly IntentLocation[];
  readonly tree: ReturnType<typeof useIntentStoryTree>;
  readonly storySelected: boolean;
  readonly selection: IntentSelection;
  readonly onSelect: (next: IntentSelection) => void;
  readonly reveal: TreeReveal | undefined;
  readonly expandedPath: string | null;
  readonly onExpandedPath: (
    update: (was: string | null) => string | null,
  ) => void;
}) {
  if (storySelected)
    return (
      <>
        {tree.scope && <NoFilesMatchNote noMatch={tree.scope.noMatch} />}
        <IntentStoryFileTree
          locations={locations}
          overlay={tree.overlay}
          shown={tree.shown}
          round={tree.round}
          owner={tree.owner}
          selection={selection}
          onSelect={onSelect}
          reveal={reveal}
        />
      </>
    );
  const groups = locations.map(
    (location) =>
      [
        location,
        intentLocationFiles(
          tree.overlay.files,
          location,
          tree.intentOnly.checked,
        ),
      ] as const,
  );
  const noMatch = filtersMatchNothing(
    { changesOnly: false, intentOnly: tree.intentOnly.checked },
    locations,
    groups.reduce((listed, [, files]) => listed + files.size, 0),
  );
  return (
    <>
      <NoFilesMatchNote noMatch={noMatch} />
      {groups.map(([location, files]) => {
        return (
          <IntentLocationGroup
            key={location.path}
            location={location}
            files={[...files].map(([path, file]) => ({
              ...file,
              path: path.slice(location.path.length + 1),
            }))}
            containsChanges={tree.overlay.changedLocations.has(location.path)}
            selection={selection}
            onSelect={onSelect}
            reveal={reveal}
            idPrefix={intentLocationIdPrefix(location.path)}
            expanded={expandedPath === location.path}
            onToggle={() => {
              onExpandedPath((was) =>
                was === location.path ? null : location.path,
              );
            }}
          />
        );
      })}
    </>
  );
}
