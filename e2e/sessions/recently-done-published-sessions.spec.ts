import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  parts,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { openPublishedSessionReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  addedOnBranch,
  launchSharingCheckout,
  publishedPairAdding,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import {
  expectEntries,
  listed,
  publishedSessionOnDoneStory,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { openTerminalControl } from "../../dashboard/test-support/sessionEntryAccess.ts";
import { sessionDetailsControl } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { publishSessionClose } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { defaultBacklogPath } from "../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";
import { publishDeclaredTrunk } from "../../dashboard/test-support/support/storyCiComparisonBaseline.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const otherSession = "6f1d2c3b-4a5e-4f60-8b7c-9d0e1f2a3b4c";
const otherFile = "published-session-edit.txt";
const laterFile = "after-publication.txt";
const title = "Originating session";
const storyTitle = "Story A";
const ownEntry = standaloneSessionName("Ad hoc", title);
const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

// An ad hoc session closed under `sessionId` whose branch adds `file`,
// through its Dashboard launch's `landingContext` when one is given.
async function closed(
  origin: StartOrigin,
  sessionId: string,
  file: string,
  landingContext?: string,
) {
  const branch = `land/${sessionId}`;
  const machine = addedOnBranch(origin, branch, file);
  const close = await publishSessionClose({
    workspace: machine.workspace,
    session: { sessionId, workflow: "ad-hoc", story: queuedIdentity },
    ...(landingContext === undefined ? {} : { landingContext }),
    ...makeMe.anIncrementPublication
      .with({
        branch,
        targetRef: "refs/heads/main",
        previouslyPublishedBase: machine.trunk,
      })
      .please(),
  });
  expect(close.record.status).toBe("published");
}

// This machine's ad hoc launch in the Claude session `sessionId`, Done and
// reporting under its published record's UUID.
const doneLaunch = (
  sessionId: string,
  dashboardOrigin: string,
  published: string,
) =>
  makeMe.aLaunchRecord
    .adHoc({ title, storyIdentity: queuedIdentity })
    .inClaudeSession({ sessionId })
    .reportingThrough({
      origin: dashboardOrigin,
      reference: published,
      command: "node report.mjs",
    })
    .launchedAt(new Date(minutesAgo(60)).toISOString())
    .markedDoneAt(new Date(minutesAgo(30)).toISOString())
    .please();

const firstRangeFile = "first-range.txt";
const secondRangeFile = "second-range.txt";
const betweenFile = "another-writer.txt";

// Another machine's session whose close record names two trunk pairs, one
// adding each range's file, with another writer's commit between them;
// answers its UUID.
function publishedInTwoRanges(origin: StartOrigin) {
  const first = publishedPairAdding(origin, firstRangeFile);
  trunkAdvancedWith(origin, betweenFile);
  const second = publishedPairAdding(origin, secondRangeFile);
  const record = makeMe.aSessionRecord
    .forStory(queuedIdentity)
    .closing(first)
    .andClosing(second)
    .please();
  trunkAdvancedWith(
    origin,
    sessionRecordPathBeside(defaultBacklogPath, record.sessionId),
    `${JSON.stringify(record)}\n`,
  );
  return record.sessionId;
}

test("Recently done reads the same published ranges with and without this machine's launch", async ({
  page,
  dashboard,
  origin,
}) => {
  await publishDeclaredTrunk(origin, intentTrunkCompletionOntoTip());
  const session =
    await test.step("Given another machine published a session's two pairs with another writer's work between them, and its close record", () =>
      publishedInTwoRanges(origin));
  await test.step("And trunk moves on after the record", async () => {
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: trunkAdvancedWith(origin, laterFile),
      repository: "terryyin/open-dough",
      follows: true,
    });
  });
  const review =
    await test.step("When this machine, with no launch of it, opens Review session changes on that session", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return openPublishedSessionReviewChanges(
        page,
        publishedSessionOnDoneStory(
          parts(page).recentlyDone,
          storyTitle,
          session,
        ),
      );
    });
  await test.step("Then Intent shows that session chosen and its first range's own file", async () => {
    await review.expectStory(storyTitle);
    await review.comparison.expectSessionChosen(1);
    await review.files.expectOnlyChangedFile(`Added ${firstRangeFile}`);
    await review.files.expectTreeLacksText(secondRangeFile, betweenFile);
  });
  await test.step("When it selects the second range", () =>
    review.comparison.choosePublishedRange("Published range 2 of 2"));
  await test.step("Then only the second range's file shows", async () => {
    await review.files.expectOnlyChangedFile(`Added ${secondRangeFile}`);
    await review.files.choose(`Added ${secondRangeFile}`);
    await review.diffs.expectLines("added", ["+trunk moved on"]);
    await review.files.expectTreeLacksText(
      firstRangeFile,
      betweenFile,
      laterFile,
    );
  });
  await test.step("The same published session appears once with its local launch and native actions", async () => {
    await review.returnToDevelopment();
    const nativeSession = listed(dashboard, Date.now(), title, 60 * 60_000);
    keepLaunchStore(dashboard, {
      "open-dough": [doneLaunch(nativeSession, dashboard.origin, session)],
    });
    await page.reload();
    await expectEntries(parts(page).recentlyDone, [storyTitle]);
    const card = storyCard(parts(page).recentlyDone, storyTitle);
    const entry = card.getByRole("article", {
      name: ownEntry,
      exact: true,
    });
    await expect(
      publishedSessionOnDoneStory(
        parts(page).recentlyDone,
        storyTitle,
        session,
      ),
    ).toHaveCount(0);
    await expect(sessionDetailsControl(entry)).toBeVisible();
    await expect(openTerminalControl(entry)).toBeVisible();
    const localReview = await openPublishedSessionReviewChanges(page, entry);
    await localReview.comparison.expectSessionChosen(1);
    await localReview.files.expectOnlyChangedFile(`Added ${firstRangeFile}`);
    await localReview.comparison.choosePublishedRange("Published range 2 of 2");
    await localReview.files.expectOnlyChangedFile(`Added ${secondRangeFile}`);
    await localReview.files.choose(`Added ${secondRangeFile}`);
    await localReview.diffs.expectLines("added", ["+trunk moved on"]);
    await localReview.files.expectTreeLacksText(betweenFile, laterFile);
  });
});

const sharedSession = "8a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
const sharedFile = "shared-checkout-edit.txt";

test("Recently done warns that another machine's published session may include a shared checkout's work", async ({
  page,
  origin,
}) => {
  await publishDeclaredTrunk(origin, intentTrunkCompletionOntoTip());
  await test.step("Given another machine closed a session while another session was open in its checkout", async () =>
    closed(
      origin,
      sharedSession,
      sharedFile,
      await launchSharingCheckout(
        origin,
        page,
        sharedSession,
        queuedIdentity,
        new Date(minutesAgo(60)),
      ),
    ));
  await test.step("And it closed another session in a checkout of its own", () =>
    closed(origin, otherSession, otherFile));
  await test.step("And trunk moves on after both records", async () => {
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: trunkAdvancedWith(origin, laterFile),
      repository: "terryyin/open-dough",
      follows: true,
    });
  });
  const recent =
    await test.step("When this machine, with no launch of either, shows Recently done", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return parts(page).recentlyDone;
    });
  await test.step("Then the shared session's review warns that its comparison may include that session's work", async () => {
    const review = await openPublishedSessionReviewChanges(
      page,
      publishedSessionOnDoneStory(recent, storyTitle, sharedSession),
    );
    await review.context.expectSharedCheckoutWarning(true);
    await review.returnToDevelopment();
  });
  await test.step("And the other session's review carries no warning", async () => {
    const review = await openPublishedSessionReviewChanges(
      page,
      publishedSessionOnDoneStory(recent, storyTitle, otherSession),
    );
    await review.files.expectOnlyChangedFile(`Added ${otherFile}`);
    await review.context.expectSharedCheckoutWarning(false);
  });
});
