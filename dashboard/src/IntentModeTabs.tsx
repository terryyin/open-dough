// The Intent perspective's two reading modes (`./IntentPerspective.tsx`):
// Intent, its locations with CI status as the empty-selection homepage and
// Purpose and Proof when a file is selected (`./IntentBrowser.tsx`), and
// Optimization Candidates, the published record across the content area
// (`./IntentCandidatesRecord.tsx`). CI status fills Intent's reading when
// nothing is selected (`./IntentCiStatus.tsx`), offered whether or not
// locations are configured. One segmented strip under the banner, an Intent
// tablist (`./IntentTabs.tsx`) of Intent's own, not another perspective.

import { IntentTabs, type IntentTabOption } from "./IntentTabs.tsx";
import "./intent-mode-tabs.css";

export type IntentMode = "intent" | "candidates";

const modes: readonly IntentTabOption<IntentMode>[] = [
  { value: "intent", label: "Intent" },
  { value: "candidates", label: "Optimization Candidates" },
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
