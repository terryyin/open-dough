// A Done story's sessions published from another machine are Intent's review
// scopes on a machine with no launch of them: a chosen session's comparison
// lists only its own files, and Whole story returns to the story; a session's
// recorded runs are chosen under it, each excluding the other's and later
// trunk work, and a run that shared its checkout warns so.
// Frontend naming and ordering: ../../dashboard/frontend-tests/intent/intent-story-compare-sessions.spec.ts.

import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  publishedPairAdding,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import { openIntentReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import {
  queuedIdentity,
  type StartOrigin,
} from "../../dashboard/test-support/support/startOrigin.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import { publishDeclaredTrunk } from "../../dashboard/test-support/support/storyCiComparisonBaseline.ts";
import { test } from "../../dashboard/test-support/support/preparationPage.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { defaultBacklogPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const storyTitle = "Story A";
const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

// The file each of another machine's sessions of the story adds.
const files = {
  firstRefinement: "first-refinement.txt",
  execution: "execution.txt",
  secondRefinement: "second-refinement.txt",
  followUp: "follow-up.txt",
};

// Another machine's sessions of the story, each closing one trunk pair that
// adds its own file, oldest first, with their close records on trunk; answers
// trunk's revision after the last record.
function publishedSessions(origin: StartOrigin) {
  const builder = () => makeMe.aSessionRecord;
  const sessions = [
    [files.firstRefinement, builder().forRefinementOf(queuedIdentity), 40],
    [files.execution, builder().forExecutionOf(queuedIdentity), 30],
    [files.secondRefinement, builder().forRefinementOf(queuedIdentity), 20],
    [files.followUp, builder().forStory(queuedIdentity), 10],
  ] as const;
  let revision = "";
  for (const [file, session, closed] of sessions) {
    const record = session
      .closing(publishedPairAdding(origin, file))
      .closedAt(minutesAgo(closed))
      .please();
    revision = trunkAdvancedWith(
      origin,
      sessionRecordPathBeside(defaultBacklogPath, record.sessionId),
      `${JSON.stringify(record)}\n`,
    );
  }
  return revision;
}

test("Intent reviews one published session of a Done story without its launch here", async ({
  page,
  origin,
}) => {
  await publishDeclaredTrunk(origin, intentTrunkCompletionOntoTip());
  await test.step("Given another machine published two refinements, an execution and an ad hoc follow-up of the story", () =>
    publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: publishedSessions(origin),
      repository: "terryyin/open-dough",
      follows: true,
    }));
  const review =
    await test.step("When this machine, with no launch of them, opens the Done story in Intent", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return openIntentReviewChanges(
        page,
        storyCard(parts(page).recentlyDone, storyTitle),
      );
    });
  await test.step("Then Review scope offers Whole story and each session once, oldest first", () =>
    review.comparison.expectSessions([
      "Whole story",
      "Refinement",
      "Execution",
      "Refinement",
      "Title unavailable",
    ]));
  await test.step("When it chooses the second refinement", () =>
    review.comparison.chooseSession(3));
  await test.step("Then the comparison lists only that refinement's file", async () => {
    await review.files.expectOnlyChangedFile(`Added ${files.secondRefinement}`);
    await review.files.expectTreeLacksText(
      files.firstRefinement,
      files.execution,
      files.followUp,
    );
  });
  await test.step("When it returns to Whole story", () =>
    review.comparison.chooseSession(0));
  await test.step("Then the story comparison no longer lists the session's file", () =>
    review.files.expectTreeLacksText(files.secondRefinement));
});

const firstRangeFile = "first-range.txt";
const secondRangeFile = "second-range.txt";
const betweenFile = "another-writer.txt";
const laterFile = "after-publication.txt";

// Another machine's session whose close record names two trunk pairs, one
// adding each range's file, another writer's commit between them, the second
// shared its checkout; then trunk moves on. Answers trunk's revision.
function publishedInTwoRanges(origin: StartOrigin) {
  const first = publishedPairAdding(origin, firstRangeFile);
  trunkAdvancedWith(origin, betweenFile);
  const second = publishedPairAdding(origin, secondRangeFile);
  const record = makeMe.aSessionRecord
    .forExecutionOf(queuedIdentity)
    .closing(first)
    .andClosing(second)
    .sharingCheckout()
    .please();
  trunkAdvancedWith(
    origin,
    sessionRecordPathBeside(defaultBacklogPath, record.sessionId),
    `${JSON.stringify(record)}\n`,
  );
  return trunkAdvancedWith(origin, laterFile);
}

test("Intent shows a published session's two recorded runs and the shared-checkout warning", async ({
  page,
  origin,
}) => {
  await publishDeclaredTrunk(origin, intentTrunkCompletionOntoTip());
  await test.step("Given another machine published a session's two pairs with another writer's work between, the second sharing its checkout, and trunk moved on", () =>
    publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: publishedInTwoRanges(origin),
      repository: "terryyin/open-dough",
      follows: true,
    }));
  const review =
    await test.step("When this machine, with no launch of it, chooses that session in Intent", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      const opened = await openIntentReviewChanges(
        page,
        storyCard(parts(page).recentlyDone, storyTitle),
      );
      await opened.comparison.chooseSession(1);
      return opened;
    });
  await test.step("Then the first run lists only its own file, without a warning", async () => {
    await review.files.expectOnlyChangedFile(`Added ${firstRangeFile}`);
    await review.files.expectTreeLacksText(secondRangeFile, betweenFile);
    await review.context.expectSharedCheckoutWarning(false);
  });
  await test.step("When it chooses the second run", () =>
    review.comparison.choosePublishedRange("Published range 2 of 2"));
  await test.step("Then only the second run's file shows, with the warning", async () => {
    await review.files.expectOnlyChangedFile(`Added ${secondRangeFile}`);
    await review.files.expectTreeLacksText(
      firstRangeFile,
      betweenFile,
      laterFile,
    );
    await review.context.expectSharedCheckoutWarning(true);
  });
});
