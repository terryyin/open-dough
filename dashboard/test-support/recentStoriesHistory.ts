// Publishes distinct Backlog stories a Recent stories history journey selects
// in turn (../src/recentStories.ts). Identities and titles stay at the call
// site; this only shapes the substitute publication.

import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
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
