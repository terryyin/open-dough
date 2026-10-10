// A session entry's message part, on a card or in Recently done: expanded
// with Mark as read while its report is unread, beside the entry's own Mark as
// done; a refused mark says so in the entry's status line; marked read, the
// part collapses with the keyboard on its heading and expands again from it.
// A session without a story card, here an ad-hoc session, is read on its
// Recently done entry. A long message scrolls inside the part, with Mark as
// read and the entry's Mark as done in view. ./session-unread-report.spec.ts
// is the unread report's journey beside the native reading. Real start,
// launch, installed reporting command, store and page; only the synthetic
// `claude` and GitHub are fakes.

import { parts } from "./dashboardPage.ts";
import { expect } from "./dashboardTest.ts";
import {
  launchedAdHoc,
  launchedStory,
  reportedMessage,
} from "./support/reportedLaunch.ts";
import { agentReadEndpoint } from "../src/readMark.ts";
import {
  buttonsAddedSince,
  expectCollapsed,
  expectExpanded,
  messagePartOf,
  rememberButtons,
  scrollOf,
} from "./support/sessionMessagePart.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import {
  newerMessage,
  publishOrigin,
  recordOf,
  takenCard,
  test,
  titleA,
} from "./support/unreadReportPage.ts";
import { openUntilRead, reloadUntilRead } from "./pageRequestNotes.ts";

const label = "Completed with attention";

test("a card entry's unread message is marked read in its message part, beside the entry's own Mark as done", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  await story.report();
  await publishOrigin(page, origin);
  await openUntilRead(page);
  const entry = takenCard(page, titleA).getByRole("article");
  const message = messagePartOf(entry);

  // Unread: expanded under its completion label, with Mark as read in the
  // part and the entry's own Mark as done beside it.
  await expectExpanded(message, label, reportedMessage);
  const done = entry.getByRole("button", { name: "Mark as done" });
  await expect(done).toBeVisible();
  await expect(message.part.locator(done)).toHaveCount(0);
  await expect(entry.getByRole("button", { name: "Mark as read" })).toHaveCount(
    1,
  );

  // A refused read mark leaves the part expanded and says so in the entry's
  // status line.
  await page.route(`**${agentReadEndpoint}`, (route) =>
    route.fulfill({ status: 500 }),
  );
  await message.markRead.click();
  await expect(entry.getByRole("status")).toHaveText(
    "The report could not be marked read.",
  );
  await expectExpanded(message, label, reportedMessage);
  await expect(message.markRead).toBeEnabled();
  await page.unroute(`**${agentReadEndpoint}`);

  // Marked read: the part collapses to its heading, which has the keyboard;
  // the status line clears; Mark as done stays the same control, and no
  // control that marking read brings to the entry marks done or deletes.
  const doneBefore = await done.elementHandle();
  await rememberButtons(entry);
  await message.markRead.click();
  await expectCollapsed(message, label);
  await expect(message.heading).toBeFocused();
  await expect(entry.getByRole("status")).toHaveText("");
  expect(await done.evaluate((now, before) => now === before, doneBefore)).toBe(
    true,
  );
  await expect(entry.getByRole("button", { name: "Mark as read" })).toHaveCount(
    0,
  );
  expect(await buttonsAddedSince(entry)).not.toContainEqual(
    expect.stringMatching(/Mark as done|Delete record/),
  );

  // The read message's heading expands it, with the same text and no Mark
  // as read, and collapses it again, by pointer and by keyboard.
  await message.heading.click();
  await expectExpanded(message, label, reportedMessage);
  await expect(message.markRead).toHaveCount(0);
  await message.heading.click();
  await expectCollapsed(message, label);
  await message.heading.focus();
  await page.keyboard.press("Enter");
  await expectExpanded(message, label, reportedMessage);
  await expect(message.markRead).toHaveCount(0);
  await page.keyboard.press("Space");
  await expectCollapsed(message, label);
});

test("an ad-hoc session's message is read and marked read on its Recently done entry", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const adHoc = await launchedAdHoc(
    dashboard,
    origin,
    "Look into the flaky check.",
  );
  await adHoc.report({ outcome: "unfinished", message: newerMessage });
  await publishOrigin(page, origin);
  await openUntilRead(page);
  const recent = parts(page).taken.locator(".session-entry");
  await expect(recent).toHaveCount(1);
  const message = messagePartOf(recent);
  await expectExpanded(message, "Unfinished work", newerMessage);

  await message.markRead.click();

  await expectCollapsed(message, "Unfinished work");
  await expect(message.heading).toBeFocused();
  await expect(recent.locator(".session-unread-report")).toHaveCount(0);
  await expect(recent.getByRole("status")).toHaveText("");
  const record = await recordOf(dashboard, adHoc.sessionId);
  expect(record?.reportRead).toBe(record?.completion?.receipt);
  expect(record?.doneAt).toBeUndefined();
});

test("a long unread message scrolls inside its message part, with Mark as read and the entry's Mark as done in view", async ({
  page,
  dashboard,
  origin,
}) => {
  test.setTimeout(120_000);
  const lastLine = "Last: confirm the rollback before continuing.";
  const longMessage = [
    ...[...Array(60).keys()].map(
      (at) =>
        `Finding ${at + 1}: the migration left a table the next step reads.`,
    ),
    lastLine,
  ].join("\n");
  expect(longMessage.length).toBeGreaterThan(3_000);
  const story = await launchedStory(dashboard, origin, queuedIdentity, titleA);
  await story.report({ message: longMessage });
  await publishOrigin(page, origin);
  await openUntilRead(page);
  const entry = takenCard(page, titleA).getByRole("article");
  const message = messagePartOf(entry);
  const done = entry.getByRole("button", { name: "Mark as done" });
  await expectExpanded(message, label, longMessage);

  // The text's box is shorter than the message and scrolls; with the entry
  // brought into view, Mark as read and the entry's Mark as done are in view
  // together without scrolling the text.
  await done.scrollIntoViewIfNeeded();
  const before = await scrollOf(message);
  expect(before.whole).toBeGreaterThan(before.shown);
  expect(before.top).toBe(0);
  await expect(message.text).toHaveCSS("overflow-y", "auto");
  await expect(message.markRead).toBeInViewport({ ratio: 1 });
  await expect(done).toBeInViewport({ ratio: 1 });

  // The keyboard reaches the named text and scrolls it to its last line;
  // the controls stay in view.
  await message.text.focus();
  await expect(message.text).toBeFocused();
  // Chromium animates a keyboard scroll and may drop it under load; pressing
  // End again resumes it.
  await expect(async () => {
    await page.keyboard.press("End");
    const after = await scrollOf(message);
    expect(after.top + after.shown).toBeGreaterThanOrEqual(after.whole - 1);
  }).toPass();
  expect(
    await message.text.evaluate((text, last) => {
      const box = text.getBoundingClientRect();
      const range = document.createRange();
      const node = text.lastChild;
      if (node === null) return false;
      range.setStart(node, (node.textContent ?? "").lastIndexOf(last));
      range.setEnd(node, (node.textContent ?? "").length);
      const line = range.getBoundingClientRect();
      return line.top >= box.top && line.bottom <= box.bottom + 1;
    }, lastLine),
  ).toBe(true);
  await expect(message.markRead).toBeInViewport({ ratio: 1 });
  await expect(done).toBeInViewport({ ratio: 1 });

  // A short message, the session's newer report, does not scroll.
  await story.report();
  await reloadUntilRead(page);
  await expectExpanded(message, label, reportedMessage);
  const short = await scrollOf(message);
  expect(short.whole).toBeLessThanOrEqual(short.shown);
});
