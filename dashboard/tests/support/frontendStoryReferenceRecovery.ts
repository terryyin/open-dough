// Frontend answers for recovering an active story reference
// (../../frontend-tests/navigation/story-reference-recovery.spec.ts): Story A
// waits on Story B and needs a decision about Story C, whose seed is published
// while it is not yet queued; Open Dough's backlog read can be held, failed,
// and later answered with Story C queued at a later revision.

import type { Page } from "@playwright/test";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  roughStoryC,
  storyA,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { backlogApart, describedRevisions } from "../describedRevisions.ts";
import { holdAuthenticatedReadsWhere } from "../holdAuthenticatedReads.ts";
import { twoDependencies } from "../storyDependencyFixture.ts";
import {
  controlFrontendAuthenticatedRead,
  isRevisionCheck,
} from "./frontendAuthenticatedReadControl.ts";
import { openDoughSource } from "./frontendPublishedFixtures.ts";
import {
  putFrontendPublished,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import {
  dependenciesRepository,
  dependenciesRevisions,
} from "./frontendStoryDependencies.ts";

const laterRevision = "c3".repeat(20);

// Open Dough's backlog read: no file, Done, Intent, agents or branch
// parameter, and not a revision check.
const isBacklogRead = (params: URLSearchParams) =>
  (params.get("source") ?? openDoughSource.id) === openDoughSource.id &&
  !isRevisionCheck(params) &&
  ["path", "done", "intent", "agents", "branch"].every(
    (name) => !params.has(name),
  );

// Publishes Story A's agreements with Story C not queued, and keeps the page's
// revision checks pending so only a retry reads a later revision. Returns controls
// over Open Dough's backlog read: `hold` keeps the next reads pending until
// its release, `fail` answers them with an actionable GitHub failure, `pass`
// answers them again, and `queueStoryC` publishes Story C as queued at a
// later revision.
export async function putFrontendRecoverableReference(
  page: Page,
  services: FrontendServiceState,
  releases: (() => void)[],
) {
  const { dependencies, queued } = describedRevisions(
    dependenciesRepository(twoDependencies())
      .withRevision("queued", {
        message: "Queue Story C",
        backlog: { direction, queued: [storyA, storyB, roughStoryC] },
      })
      .please(),
    { ...dependenciesRevisions(services), queued: laterRevision },
  );
  putFrontendPublished(services, backlogApart(dependencies));
  await holdAuthenticatedReadsWhere(page, isRevisionCheck, releases);
  const backlog = await controlFrontendAuthenticatedRead(page, isBacklogRead);
  return {
    hold: async () =>
      (await holdAuthenticatedReadsWhere(page, isBacklogRead, releases))
        .release,
    fail: () => {
      backlog.respond({ error: "GitHub could not find the backlog." }, 502);
    },
    pass: backlog.pass,
    queueStoryC: () => {
      putFrontendPublished(services, backlogApart(queued));
    },
  };
}
