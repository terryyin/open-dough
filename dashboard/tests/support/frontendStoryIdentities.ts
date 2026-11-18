// Frontend answers for telling story references apart
// (../../frontend-tests/navigation/story-reference-identity.spec.ts): two
// suppliers sharing Story B's seed, and Pygardon telling SEED-B#b in a seed of
// its own (../storyDependencyFixture.ts).

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { direction } from "../../../Distribution/tests/support/product-backlog-fixture.mjs";
import {
  queuedReadyRepository,
  queuedSeedWithDependencies,
  storyA,
  storyB,
  storyPlanPath,
  storySeed,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { catalogPublications } from "../catalogProjectRecords.ts";
import { describedRevisions } from "../describedRevisions.ts";
import {
  agreement,
  decisionOnC,
  secondInSeedB,
  supplierB,
  suppliersInOneSeed,
  twoDependencies,
} from "../storyDependencyFixture.ts";
import { answerOwnPublications } from "./frontendCatalogProjects.ts";
import type { FrontendServiceState } from "./frontendServiceState.ts";
import { putFrontendDependencies } from "./frontendStoryDependencies.ts";

// Story A also waits on the second story in Story B's seed; Story B is Taken
// with its plan, the second story stays in the Backlog list.
export function putFrontendSuppliersInOneSeed(
  services: FrontendServiceState,
): void {
  const shared = suppliersInOneSeed();
  const { files } = twoDependencies();
  putFrontendDependencies(services, {
    backlog: {
      direction,
      taken: [
        makeMe.aBacklogEntry
          .with({
            ...storyB,
            plan: { label: "plan", target: storyPlanPath(storyB) },
          })
          .please(),
      ],
      queued: [storyA, secondInSeedB],
    },
    files: {
      ...files,
      ...shared.files,
      ".planning/seeds/A.md": queuedSeedWithDependencies(storyA, [
        agreement({ supplier: supplierB, state: "waiting" }),
        decisionOnC(),
        agreement({ supplier: secondInSeedB, state: "waiting" }),
      ]),
    },
  });
}

const pygardonHome =
  "seeds/SEED-120-release-readiness.md#story-checked-artifact-eligibility";

// Open Dough publishes Story A waiting on Story B; Pygardon tells SEED-B#b in
// a seed of its own, which its Story A waits on. Returns the expected blob URL
// of Pygardon's telling at its published revision.
export async function answerPygardonTelling(
  page: Page,
  services: FrontendServiceState,
): Promise<string> {
  putFrontendDependencies(services, twoDependencies());
  const pygardonStory = makeMe.aBacklogEntry
    .with({
      identity: "SEED-B#b",
      href: pygardonHome,
      title: "Pygardon selected story",
    })
    .please();
  const { pygardon } = catalogPublications;
  const { telling } = describedRevisions(
    queuedReadyRepository()
      .withRevision("telling", {
        backlog: { direction, queued: [storyA, pygardonStory] },
        files: {
          ...twoDependencies().files,
          [`.planning/${pygardonHome.split("#")[0]}`]: storySeed(
            pygardonStory,
            "Deliver Pygardon outcome.",
          ),
          ".planning/seeds/A.md": queuedSeedWithDependencies(storyA, [
            agreement({
              supplier: { identity: "SEED-B#b", href: pygardonHome },
              state: "waiting",
            }),
            decisionOnC(),
          ]),
        },
      })
      .please(),
    { base: "b0".repeat(20), telling: pygardon.revision },
  );
  await answerOwnPublications(page, services, [{ ...pygardon, ...telling }]);
  return `https://github.com/${pygardon.repository}/blob/${pygardon.revision}/.planning/${pygardonHome}`;
}
