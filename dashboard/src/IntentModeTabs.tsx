// The Intent perspective's two reading modes (`./IntentBrowser.tsx`):
// Intent, its locations with Purpose and Proof, and Optimization Candidates,
// the published record across the content area. One segmented strip under
// the banner, an Intent tablist (`./IntentTabs.tsx`) of Intent's own, not
// another perspective.

import { IntentTabs, type IntentTabOption } from "./IntentTabs.tsx";

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
