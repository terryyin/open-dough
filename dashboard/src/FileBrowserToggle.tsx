// One control shows or hides a file browser: Review changes' browser for
// whichever comparison is shown, and Intent's locations column.
// The file browser as its view places it: its element's id, and whether the
// developer shows it.
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
