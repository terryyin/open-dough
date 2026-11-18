// Recently done lists the stories done recently, by the done records
// published beside the backlog at the snapshot's revision, among this
// machine's sessions for the project, in one newest-first list: a done story
// by when it was done and a session by when it was launched. A done card
// names its title, completion time, developer, and the agent with its host
// when recorded; a record older than the shared 30-day window is left out. A
// revision with no done records lists the sessions as before; a done-record
// read that fails is said, and each malformed record is named by its file
// with its problem, while the sessions are still listed. Which records there
// are, and when each was done, is the done catalog published beside them; a
// catalog that does not describe them is said with its `catalog-done` repair,
// and only the records of the stories shown are read.
// The fake GitHub only publishes the files ../../dashboard/tests/recentlyDoneRecords.ts
// and ../../dashboard/tests/recentlyDoneReadFailures.ts declare and lists their directory; the
// synthetic `claude` (./fixtures/fake-claude) lists the kept sessions. The
// local read boundary, the shared done-record reader, and the page decide
// everything shown. That a done card holds its story's sessions is
// ../../dashboard/frontend-tests/sessions/recently-done-story-sessions.spec.ts.

import { expect, test } from "../../dashboard/tests/dashboardTest.ts";
import { credit } from "../../dashboard/tests/agentCredit.ts";
import {
  columnCountOf,
  expectMembership,
  parts,
  sessionEntriesIn,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  publishFiles,
  type ObservedRequest,
} from "../../dashboard/tests/publishedOrigin.ts";
import { keepLaunchRecords } from "../../dashboard/tests/support/launchStore.ts";
import type { DashboardServer } from "../../dashboard/tests/support/dashboardServer.ts";
import { doneStories } from "../../dashboard/tests/recentlyDoneRecords.ts";
import { doneStoryReadFailures } from "../../dashboard/tests/recentlyDoneReadFailures.ts";
import { hostDescriptions } from "../../dashboard/src/hostDescription.ts";
import {
  adHocEntry,
  expectEntries,
  sessionsOutsideDoneStories,
} from "../../dashboard/tests/recentlyDoneColumn.ts";

// The card's scan line: agent, developer, and the host's name, when recorded.
function recordedCredit(story: {
  readonly agent?: string;
  readonly developer: string;
  readonly host?: keyof typeof hostDescriptions;
}): string {
  return [
    story.agent,
    story.developer,
    story.host === undefined ? undefined : hostDescriptions[story.host].name,
  ]
    .filter((part): part is string => part !== undefined)
    .join(" · ");
}

// The done record files read, apart from their catalog.
function doneRecordsRead(requests: readonly ObservedRequest[]): string[] {
  return requests.flatMap(({ request }) =>
    request.kind === "content" &&
    request.path.startsWith(`${doneStories.doneDirectory}/`) &&
    !request.path.endsWith("/.catalog.json")
      ? [request.path]
      : [],
  );
}

// Keeps this machine's two sessions, listed by the synthetic `claude`.
function keepSessions(dashboard: DashboardServer, now: number) {
  keepLaunchRecords(
    dashboard,
    sessionsOutsideDoneStories(dashboard, now, { adHoc: true }),
  );
}

test("Recently done lists published done stories among the sessions, newest first, with each card's facts", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  keepSessions(dashboard, now);
  const requests = await publishFiles(page, doneStories.published(now));
  await page.goto("/");
  await expectMembership(page, {
    taken: [],
    backlog: [doneStories.queued.title],
  });
  const { recentlyDone: recent } = parts(page);
  const card = (title: string) =>
    recent.getByRole("article", { name: title, exact: true });

  await test.step("a done story at 10:00 follows an ad hoc session launched at 11:00; the queued story's open session stays on its card", async () => {
    await expectEntries(recent, [
      adHocEntry,
      doneStories.executed.title,
      doneStories.removed.title,
    ]);
    await expect(sessionEntriesIn(parts(page).backlog)).toHaveCount(1);
  });

  await test.step("a done card names its title, completion time, developer, and agent with host", async () => {
    const done = card(doneStories.executed.title);
    await expect(done.getByRole("heading", { level: 3 })).toHaveText(
      doneStories.executed.title,
    );
    await expect(done).toContainText(doneStories.executed.identity);
    await expect(credit(done).line).toHaveText(
      recordedCredit(doneStories.executed),
    );
    await expect(credit(done).portrait).toHaveCount(1);
    await expect(done).toContainText("Done");
    expect(
      Date.parse((await done.locator("time").getAttribute("datetime")) ?? ""),
    ).toBe(now - doneStories.executed.completedBefore);
  });

  await test.step("a card whose record names no agent shows its developer and no agent", async () => {
    const done = card(doneStories.removed.title);
    await expect(credit(done).line).toHaveText(
      recordedCredit(doneStories.removed),
    );
    await expect(credit(done).portrait).toHaveCount(0);
    await expect(done).not.toContainText(/-chan|Claude Code|Codex|Cursor/);
  });

  await test.step("a record completed 31 days before is not shown or read: only the done catalog and the shown stories' records are read", async () => {
    await expect(recent).not.toContainText(doneStories.expired.title);
    await expect(recent).not.toContainText(/could not be read|unreadable/);
    const read = requests.flatMap(({ request }) =>
      request.kind === "content" &&
      request.path.startsWith(`${doneStories.doneDirectory}/`)
        ? [request.path]
        : [],
    );
    expect(read.toSorted()).toEqual(
      [
        doneStories.catalogPath,
        doneStories.executed.recordPath,
        doneStories.removed.recordPath,
      ].toSorted(),
    );
  });
});

test("a revision with no done records lists the sessions as before, and one whose done records cannot be read, or are malformed, says so and still lists them", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  keepSessions(dashboard, now);
  const { recentlyDone: recent } = parts(page);

  await test.step("no done-record directory: only the sessions, with no error", async () => {
    await publishFiles(page, doneStories.publishedWithoutRecords());
    await page.goto("/");
    await expectMembership(page, {
      taken: [],
      backlog: [doneStories.queued.title],
    });
    await expectEntries(recent, [adHocEntry]);
    await expect(sessionEntriesIn(parts(page).backlog)).toHaveCount(1);
    await expect(recent.locator(".done-story")).toHaveCount(0);
    await expect(recent).not.toContainText(/could not be read|unreadable/);
  });

  await test.step("a done catalog read that fails: the column says done stories could not be read and still lists the sessions, with its count incomplete", async () => {
    await publishFiles(page, doneStoryReadFailures.unansweredCatalog(now));
    await page.reload();
    await expectMembership(page, {
      taken: [],
      backlog: [doneStories.queued.title],
    });
    await expect(recent).toContainText("Done stories could not be read.");
    await expect(recent).not.toContainText("catalog-done");
    await expectEntries(recent, [adHocEntry]);
    await expect(sessionEntriesIn(parts(page).backlog)).toHaveCount(1);
    await expect(recent.locator(".done-story")).toHaveCount(0);
    await expect(columnCountOf(recent)).toHaveText("Entry count incomplete");
  });

  await test.step("done records published without a catalog: the column names the gap and its repair, reads no record, and still lists the sessions", async () => {
    const requests = await publishFiles(
      page,
      doneStoryReadFailures.withoutCatalog(now),
    );
    await page.reload();
    await expectMembership(page, {
      taken: [],
      backlog: [doneStories.queued.title],
    });
    await expect(recent).toContainText(
      "Done stories could not be read. The done catalog does not describe the published done records: done catalog is not published beside the 3 done records. Run the product backlog's `catalog-done` to rebuild it from the done records, then publish the rebuilt catalog.",
    );
    await expectEntries(recent, [adHocEntry]);
    await expect(columnCountOf(recent)).toHaveText("Entry count incomplete");
    expect(doneRecordsRead(requests)).toEqual([]);
  });

  await test.step("a done record published beside a catalog that does not list it: the column names the stale catalog and the same repair, reads no record, and still lists the sessions", async () => {
    const requests = await publishFiles(
      page,
      doneStoryReadFailures.staleCatalog(now),
    );
    await page.reload();
    await expectMembership(page, {
      taken: [],
      backlog: [doneStories.queued.title],
    });
    await expect(recent).toContainText(
      `Done stories could not be read. The done catalog does not describe the published done records: done catalog does not list done/${doneStories.lastWeek.file}. Run the product backlog's \`catalog-done\` to rebuild it from the done records, then publish the rebuilt catalog.`,
    );
    await expectEntries(recent, [adHocEntry]);
    await expect(recent.locator(".done-story")).toHaveCount(0);
    expect(doneRecordsRead(requests)).toEqual([]);
  });

  await test.step("malformed done records beside readable ones: the column names each file with its problem, and still shows the readable cards and the sessions", async () => {
    await publishFiles(page, doneStoryReadFailures.malformed.published(now));
    await page.reload();
    await expectMembership(page, {
      taken: [],
      backlog: [doneStories.queued.title],
    });
    await expect(
      recent
        .getByRole("list", { name: "Unreadable done records" })
        .getByRole("listitem"),
    ).toHaveText([
      `Done record ${doneStoryReadFailures.malformed.futureFile} is unreadable: done record schemaVersion must be 1.`,
      `Done record ${doneStoryReadFailures.malformed.misnamedFile} is unreadable: done record names another identity.`,
    ]);
    await expectEntries(recent, [
      adHocEntry,
      doneStories.executed.title,
      doneStories.removed.title,
    ]);
    await expect(recent).not.toContainText("Done stories could not be read.");
  });
});
