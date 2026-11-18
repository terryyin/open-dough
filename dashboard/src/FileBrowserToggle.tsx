// One control shows or hides a file browser. Intent's locations column has
// it in words, led by a panel icon so a narrow view row can show the icon
// alone (`./intent-page.css`); Review changes' toolbar has it as an icon
// (`./StoryReviewToolbar.tsx`). Both say and do the same.

import { PanelLeft } from "lucide-react";
import { Icon } from "./Icon.tsx";

// The file browser as its view places it: its element's id, and whether the
// developer shows it.
export type FileBrowserPlace = {
  readonly id: string;
  readonly shown: boolean;
};

// What a control that shows or hides the file browser is named and does.
export const fileBrowserToggle = (
  browser: FileBrowserPlace,
  onShowBrowser: (shown: boolean) => void,
) => ({
  label: browser.shown ? "Hide files" : "Show files",
  "aria-controls": browser.id,
  "aria-expanded": browser.shown,
  onClick: () => {
    onShowBrowser(!browser.shown);
  },
});

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
  const { label, ...toggle } = fileBrowserToggle(browser, onShowBrowser);
  return (
    <button type="button" className="start-launch-button" {...toggle}>
      {icon && <Icon icon={PanelLeft} />}
      <span className="file-browser-toggle-words">{label}</span>
    </button>
  );
}
