// Recently done lists published sessions
// (../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs):
// this machine's own Done launch, whose reporting reference is its record's
// UUID, stands for that record with its native controls
// (../../dashboard/src/recentlyDoneListing.ts), and a session another machine
// published, with no launch here, is reviewed through its published comparison
// after trunk moved on (../../dashboard/src/PublishedSessionEntry.tsx).
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  parts,
  standaloneSessionName,
} from "../../dashboard/test-support/dashboardPage.ts";
import { openReviewChanges } from "../../dashboard/test-support/reviewChangesPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  addedOnBranch,
  publishedPairAdding,
  trunkAdvancedWith,
} from "../../dashboard/test-support/originatingMachine.ts";
import {
  expectEntries,
  listed,
  publishedSessionEntry,
} from "../../dashboard/test-support/recentlyDoneColumn.ts";
import { keepLaunchStore } from "../../dashboard/test-support/support/launchStore.ts";
import { sessionDetailsControl } from "../../dashboard/test-support/support/sessionEntryDisclosure.ts";
import type { StartOrigin } from "../../dashboard/test-support/support/startOrigin.ts";
import { publishSessionClose } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs";
import { defaultBacklogPath } from "../../Distribution/src/skills/dough-execute-plan/scripts/owned-suffix-reconciliation.mjs";
import { sessionRecordPathBeside } from "../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

test.use({ preparationHost: "codex", projectFolders: ["open-dough"] });

const otherSession = "6f1d2c3b-4a5e-4f60-8b7c-9d0e1f2a3b4c";
const ownSession = "3c9e8d7f-1a2b-4c5d-8e6f-7a8b9c0d1e2f";
const otherFile = "published-session-edit.txt";
const ownFile = "originating-edit.txt";
const laterFile = "after-publication.txt";
const title = "Originating session";
const ownEntry = standaloneSessionName("Ad hoc", title);
const minutesAgo = (minutes: number) => Date.now() - minutes * 60_000;

// An ad hoc session closed under `sessionId` whose branch adds `file`.
async function closed(origin: StartOrigin, sessionId: string, file: string) {
  const branch = `land/${sessionId}`;
  const machine = addedOnBranch(origin, branch, file);
  const close = await publishSessionClose({
    workspace: machine.workspace,
    session: { sessionId, workflow: "ad-hoc", story: undefined },
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
const doneLaunch = (sessionId: string, dashboardOrigin: string) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inClaudeSession({ sessionId })
    .reportingThrough({
      origin: dashboardOrigin,
      reference: ownSession,
      command: "node report.mjs",
    })
    .launchedAt(new Date(minutesAgo(60)).toISOString())
    .markedDoneAt(new Date(minutesAgo(30)).toISOString())
    .please();

test("Recently done lists this machine's published session once and reviews another machine's", async ({
  page,
  dashboard,
  origin,
}) => {
  await test.step("Given another machine published an ad hoc session that adds a file", () =>
    closed(origin, otherSession, otherFile));
  await test.step("And this machine published the ad hoc session it launched", () =>
    closed(origin, ownSession, ownFile));
  await test.step("And trunk moves on after both records", async () => {
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: trunkAdvancedWith(origin, laterFile),
      repository: "terryyin/open-dough",
      follows: true,
    });
  });
  await test.step("And this machine keeps its launch Done under its record's UUID", () => {
    const sessionId = listed(dashboard, Date.now(), title, 60 * 60_000);
    keepLaunchStore(dashboard, {
      "open-dough": [doneLaunch(sessionId, dashboard.origin)],
    });
  });
  const recent =
    await test.step("When this machine shows Recently done", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return parts(page).recentlyDone;
    });
  await test.step("Then the other machine's session lists as published, and this machine's as its launch with native controls", async () => {
    await expectEntries(recent, [
      `Published session ${otherSession}`,
      ownEntry,
    ]);
    const own = recent.getByRole("article", { name: ownEntry, exact: true });
    await expect(sessionDetailsControl(own)).toBeVisible();
  });
  const review =
    await test.step("When it opens Review changes on the other machine's session", () =>
      openReviewChanges(page, publishedSessionEntry(recent, otherSession)));
  await test.step("Then the review shows only that session's published file", async () => {
    await review.files.chooseShown(`Added ${otherFile}`);
    await review.files.expectSelected(`Added ${otherFile}`);
    await review.expectNoText(ownFile);
    await review.expectNoText(laterFile);
  });
});

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

test("Recently done reviews each published range of another machine's session", async ({
  page,
  origin,
}) => {
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
    await test.step("When this machine, with no launch of it, opens Review changes on that session", async () => {
      await page.setViewportSize({ width: 1600, height: 900 });
      await page.goto("/");
      return openReviewChanges(
        page,
        publishedSessionEntry(parts(page).recentlyDone, session),
      );
    });
  await test.step("Then the first range shows only its own file", async () => {
    await review.files.chooseShown(`Added ${firstRangeFile}`);
    await review.expectNoText(secondRangeFile);
    await review.expectNoText(betweenFile);
  });
  await test.step("When it selects the second range", () =>
    review.comparison.choosePublishedRange("Published range 2 of 2"));
  await test.step("Then only the second range's file shows", async () => {
    await review.files.chooseShown(`Added ${secondRangeFile}`);
    await review.expectNoText(firstRangeFile);
    await review.expectNoText(betweenFile);
  });
});
