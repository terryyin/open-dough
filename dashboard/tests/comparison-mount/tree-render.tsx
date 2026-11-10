// Static observations of the same header and file controls the real tree uses.
import { renderToStaticMarkup } from "react-dom/server";
import { IntentLocationHeader } from "../../src/IntentLocationHeader.tsx";
import { IntentTreeFileRow } from "../../src/IntentTreeFileRow.tsx";
import { intentStoryOverlay } from "../../src/intentStoryOverlay.ts";
import { treeComparisonReadingOf } from "../../src/intentTreeComparison.ts";
import { reviewedFileWords } from "../../src/StoryReviewFileTree.tsx";
import { intentLocationIdPrefix } from "../../src/intentLocationIds.ts";
import type { ComparisonRenderFacts } from "../support/comparisonRenderFacts.ts";
import { preparedComparisonEvidence } from "./evidence.ts";

export function comparisonTreeMarkup(facts: ComparisonRenderFacts) {
  const scope = facts.scope;
  if (scope === undefined) throw new Error("Tree observation needs locations");
  const overlay = intentStoryOverlay(scope.locations, scope.changed);
  const reading = treeComparisonReadingOf(preparedComparisonEvidence(facts));
  return renderToStaticMarkup(
    <nav className="intent-locations" aria-label="Intent files">
      {scope.locations.map((location, at) => (
        <section key={location.path}>
          <IntentLocationHeader
            location={location}
            reading={reading}
            selected={scope.selection.path === location.path}
            idPrefix={intentLocationIdPrefix(location.path)}
            expanded
            onToggle={() => {}}
            onSelect={() => {}}
          />
          {overlay.locations[at]?.files.map((file) => (
            <IntentTreeFileRow
              key={file.path}
              label={
                file.change === undefined
                  ? `${location.path}/${file.path}`
                  : reviewedFileWords(file.change)
              }
              name={file.path}
              selected={
                scope.selection.path === `${location.path}/${file.path}`
              }
              reading={reading}
              path={`${location.path}/${file.path}`}
              treeFile={file}
              onSelect={() => {}}
            />
          ))}
        </section>
      ))}
    </nav>,
  );
}
