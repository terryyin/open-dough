// The Intent perspective's two reading modes (`./IntentPerspective.tsx`):
// Intent, its locations with CI status as the empty-selection homepage and
// Purpose and Proof when a file is selected (`./IntentBrowser.tsx`), and
// Optimization Candidates, the published record across the content area
// (`./IntentCandidatesRecord.tsx`). CI status fills Intent's reading when
// nothing is selected (`./IntentCiStatus.tsx`), offered whether or not
// locations are configured. One segmented strip under the banner, an Intent
// tablist (`./IntentTabs.tsx`) of Intent's own, not another perspective.
// Directly activating Intent (click, Enter or Space), even while it is
// chosen, returns home (`onHome`): without a selected story the browsing
// selection clears (`./intentWorkspaceSelection.ts`), leaving tree expansion
// and Purpose/Proof reading choices as they were; with one, its CI comparison
// view shows (`./intentStoryTabs.tsx`) and its Changed tests reading stays.
// Arrow keys, Home and End only choose the mode, so the reading stays. While
// the Intent mode shows the locations tree without a selected story, the
// strip offers Review changes' **Hide files** / **Show files**
// (`./FileBrowserToggle.tsx`) for the locations column; a selected story's
// view row offers it instead. The strip's chosen tab is where the keyboard
// returns when what held it left an Intent page (`./storyCardFocus.ts`).

import {
  FileBrowserToggle,
  type FileBrowserPlace,
} from "./FileBrowserToggle.tsx";
import { IntentTabs, type IntentTabOption } from "./IntentTabs.tsx";
import { intentHomeMarks } from "./storyCardFocus.ts";
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
  onHome,
  files,
  onShowFiles,
}: {
  readonly mode: IntentMode;
  readonly idPrefix: string;
  readonly onSelect: (next: IntentMode) => void;
  // Intent activated directly.
  readonly onHome: () => void;
  // The locations column while the strip offers its toggle.
  readonly files: FileBrowserPlace | undefined;
  readonly onShowFiles: (shown: boolean) => void;
}) {
  return (
    <div className="intent-mode-bar" {...intentHomeMarks}>
      <IntentTabs
        options={modes}
        selected={mode}
        onSelect={onSelect}
        onActivate={(activated) => {
          if (activated === "intent") onHome();
        }}
        label="Intent reading"
        idPrefix={idPrefix}
      />
      <FileBrowserToggle browser={files} onShowBrowser={onShowFiles} />
    </div>
  );
}
