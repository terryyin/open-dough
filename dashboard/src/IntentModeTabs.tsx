// The Intent perspective's three reading modes (`./IntentPerspective.tsx`):
// Intent, its locations with Purpose and Proof (`./IntentBrowser.tsx`),
// Optimization Candidates, the published record across the content area, and
// CI status, the trunk's selected-check judgment across the content area
// (`./IntentCiStatus.tsx`), offered whether or not locations are configured.
// One segmented strip under the banner, an Intent tablist
// (`./IntentTabs.tsx`) of Intent's own, not another perspective.

import { IntentTabs, type IntentTabOption } from "./IntentTabs.tsx";
import "./intent-mode-tabs.css";

export type IntentMode = "intent" | "candidates" | "ci-status";

const modes: readonly IntentTabOption<IntentMode>[] = [
  { value: "intent", label: "Intent" },
  { value: "candidates", label: "Optimization Candidates" },
  { value: "ci-status", label: "CI status" },
];

export function IntentModeTabs({
  mode,
  idPrefix,
  onSelect,
}: {
  readonly mode: IntentMode;
  readonly idPrefix: string;
  readonly onSelect: (next: IntentMode) => void;
}) {
  return (
    <div className="intent-mode-bar">
      <IntentTabs
        options={modes}
        selected={mode}
        onSelect={onSelect}
        label="Intent reading"
        idPrefix={idPrefix}
      />
    </div>
  );
}
