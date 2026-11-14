// Why Intent has no locations to browse (`./IntentPerspective.tsx`): none are
// configured, the agent settings holding them are malformed or unreadable, or
// the locations could not be read, each but the first with Retry.

import type { ReactNode } from "react";
import { agentSettingsPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type {
  IntentLocation,
  IntentLocations,
  IntentSettingsProblem,
} from "./authenticatedIntentRead.ts";
import type { IntentLocationsFailure } from "./useIntentLocations.ts";

// A settled locations answer: the configured locations to browse, or the
// explanation shown in their place.
export type SettledLocations =
  | { readonly locations: readonly IntentLocation[] }
  | { readonly unavailable: ReactNode };

export function settledLocationsOf(
  intent: IntentLocations | IntentLocationsFailure,
  label: string,
  onRetry: () => void,
): SettledLocations {
  if ("failed" in intent) {
    return {
      unavailable: (
        <p className="intent-settings-problem" role="alert">
          Intent locations for {label} could not be read
          {intent.failed === undefined
            ? "."
            : `: ${intent.failed.message}`}{" "}
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        </p>
      ),
    };
  }
  switch (intent.status) {
    case "configured":
      return { locations: intent.locations };
    case "not-configured":
      return { unavailable: <LocationsNotConfigured label={label} /> };
    case "settings-problem":
      return {
        unavailable: (
          <LocationsSettingsProblem
            label={label}
            problem={intent.problem}
            onRetry={onRetry}
          />
        ),
      };
  }
}

export function LocationsNotConfigured({ label }: { readonly label: string }) {
  return (
    <p className="intent-not-configured">
      No intent locations are configured for {label}. Add an{" "}
      <code>intent.locations</code> setting to <code>{agentSettingsPath}</code>{" "}
      to publish test-source folders for Intent to read.
    </p>
  );
}

export function LocationsSettingsProblem({
  label,
  problem,
  onRetry,
}: {
  readonly label: string;
  readonly problem: IntentSettingsProblem;
  readonly onRetry: () => void;
}) {
  const explanation =
    problem === "malformed"
      ? `${agentSettingsPath} is not valid JSON, so Intent locations for ${label} could not be read.`
      : `${agentSettingsPath} could not be read, so Intent locations for ${label} are unavailable.`;
  return (
    <p className="intent-settings-problem" role="alert">
      {explanation}{" "}
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </p>
  );
}
