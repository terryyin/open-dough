// Historical context names the fixed accepted pair.
import type { LandedReviewContext } from "./storyReviewLandedRun.ts";
import { launchKindName } from "./launchWorkflow.ts";
import { reviewTargetName } from "./storyReviewContract.ts";
export function LandedContext({
  landing,
}: {
  readonly landing: LandedReviewContext;
}) {
  return (
    <div>
      <h3>Landed run</h3>
      <p>
        {launchKindName(landing.workflow)}
        {landing.launchedAt === undefined ? (
          " delivered to "
        ) : (
          <>
            {" launched "}
            <time dateTime={landing.launchedAt}>
              {new Date(landing.launchedAt).toLocaleString()}
            </time>
            {", delivered to "}
          </>
        )}
        <code>{reviewTargetName(landing)}</code>.
      </p>
      <p>
        From <code>{landing.base}</code> to <code>{landing.revision}</code>.
      </p>
    </div>
  );
}
