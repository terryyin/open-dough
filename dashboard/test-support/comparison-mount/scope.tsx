// Real scope projections, tree controls and public Summary navigation callbacks.
import { useState } from "react";
import { IntentSummary } from "../../src/IntentSummary.tsx";
import { IntentFileProof } from "../../src/IntentFileProof.tsx";
import { IntentLocationGroup } from "../../src/IntentLocationGroup.tsx";
import {
  intentStoryOverlay,
  overlayFilesByPath,
} from "../../src/intentStoryOverlay.ts";
import {
  owningLocation,
  filesOfSelection,
} from "../../src/intentSelectionCoverage.ts";
import { selectionScope } from "../../src/intentWorkspaceSelection.ts";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import type { ComparisonScope } from "../support/comparisonMountTypes.ts";

export function ComparisonMountScope({
  facts,
}: {
  readonly facts: ComparisonScope;
}) {
  const [selection, setSelection] = useState(facts.selection);
  const [expanded, setExpanded] = useState(
    () => new Set(facts.locations.map(({ path }) => path)),
  );
  const overlay = intentStoryOverlay(facts.locations, facts.changed);
  const treeFiles = overlayFilesByPath(facts.locations, overlay);
  const location = owningLocation(facts.locations, selection);
  return (
    <>
      <nav className="intent-locations" aria-label="Intent files">
        {facts.locations.map((one, index) => (
          <IntentLocationGroup
            key={one.path}
            location={one}
            files={overlay.locations[index]?.files ?? []}
            containsChanges={overlay.locations[index]?.containsChanges ?? false}
            expansion={undefined}
            selection={selection}
            onSelect={setSelection}
            idPrefix={intentLocationIdPrefix(one.path)}
            expanded={expanded.has(one.path)}
            onToggle={() => {
              setExpanded((before) => {
                const next = new Set(before);
                if (next.has(one.path)) next.delete(one.path);
                else next.add(one.path);
                return next;
              });
            }}
          />
        ))}
      </nav>
      {selectionScope(selection) === "file" ? (
        <section aria-label="Proof">
          <IntentFileProof
            path={selection.path}
            treeFile={treeFiles.get(selection.path)}
            revision={facts.revision}
          />
        </section>
      ) : (
        location !== undefined && (
          <IntentSummary
            key={`${facts.revision}:${selection.path}`}
            path={selection.path}
            files={filesOfSelection(treeFiles, selection)}
            treeFiles={treeFiles}
            location={location}
            revision={facts.revision}
            onOpen={setSelection}
          />
        )
      )}
    </>
  );
}
