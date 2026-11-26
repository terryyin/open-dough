// Real scope projections, tree controls and public Summary navigation callbacks.
import { useState } from "react";
import { IntentSummary } from "../../src/IntentSummary.tsx";
import { IntentFileProof } from "../../src/IntentFileProof.tsx";
import { IntentFileTree } from "../../src/IntentFileTree.tsx";
import {
  intentStoryOverlay,
  intentLocationFiles,
  storyRepositoryTree,
} from "../../src/intentStoryOverlay.ts";
import {
  owningLocation,
  filesOfSelection,
} from "../../src/intentSelectionCoverage.ts";
import { selectionScope } from "../../src/intentWorkspaceSelection.ts";
import { reviewFoldersHolding } from "../../src/reviewFileTree.ts";
import type { ComparisonScope } from "../support/comparisonMountTypes.ts";

export function ComparisonMountScope({
  facts,
}: {
  readonly facts: ComparisonScope;
}) {
  const [selection, setSelection] = useState(facts.selection);
  const overlay = intentStoryOverlay(facts.locations, facts.changed);
  const shown = storyRepositoryTree(facts.locations, overlay, false);
  const treeFiles = overlay.files;
  const location = owningLocation(facts.locations, selection);
  const scopeFiles =
    location === undefined
      ? treeFiles
      : intentLocationFiles(treeFiles, location);
  return (
    <>
      <nav className="intent-locations" aria-label="Intent files">
        <IntentFileTree
          shown={shown}
          expansion={{
            round: 0,
            folders: [
              ...facts.locations.flatMap(({ path }) =>
                reviewFoldersHolding(shown.nodes, `${path}/`),
              ),
              ...reviewFoldersHolding(shown.nodes, facts.selection.path),
            ],
          }}
          selection={selection}
          onSelect={setSelection}
          reveal={undefined}
        />
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
            files={filesOfSelection(scopeFiles, selection)}
            treeFiles={scopeFiles}
            location={location}
            revision={facts.revision}
            onOpen={setSelection}
          />
        )
      )}
    </>
  );
}
