// Project Intent's heading and views (`./IntentProjectView.tsx`): **CI
// status**, the project's locations with trunk CI status as the empty-selection
// homepage and Purpose and Proof when a file is selected
// (`./IntentBrowser.tsx`), and **Optimization Candidates**, the published
// record across the content area (`./IntentCandidatesRecord.tsx`). CI status is
// offered whether or not locations are configured. As Intent's landing, with no
// selected story, it shows no heading, the perspective choice naming the page;
// visited from a selected story, its heading names Project Intent and offers
// **Back to selected story** (`./intentStoryTabs.tsx`). One segmented strip, an
// Intent tablist (`./IntentTabs.tsx`) of Intent's own, not another perspective.
// Directly activating CI status (click, Enter or Space), even while it is
// chosen, returns home (`onHome`): the project's browsing selection clears
// (`./intentWorkspaceSelection.ts`), leaving tree expansion and Purpose/Proof
// reading choices as they were. Arrow keys, Home and End only choose the view,
// so the reading stays; directly activating Optimization Candidates returns the
// keyboard to the entry a test was opened from (`onCandidates`). While CI
// status shows the locations tree, the strip offers Review changes' **Hide
// files** / **Show files** (`./FileBrowserToggle.tsx`) for the locations
// column. The strip's chosen tab is where the keyboard returns when what held
// it left an Intent page (`./storyCardFocus.ts`).

import { ArrowLeft } from "lucide-react";
import {
  FileBrowserToggle,
  type FileBrowserPlace,
} from "./FileBrowserToggle.tsx";
import { Icon } from "./Icon.tsx";
import { IntentTabs, type IntentTabOption } from "./IntentTabs.tsx";
import { intentHomeMarks } from "./storyCardFocus.ts";
import "./intent-mode-tabs.css";

export type IntentMode = "ci" | "candidates";

const modes: readonly IntentTabOption<IntentMode>[] = [
  { value: "ci", label: "CI status" },
  { value: "candidates", label: "Optimization Candidates" },
];

// The control that leaves Project Intent for the selected story.
export const backToStoryId = (idPrefix: string) => `${idPrefix}-to-story`;

export function IntentModeTabs({
  mode,
  idPrefix,
  onSelect,
  onHome,
  onCandidates,
  files,
  onShowFiles,
  onBackToStory,
}: {
  readonly mode: IntentMode;
  readonly idPrefix: string;
  readonly onSelect: (next: IntentMode) => void;
  // CI status activated directly.
  readonly onHome: () => void;
  // Optimization Candidates activated directly.
  readonly onCandidates: () => void;
  // The locations column while the strip offers its toggle.
  readonly files: FileBrowserPlace | undefined;
  readonly onShowFiles: (shown: boolean) => void;
  // Back to the page's selected story, when one is selected.
  readonly onBackToStory: (() => void) | undefined;
}) {
  return (
    <>
      {onBackToStory !== undefined && (
        <header className="intent-project-head">
          <h2>Project Intent</h2>
          <button
            type="button"
            id={backToStoryId(idPrefix)}
            className="start-launch-button"
            onClick={onBackToStory}
          >
            <Icon icon={ArrowLeft} /> Back to selected story
          </button>
        </header>
      )}
      <div className="intent-mode-bar" {...intentHomeMarks}>
        <IntentTabs
          options={modes}
          selected={mode}
          onSelect={onSelect}
          onActivate={(activated) => {
            if (activated === "ci") onHome();
            else onCandidates();
          }}
          label="Project Intent views"
          idPrefix={idPrefix}
        />
        <FileBrowserToggle icon browser={files} onShowBrowser={onShowFiles} />
      </div>
    </>
  );
}
