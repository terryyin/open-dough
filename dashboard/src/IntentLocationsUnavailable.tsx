// Why Intent has no locations to browse (`./IntentPerspective.tsx`): none are
// configured, or the agent settings holding them are malformed or unreadable,
// with Retry.

import { agentSettingsPath } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import type { IntentSettingsProblem } from "./authenticatedIntentRead.ts";

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
