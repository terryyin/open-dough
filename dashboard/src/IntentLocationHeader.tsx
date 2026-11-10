// The real location header, including its combined comparison words and cues.
import { Book, BookOpen } from "lucide-react";
import { scopeCueElementAttrs } from "./ciScopeComparisonCuePresentation.ts";
import { Icon } from "./Icon.tsx";
import type { IntentLocation } from "./authenticatedIntentRead.ts";
import {
  declaredKindOf,
  declaredPatternsOf,
  selectionPhrase,
} from "./intentLocationExplanation.ts";
import {
  treeComparisonAccessibleName,
  treeLocationComparisonOf,
  type TreeComparisonReading,
} from "./intentTreeComparison.ts";
import type { IntentSelection } from "./intentWorkspaceSelection.ts";

function LocationLabel({ location }: { readonly location: IntentLocation }) {
  const kind = declaredKindOf(location);
  return (
    <>
      {location.label === undefined ? (
        <code>{location.path}</code>
      ) : (
        <span title={location.path}>{location.label}</span>
      )}
      {kind === undefined ? null : (
        <>
          {" "}
          <span className="intent-location-kind">{kind}</span>
        </>
      )}
      {declaredPatternsOf(location).map((pattern, at) => (
        <span
          key={`${String(at)}-${pattern}`}
          className="intent-location-pattern"
        >
          {" "}
          <code>{pattern}</code>
        </span>
      ))}
    </>
  );
}

function locationBaseName(location: IntentLocation): string {
  return `${location.label ?? location.path}, ${selectionPhrase(location)}`;
}

export function IntentLocationHeader({
  location,
  reading,
  selected,
  idPrefix,
  expanded,
  onToggle,
  onSelect,
}: {
  readonly location: IntentLocation;
  readonly reading: TreeComparisonReading;
  readonly selected: boolean;
  readonly idPrefix: string;
  readonly expanded: boolean;
  readonly onToggle: () => void;
  readonly onSelect: (selection: IntentSelection) => void;
}) {
  const compared = treeLocationComparisonOf(reading, location.path);
  const locationHeaderAttrs = scopeCueElementAttrs(
    "intent-location-header",
    compared?.cues,
  );
  const locationName =
    compared === undefined
      ? undefined
      : treeComparisonAccessibleName(locationBaseName(location), compared);

  return (
    <div {...locationHeaderAttrs} data-selected={selected || undefined}>
      <button
        type="button"
        className="intent-location-toggle"
        aria-expanded={expanded}
        aria-controls={`${idPrefix}-body`}
        aria-label={`${expanded ? "Collapse" : "Expand"} ${location.label ?? location.path}`}
        onClick={onToggle}
      >
        <Icon icon={expanded ? BookOpen : Book} />
      </button>
      <button
        type="button"
        id={`${idPrefix}-heading`}
        className="sessions-sidebar-section-header intent-location-name"
        data-location-path={location.path}
        aria-pressed={selected}
        {...(locationName === undefined ? {} : { "aria-label": locationName })}
        onClick={() => {
          if (selected) {
            onToggle();
            return;
          }
          onSelect({ path: location.path, scope: "location" });
        }}
      >
        <LocationLabel location={location} />
      </button>
    </div>
  );
}
