// A selected story's view of Intent's Intent reading mode
// (`./IntentPerspective.tsx`): its persistent header
// (`./IntentStorySummary.tsx`) above its views (`./intentStoryTabs.tsx`),
// with Hide files / Show files ending their row on Changed tests. CI
// comparison and Intent coverage are drawn here; Changed tests is the
// locations browser (`./IntentBrowser.tsx`), which names its panel by
// `storyBrowserPanel`, or the locations' explanation here in its place. The
// browser follows this view rather than holding it, so CI never remounts as
// locations settle.

import type { ReactNode } from "react";
import {
  FileBrowserToggle,
  type FileBrowserPlace,
} from "./FileBrowserToggle.tsx";
import type { IntentBrowserPanel } from "./IntentBrowser.tsx";
import { IntentCiStatus } from "./IntentCiStatus.tsx";
import { IntentTabs, intentTabId, intentTabPanelId } from "./IntentTabs.tsx";
import {
  IntentStoryCoverage,
  IntentStoryHeader,
  type StorySummary,
} from "./IntentStorySummary.tsx";
import { storyTabs, type IntentStoryTab } from "./intentStoryTabs.tsx";

// The story's views' ids under the reading-mode strip's.
export const storyTabsIdPrefix = (modeIdPrefix: string) =>
  `${modeIdPrefix}-story`;

// The Changed tests panel the locations browser draws.
export const storyBrowserPanel = (
  modeIdPrefix: string,
  tab: IntentStoryTab,
  modeShown: boolean,
): IntentBrowserPanel => ({
  id: intentTabPanelId(storyTabsIdPrefix(modeIdPrefix), "changed"),
  labelledBy: intentTabId(storyTabsIdPrefix(modeIdPrefix), "changed"),
  hidden: !modeShown || tab !== "changed",
});

export function IntentStoryView({
  summary,
  source,
  outside,
  modeIdPrefix,
  modeShown,
  tab,
  onChooseTab,
  explanation,
  files,
  onShowFiles,
}: {
  readonly summary: StorySummary;
  readonly source: string;
  // Changed files outside every Intent location, once known.
  readonly outside: number | undefined;
  // The reading-mode strip's ids and whether its Intent mode is chosen.
  readonly modeIdPrefix: string;
  readonly modeShown: boolean;
  readonly tab: IntentStoryTab;
  readonly onChooseTab: (next: IntentStoryTab) => void;
  // What shows in place of the locations browser until it can show.
  readonly explanation: ReactNode;
  // The locations column, once the browser shows it.
  readonly files: FileBrowserPlace | undefined;
  readonly onShowFiles: (shown: boolean) => void;
}) {
  const idPrefix = storyTabsIdPrefix(modeIdPrefix);
  const panel = (shown: IntentStoryTab) => ({
    className: "intent-story-panel",
    tabIndex: -1,
    role: "tabpanel",
    id: intentTabPanelId(idPrefix, shown),
    "aria-labelledby": intentTabId(idPrefix, shown),
    hidden: tab !== shown,
  });
  return (
    <div
      className="intent-story-view"
      role="tabpanel"
      id={intentTabPanelId(modeIdPrefix, "intent")}
      aria-labelledby={intentTabId(modeIdPrefix, "intent")}
      hidden={!modeShown}
      data-fills={
        tab !== "changed" || explanation !== undefined ? "true" : "false"
      }
    >
      <IntentStoryHeader summary={summary} source={source} outside={outside} />
      <div className="intent-story-tabbar">
        <IntentTabs
          options={storyTabs}
          selected={tab}
          onSelect={onChooseTab}
          label="Selected story views"
          idPrefix={idPrefix}
        />
        <FileBrowserToggle
          browser={tab === "changed" ? files : undefined}
          onShowBrowser={onShowFiles}
        />
      </div>
      <div {...panel("ci")}>
        <IntentCiStatus />
      </div>
      {explanation !== undefined && (
        <div {...panel("changed")}>{explanation}</div>
      )}
      <div {...panel("coverage")}>
        <IntentStoryCoverage story={summary.story} />
      </div>
    </div>
  );
}
