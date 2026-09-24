// Published plans may record their slices under `## Slices` instead of
// `## Ordered slices`. Setup commits the plan through the readiness repo and
// serves those exact revision bytes; the shared reader interprets the layout.

import { expect, test } from "./dashboardTest";
import { publishCommittedOrigin } from "./committedOrigin";
import { parts } from "./dashboardPage";
import { expectReadyDetailTwoCompleteUnderSlicesHeading } from "./storyReadinessDetail";
import {
  buildOpenDoughReadinessRepo,
  planReadyTwoDoneSlicesHeadingBody,
} from "./storyReadinessFixture";
import { publishTwoSlicesDone } from "./storyReadinessPublications";

test("Taken detail shows recorded slice progress from a published plan under a Slices heading", async ({
  page,
}) => {
  const cleanups: Array<() => void> = [];
  try {
    const openDough = buildOpenDoughReadinessRepo(
      (cleanup) => cleanups.push(cleanup),
      { canonicalOnlyQueued: true },
    );
    publishTwoSlicesDone(openDough, planReadyTwoDoneSlicesHeadingBody);
    await publishCommittedOrigin(page, {
      repoDir: openDough.directory,
      revision: openDough.revision,
      repository: "terryyin/open-dough",
    });

    await page.goto("/");
    const { source, taken } = parts(page);
    await expect(source).toContainText(openDough.revision);
    await expectReadyDetailTwoCompleteUnderSlicesHeading(taken);
  } finally {
    for (const cleanup of cleanups.reverse()) cleanup();
  }
});
