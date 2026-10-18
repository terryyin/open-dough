// One control shows or hides the browser for whichever comparison is shown.
// The file browser as the review places it: its element's id, and whether
// the developer shows it.
export type FileBrowserPlace = {
  readonly id: string;
  readonly shown: boolean;
};

export function FileBrowserToggle({
  browser,
  onShowBrowser,
}: {
  readonly browser: FileBrowserPlace | undefined;
  readonly onShowBrowser: (shown: boolean) => void;
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
      {browser.shown ? "Hide files" : "Show files"}
    </button>
  );
}
