// Summary reading pane for a selected Intent location or folder
// (`./IntentSelectionReading.tsx`): names the selection by path and how many
// matching files the tree lists, a selected story's overlay included,
// explains an unusable location, and shows the selection's CI proof with its
// immediate folders and files among those (`./IntentScopeProof.tsx`). It
// reads no source file.

import type { IntentLocation } from "./authenticatedIntentRead.ts";
import { locationExplanation } from "./intentLocationExplanation.ts";
import { intentFileCountWords } from "./intentSelectionCoverage.ts";
import type { ReactNode } from "react";

export function IntentSummaryView({
  path,
  files,
  location,
  children,
}: {
  readonly path: string;
  // The files the tree lists under the selection, a selected story's
  // overlay included.
  readonly files: readonly string[];
  readonly location: IntentLocation;
  readonly children: ReactNode;
}) {
  return (
    <section className="intent-summary" aria-label="Summary">
      <h3>Summary</h3>
      {path === location.path && location.label !== undefined && (
        <p className="intent-summary-label">{location.label}</p>
      )}
      <p className="intent-summary-path">
        <code>{path}</code>
      </p>
      <p className="intent-summary-files">
        {files.length} {intentFileCountWords(files.length)}
      </p>
      {location.problem !== undefined && (
        <p className="intent-location-problem">
          {locationExplanation(location)}
        </p>
      )}
      {children}
    </section>
  );
}
