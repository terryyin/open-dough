// Historical context names the fixed accepted pair, without workspace or marking semantics.
import type { LandedReviewContext } from "./storyReviewLandedRun.ts";
import {
  FileBrowserToggle,
  type FileBrowserPlace,
} from "./StoryReviewBrowserToggle.tsx";
import { launchKindName } from "./launchWorkflow.ts";
import { reviewTargetName } from "./storyReviewContract.ts";
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
      <h3>Landed run</h3>
      <p>
        {launchKindName(landing.workflow)} launched{" "}
        <time dateTime={landing.launchedAt}>
          {new Date(landing.launchedAt).toLocaleString()}
        </time>
        , delivered to <code>{reviewTargetName(landing)}</code>.
      </p>
      <p>
        From <code>{landing.base}</code> to <code>{landing.revision}</code>.
      </p>
      <FileBrowserToggle browser={browser} onShowBrowser={onShowBrowser} />
    </div>
  );
}
