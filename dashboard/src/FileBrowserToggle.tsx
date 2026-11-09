// One control shows or hides a file browser: Review changes' browser for
// whichever comparison is shown, and Intent's locations column, which leads
// its words with a panel icon so a narrow view row can show the icon alone
// (`./intent-page.css`).

import { PanelLeft } from "lucide-react";
import { Icon } from "./Icon.tsx";

// The file browser as its view places it: its element's id, and whether the
// developer shows it.
export type FileBrowserPlace = {
  readonly id: string;
  readonly shown: boolean;
};

export function FileBrowserToggle({
  browser,
  onShowBrowser,
  icon = false,
}: {
  readonly browser: FileBrowserPlace | undefined;
  readonly onShowBrowser: (shown: boolean) => void;
  // Whether a panel icon leads the words.
  readonly icon?: boolean;
}) {
  if (browser === undefined) return null;
  return (
    <button
      type="button"
      className="start-launch-button"
      aria-controls={browser.id}
      aria-expanded={browser.shown}
      onClick={() => {
        onShowBrowser(!browser.shown);
      }}
    >
      {icon && <Icon icon={PanelLeft} />}
      <span className="file-browser-toggle-words">
        {browser.shown ? "Hide files" : "Show files"}
      </span>
    </button>
  );
}
