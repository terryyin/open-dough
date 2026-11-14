// A launch the dashboard closed as returned to the backlog reads "Returned to
// backlog" where a Done session reads "Done", under the existing Recently
// done rules: standalone while its story is queued or taken again, and inside
// the done-story card beside the story's later launch once that completes it.
// A later launch keeps its own placement and reading. A native session still
// working keeps its note, and reopening restores the native reading. How the
// dashboard closes it is
// ../../backend-tests/sessions/agent-completion-returned-closure.spec.ts.

import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../dashboardTest.ts";
import { rem } from "../boardPage.ts";
import {
  expectMembership,
  parts,
  sessionEntryShowing,
  sessionStateOf,
  storyCardSessions,
} from "../dashboardPage.ts";
import { describedRevisions } from "../describedRevisions.ts";
import { publishFiles } from "../publishedOrigin.ts";
import { publishMovingFiles } from "../publishedFiles.ts";
import { reloadUntilRead } from "../pageRequestNotes.ts";
import {
  at,
  publishedFiles,
  queuedIdentity,
  queuedTitle,
  repository,
  revision,
  workspaceEntry,
} from "../recentlyDoneRecords.ts";
import { expectEntries, listed, queuedEntry } from "../recentlyDoneColumn.ts";
import { showRecentlyDone } from "../recentlyDoneSessionsSidebarPage.ts";
import { storyCard } from "../storyCardControls.ts";
import { expectSessionsSidebarSessionEntryShown } from "../sessionsSidebarPage.ts";
import { keepLaunchRecords } from "../support/launchStore.ts";
import { idleBetweenSteps, markDoneAnyway } from "../support/markDone.ts";

// Marking done and reopening act in the project's folder.
test.use({ projectFolders: ["open-dough"] });

const hour = 60 * 60 * 1000;
const story = { identity: queuedIdentity, title: queuedTitle };

// The story's first execution, which landed its return to the queue and then
// reported quietly, closed as returned to the backlog at its report.
const returnedLaunch = (now: number, sessionId: string) =>
  makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession({ sessionId })
    .launchedAt(at(now, 5 * hour))
    .completedWith({ message: "", receivedAt: at(now, 4 * hour) })
    .returnedToBacklog()
    .markedDoneAt(at(now, 4 * hour))
    .please();

test("a launch returned to the backlog reads Returned to backlog once in Recently done while its story is queued or taken again, and inside the done-story card beside the later launch that completes it", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const returnedId = listed(dashboard, now, queuedTitle, 5 * hour);
  const laterId = listed(dashboard, now, queuedTitle, 2 * hour);
  // The returned session has finished its native turn.
  dashboard.claudeSessionBecomes(returnedId, "done-live");
  keepLaunchRecords(dashboard, [
    returnedLaunch(now, returnedId),
    // A later execution of the story, still open.
    makeMe.aLaunchRecord
      .executing(story)
      .inClaudeSession({ sessionId: laterId })
      .launchedAt(at(now, 2 * hour))
      .please(),
  ]);
  const published = describedRevisions(
    makeMe.aRepository
      .withRevision("queued", { backlog: { queued: [workspaceEntry] } })
      .withRevision("retaken", { backlog: { taken: [workspaceEntry] } })
      .withRevision("done", {
        backlog: {},
        doneRecords: [
          makeMe.aDoneRecord
            .with({
              ...story,
              completedAt: at(now, hour / 2),
              developer: "Terry Yin",
            })
            .please(),
        ],
      })
      .please(),
    { queued: revision, retaken: "d6".repeat(20), done: "d7".repeat(20) },
  );
  const origin = publishMovingFiles(page, {
    repository,
    ...published.queued,
  });
  await page.goto("/");
  const { board, backlog, taken, recentlyDone: recent } = parts(page);
  const returnedKey = `claude:${returnedId}`;
  const laterKey = `claude:${laterId}`;
  const returned = sessionEntryShowing(recent, returnedKey);

  // The returned launch is one standalone Done entry; the later launch is
  // the active story card's only session, reading its native state.
  const expectApartFrom = async (column: typeof backlog) => {
    await expectEntries(recent, [queuedEntry]);
    await expect(sessionStateOf(returned)).toHaveText("Returned to backlog");
    const inCard = storyCardSessions(storyCard(column, queuedTitle));
    await expect(inCard).toHaveCount(1);
    await expect(inCard).toHaveAttribute("data-shows-session", laterKey);
    await expect(sessionStateOf(inCard)).toHaveText("Working");
    for (const key of [returnedKey, laterKey])
      await expect(sessionEntryShowing(board, key)).toHaveCount(1);
  };

  await test.step("while the story is queued, the returned launch is one standalone Recently done entry and the queued card holds only the later launch", async () => {
    await expectMembership(page, { taken: [], backlog: [queuedTitle] });
    await expectApartFrom(backlog);
  });

  await test.step("when the story is taken again, the later launch sits in its Taken card and the returned launch stays in Recently done", async () => {
    origin.moveTrunk(published.retaken);
    await reloadUntilRead(page);
    await expectMembership(page, { taken: [queuedTitle], backlog: [] });
    await expectApartFrom(taken);
  });

  await test.step("once the later launch completes the story and is marked done, the done-story card holds both: the later reads Done, the earlier Returned to backlog", async () => {
    origin.moveTrunk(published.done);
    await reloadUntilRead(page);
    await expectMembership(page, { taken: [], backlog: [] });
    // Open, the former story's later launch stays in local Taken until marked.
    const later = sessionEntryShowing(taken, laterKey);
    await expect(sessionStateOf(later)).toHaveText("Working");
    idleBetweenSteps(dashboard, laterId);
    await markDoneAnyway(later);
    await expectEntries(recent, [queuedTitle]);
    const inside = storyCardSessions(storyCard(recent, queuedTitle));
    await expect(inside).toHaveCount(2);
    await expect(inside.nth(0)).toHaveAttribute("data-shows-session", laterKey);
    await expect(sessionStateOf(inside.nth(0))).toHaveText("Done");
    await expect(inside.nth(1)).toHaveAttribute(
      "data-shows-session",
      returnedKey,
    );
    await expect(sessionStateOf(inside.nth(1))).toHaveText(
      "Returned to backlog",
    );
    for (const key of [returnedKey, laterKey])
      await expect(sessionEntryShowing(board, key)).toHaveCount(1);
  });
});

test("a returned launch whose native session still works keeps that note wherever it reads Returned to backlog, and reopening it restores its native reading", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  const returnedId = listed(dashboard, now, queuedTitle, 5 * hour);
  keepLaunchRecords(dashboard, [returnedLaunch(now, returnedId)]);
  await publishFiles(page, { repository, revision, files: publishedFiles() });
  await page.setViewportSize({ width: 80 * rem, height: 900 });
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { backlog, recentlyDone: recent } = parts(page);
  const returnedKey = `claude:${returnedId}`;
  const inRecent = sessionEntryShowing(recent, returnedKey);
  const inCard = sessionEntryShowing(backlog, returnedKey);
  const stillWorking = "Returned to backlog: Native session is still working";

  await expect(sessionStateOf(inRecent)).toHaveText(stillWorking);
  await expect(inCard).toHaveCount(0);
  const sidebar = await showRecentlyDone(page);
  await expectSessionsSidebarSessionEntryShown(
    sidebar.row(queuedTitle),
    stillWorking,
    "done",
  );

  await sidebar.open(queuedTitle).click();
  await expect.poll(() => dashboard.claudeAttaches()).toHaveLength(1);
  await expect(sidebar.row(queuedTitle)).toHaveCount(0);
  await expect(inRecent).toHaveCount(0);
  await expect(sessionStateOf(inCard)).toHaveText("Working");
  await reloadUntilRead(page);
  await expect(inRecent).toHaveCount(0);
  await expect(sessionStateOf(inCard)).toHaveText("Working");
});
