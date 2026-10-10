// Historical context names the fixed accepted pair, without workspace or marking semantics.
import type { LandedReviewContext } from "./storyReviewOneShot.ts";
import type { FileBrowserPlace } from "./StoryReviewContextLine.tsx";
export function LandedContext({
  landing,
  browser,
  onShowBrowser,
}: {
  readonly landing: LandedReviewContext;
  readonly browser?: FileBrowserPlace;
  readonly onShowBrowser: (shown: boolean) => void;
}) {
  return (
    <div>
      <h3>Landed one-shot run</h3>
      <p>
        {landing.workflow === "refinement" ? "Refinement" : "Execution"}{" "}
        launched{" "}
        <time dateTime={landing.launchedAt}>
          {new Date(landing.launchedAt).toLocaleString()}
        </time>
        , delivered to{" "}
        <code>
          {landing.remote}/{landing.target.replace(/^refs\/heads\//, "")}
        </code>
        .
      </p>
      <p>
        From <code>{landing.base}</code> to <code>{landing.revision}</code>.
      </p>
      {browser !== undefined && (
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
      )}
    </div>
  );
}
