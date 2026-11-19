// Publishes distinct Backlog stories a Recent stories history journey selects
// in turn (../src/recentStories.ts). Identities and titles stay at the call
// site; this only shapes the substitute publication.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { recentStoriesLimit } from "../src/recentStories.ts";
import { backlogApart, describedRevision } from "./describedRevisions.ts";
import {
  frontendRevision,
  putFrontendPublished,
  type FrontendServiceState,
} from "./support/frontendServiceState.ts";

export type RecentHistoryStory = {
  readonly identity: string;
  readonly title: string;
};

// One more than the kept cap; after reload the earliest is gone and the
// Selected story is page state only.
export const beyondCapHistoryStories: readonly RecentHistoryStory[] = [
  ...Array(recentStoriesLimit + 1).keys(),
].map((index) => ({
  identity: `SEED-${900 + index}#story`,
  title: `Recent history ${String(index + 1)}`,
}));

export function putRecentHistoryStories(
  services: FrontendServiceState,
  stories: readonly RecentHistoryStory[],
): void {
  const entries = stories.map(({ identity, title }) =>
    makeMe.aBacklogEntry
      .with({
        identity,
        title,
        href: `seeds/${identity.replace("#", "-")}.md#story`,
      })
      .please(),
  );
  putFrontendPublished(
    services,
    backlogApart(
      describedRevision(
        makeMe.aRepository
          .withRevision("recent-history", {
            backlog: { queued: [...entries] },
          })
          .please(),
        frontendRevision,
      ),
    ),
  );
}
