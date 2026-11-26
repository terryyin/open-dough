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
import "./intent-explanations.css";
import "./intent-summary.css";

function LocationConfiguration({
  location,
}: {
  readonly location: IntentLocation;
}) {
  const sources =
    "sources" in location
      ? location.sources
      : [{ syntax: location.kind, include: location.include ?? [] }];

  return (
    <ul
      className="intent-summary-configuration"
      role="list"
      aria-label="Test configuration"
    >
      {sources.map(({ syntax, include }, index) => (
        <li key={index}>
          {syntax && <span>{syntax}</span>}
          {include.map((pattern, at) => (
            <code key={at}>{pattern}</code>
          ))}
        </li>
      ))}
    </ul>
  );
}

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
  const root = path === location.path;
  return (
    <section className="intent-summary" aria-label="Summary">
      <h3>Summary</h3>
      {root && location.label !== undefined && (
        <p className="intent-summary-label">{location.label}</p>
      )}
      <p className="intent-summary-path">
        <code>{path}</code>
      </p>
      {root && <LocationConfiguration location={location} />}
      <p className="intent-summary-files">
        {files.length} {intentFileCountWords(files.length)}
      </p>
      {root && location.problem !== undefined && (
        <p className="intent-location-problem">
          {locationExplanation(location)}
        </p>
      )}
      {children}
    </section>
  );
}
