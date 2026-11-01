// Locations / scope prose for a candidate entry: each recorded reference is
// matched against configured Intent files (`./intentCandidatesLocationMatch.ts`)
// and either opens that file in the shared Intent selection, lists several
// full-path choices, or stays as recorded text with its specific gap reason.

import { Fragment, type ReactNode } from "react";
import { recordedCaseSuffix } from "./intentCaseTargetLine.ts";
import type {
  IntentConfiguredInventory,
  MatchedLocationTarget,
} from "./intentCandidatesLocationMatch.ts";
import { segmentLocationReferences } from "./intentCandidatesLocationSegments.ts";
import type { OpenCandidateLocation } from "./intentWorkspaceSelection.ts";

function gapReason(match: MatchedLocationTarget): string | undefined {
  switch (match.kind) {
    case "outside-configured":
      return "outside configured Intent locations";
    case "not-published":
      return "not published at this revision";
    default:
      return undefined;
  }
}

function Reference({
  label,
  match,
  entrySlug,
  onOpen,
}: {
  readonly label: string;
  readonly match: MatchedLocationTarget;
  readonly entrySlug: string;
  readonly onOpen: OpenCandidateLocation;
}) {
  if (match.kind === "not-a-file-reference") {
    return <span>{label}</span>;
  }
  if (match.kind === "file") {
    const caseSuffix =
      match.caseTarget === undefined
        ? undefined
        : recordedCaseSuffix(match.caseTarget);
    const linkLabel =
      caseSuffix !== undefined && label.endsWith(caseSuffix)
        ? label.slice(0, -caseSuffix.length)
        : label;
    return (
      <span className="intent-candidate-location-with-case">
        <button
          type="button"
          className="intent-candidate-location-link"
          onClick={() => {
            onOpen(
              match.caseTarget === undefined
                ? { path: match.path }
                : { path: match.path, caseTarget: match.caseTarget },
              entrySlug,
            );
          }}
        >
          {linkLabel}
        </button>
        {caseSuffix === undefined ? null : (
          <span className="intent-candidate-location-case">{caseSuffix}</span>
        )}
      </span>
    );
  }
  if (match.kind === "several") {
    return (
      <span className="intent-candidate-location-several">
        <span>{label}</span>
        <span className="intent-candidate-location-gap">
          {" "}
          (names several files
          {match.paths.map((path) => (
            <Fragment key={path}>
              ;{" "}
              <button
                type="button"
                className="intent-candidate-location-link"
                onClick={() => {
                  onOpen({ path }, entrySlug);
                }}
              >
                {path}
              </button>
            </Fragment>
          ))}
          )
        </span>
      </span>
    );
  }
  const reason = gapReason(match);
  return (
    <span className="intent-candidate-location-unopened">
      <span>{label}</span>
      {reason === undefined ? null : (
        <span className="intent-candidate-location-gap"> ({reason})</span>
      )}
    </span>
  );
}

export function IntentCandidatesLocationsText({
  text,
  recordPath,
  inventory,
  entrySlug,
  onOpen,
}: {
  readonly text: string;
  readonly recordPath: string;
  readonly inventory: IntentConfiguredInventory;
  readonly entrySlug: string;
  readonly onOpen: OpenCandidateLocation;
}) {
  const segments = segmentLocationReferences(text, recordPath, inventory);
  const parts: ReactNode[] = segments.map((segment, index) => {
    if (segment.kind === "text") {
      return <Fragment key={`t-${index}`}>{segment.text}</Fragment>;
    }
    return (
      <Reference
        key={`r-${index}`}
        label={segment.label}
        match={segment.match}
        entrySlug={entrySlug}
        onOpen={onOpen}
      />
    );
  });
  return <span className="intent-candidate-locations-text">{parts}</span>;
}
