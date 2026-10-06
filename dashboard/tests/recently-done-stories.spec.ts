// Recently done lists the stories done recently, by the done records
// published beside the backlog at the snapshot's revision, among this
// machine's sessions for the project, in one newest-first list: a done story
// by when it was done and a session by when it was launched. A done card
// names its title, completion time, developer, and the agent with its host
// when recorded; a record older than the shared 30-day window is left out. A
// revision with no done records lists the sessions as before; a done-record
// read that fails is said, and each malformed record is named by its file
// with its problem, while the sessions are still listed.
// The fake GitHub only publishes files spelled by the shared done-record
// renderer (./recentlyDoneRecords.ts) and lists their directory; the
// synthetic `claude` (./fixtures/fake-claude) lists the kept sessions. The
// local read boundary, the shared done-record reader, and the page decide
// everything shown. That a done card holds its story's sessions is
// ./recently-done-story-sessions.spec.ts.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { keepLaunchRecords } from "./support/storyLaunchRecord.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import {
  doneRecordFiles,
  executed,
  expired,
  futureFormatFile,
  malformedRevision,
  misnamedFile,
  otherRevision,
  placed,
  publishedFiles,
  queuedTitle,
  removedQueued,
  repository,
  revision,
  unanswered,
  withMalformedRecordFiles,
} from "./recentlyDoneRecords.ts";
import {
  adHocEntry,
  expectEntries,
  sessionsOutsideDoneStories,
} from "./recentlyDoneColumn.ts";

// Keeps this machine's two sessions, listed by the synthetic `claude`.
async function keepSessions(dashboard: DashboardServer, now: number) {
  await keepLaunchRecords(
    dashboard,
    sessionsOutsideDoneStories(dashboard, now, { adHoc: true }),
  );
}

test("Recently done lists published done stories among the sessions, newest first, with each card's facts", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  await keepSessions(dashboard, now);
  const requests = await publishFiles(page, {
    repository,
    revision,
    files: publishedFiles(doneRecordFiles(now)),
  });
  await page.goto("/");
  await expectMembership(page, { taken: [], backlog: [queuedTitle] });
  const { recentlyDone: recent } = parts(page);
  const card = (title: string) =>
    recent.getByRole("article", { name: title, exact: true });

  await test.step("a done story at 10:00 follows an ad hoc session launched at 11:00; the queued story's open session stays on its card", async () => {
    await expectEntries(recent, [
      adHocEntry,
      executed.title,
      removedQueued.title,
    ]);
    await expect(parts(page).backlog.locator(".session-entry")).toHaveCount(1);
  });

  await test.step("a done card names its title, completion time, developer, and agent with host", async () => {
    const done = card(executed.title);
    await expect(done.getByRole("heading", { level: 3 })).toHaveText(
      executed.title,
    );
    await expect(done).toContainText(executed.identity);
    await expect(done.locator(".owner-line")).toHaveText(
      "Yui-chan · Terry Yin · Claude Code",
    );
    await expect(done.locator(".agent-portrait")).toHaveCount(1);
    await expect(done).toContainText("Done");
    expect(
      Date.parse((await done.locator("time").getAttribute("datetime")) ?? ""),
    ).toBe(now - placed.executedDone);
  });

  await test.step("a card whose record names no agent shows its developer and no agent", async () => {
    const done = card(removedQueued.title);
    await expect(done.locator(".owner-line")).toHaveText("Terry Yin");
    await expect(done.locator(".agent-portrait")).toHaveCount(0);
    await expect(done).not.toContainText(/-chan|Claude Code|Codex|Cursor/);
  });

  await test.step("a record completed 31 days before is not shown, and only done records are read", async () => {
    await expect(recent).not.toContainText(expired.title);
    await expect(recent).not.toContainText(/could not be read|unreadable/);
    const read = requests.flatMap(({ request }) =>
      request.kind === "content" && request.path.startsWith(".planning/done/")
        ? [request.path]
        : [],
    );
    expect(read).toHaveLength(3);
    expect(read).not.toContain(".planning/done/README.md");
  });
});

test("a revision with no done records lists the sessions as before, and one whose done records cannot be read, or are malformed, says so and still lists them", async ({
  page,
  dashboard,
}) => {
  const now = Date.now();
  await keepSessions(dashboard, now);
  const { recentlyDone: recent } = parts(page);

  await test.step("no done-record directory: only the sessions, with no error", async () => {
    await publishFiles(page, {
      repository,
      revision,
      files: publishedFiles(),
    });
    await page.goto("/");
    await expectMembership(page, { taken: [], backlog: [queuedTitle] });
    await expectEntries(recent, [adHocEntry]);
    await expect(parts(page).backlog.locator(".session-entry")).toHaveCount(1);
    await expect(recent.locator(".done-story")).toHaveCount(0);
    await expect(recent).not.toContainText(/could not be read|unreadable/);
  });

  await test.step("a done-record read that fails: the column says done stories could not be read and still lists the sessions", async () => {
    await publishFiles(page, {
      repository,
      revision: otherRevision,
      files: publishedFiles(),
      unanswered: [unanswered],
    });
    await page.reload();
    await expectMembership(page, { taken: [], backlog: [queuedTitle] });
    await expect(recent).toContainText("Done stories could not be read.");
    await expectEntries(recent, [adHocEntry]);
    await expect(parts(page).backlog.locator(".session-entry")).toHaveCount(1);
    await expect(recent.locator(".done-story")).toHaveCount(0);
  });

  await test.step("malformed done records beside readable ones: the column names each file with its problem, and still shows the readable cards and the sessions", async () => {
    await publishFiles(page, {
      repository,
      revision: malformedRevision,
      files: publishedFiles(withMalformedRecordFiles(now)),
    });
    await page.reload();
    await expectMembership(page, { taken: [], backlog: [queuedTitle] });
    await expect(
      recent
        .getByRole("list", { name: "Unreadable done records" })
        .getByRole("listitem"),
    ).toHaveText([
      `Done record ${futureFormatFile} is unreadable: done record schemaVersion must be 1.`,
      `Done record ${misnamedFile} is unreadable: done record names another identity.`,
    ]);
    await expectEntries(recent, [
      adHocEntry,
      executed.title,
      removedQueued.title,
    ]);
    await expect(recent).not.toContainText("Done stories could not be read.");
  });
});
