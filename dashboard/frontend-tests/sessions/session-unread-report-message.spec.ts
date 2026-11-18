// A card session entry's message part, against a controlled machine read and
// read boundary (../../test-support/support/frontendSessionActions.ts): expanded with
// Mark as read while its report is unread, beside the entry's own Mark as
// done; a refused mark says so in the entry's status line; marked read, the
// part collapses with the keyboard on its heading and expands again from it.
// A long message scrolls inside the part, with Mark as read and the entry's
// Mark as done in view. An ad-hoc session's report read on its Recently done
// entry and kept read is
// ../../../e2e/sessions/session-unread-report-message.spec.ts.

import type { Page } from "@playwright/test";
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { installFrontendSessionActions } from "../../test-support/support/frontendSessionActions.ts";
import {
  frontendStoryLaunch,
  type FrontendServiceState,
} from "../../test-support/support/frontendServiceState.ts";
import { reportedMessage } from "../../test-support/support/reportedLaunch.ts";
import { sessionAction } from "../../test-support/support/sessionEntryDisclosure.ts";
import {
  buttonsAddedSince,
  expectCollapsed,
  expectExpanded,
  messagePartOf,
  rememberButtons,
  scrollOf,
} from "../../test-support/support/sessionMessagePart.ts";
import { parts } from "../../test-support/dashboardPage.ts";
import { takenStory } from "../../test-support/launchJourney.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../test-support/pageRequestNotes.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const label = "Completed with attention";

// The machine observes the Taken story's execution session, ready for
// review, having reported `message` under `receipt`.
function reported(
  services: FrontendServiceState,
  message: string,
  receipt = "11111111-1111-4111-8111-111111111111",
) {
  services.answerMachine(
    makeMe.aMachineAnswer
      .observing(
        makeMe.anObservedLaunch
          .of(
            frontendStoryLaunch("executing", takenStory)
              .completedWith({ message, receipt })
              .please(),
          )
          .withSessionState(makeMe.aSessionState.loaded("review").please())
          .please(),
      )
      .please(),
  );
}

const takenEntry = (page: Page) =>
  parts(page)
    .taken.getByRole("article", { name: takenStory, exact: true })
    .getByRole("article");

test("a card entry's unread message is marked read in its message part, beside the entry's own Mark as done", async ({
  page,
  frontendServices,
}) => {
  reported(frontendServices, reportedMessage);
  const actions = await installFrontendSessionActions(page, frontendServices);
  await openUntilRead(page);
  const entry = takenEntry(page);
  const message = messagePartOf(entry);

  // Unread: expanded under its completion label, with Mark as read in the
  // part and the entry's own Mark as done beside it.
  await expectExpanded(message, label, reportedMessage);
  const done = await sessionAction(entry, "Mark as done");
  await expect(done).toBeVisible();
  await expect(message.part.locator(done)).toHaveCount(0);
  await expect(entry.getByRole("button", { name: "Mark as read" })).toHaveCount(
    1,
  );

  // A refused read mark leaves the part expanded and says so in the entry's
  // status line.
  actions.refuseNext("read", "The record could not be written.", 500);
  await message.markRead.click();
  await expect(entry.getByRole("status")).toHaveText(
    "The report could not be marked read.",
  );
  await expectExpanded(message, label, reportedMessage);
  await expect(message.markRead).toBeEnabled();

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
  expect(actions.asked("read")).toHaveLength(2);

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

test("a long unread message scrolls inside its message part, with Mark as read and the entry's Mark as done in view", async ({
  page,
  frontendServices,
}) => {
  const lastLine = "Last: confirm the rollback before continuing.";
  const longMessage = [
    ...[...Array(60).keys()].map(
      (at) =>
        `Finding ${at + 1}: the migration left a table the next step reads.`,
    ),
    lastLine,
  ].join("\n");
  reported(frontendServices, longMessage);
  await openUntilRead(page);
  const entry = takenEntry(page);
  const message = messagePartOf(entry);
  const done = await sessionAction(entry, "Mark as done");
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
  reported(
    frontendServices,
    reportedMessage,
    "22222222-2222-4222-8222-222222222222",
  );
  await reloadUntilRead(page);
  await expectExpanded(message, label, reportedMessage);
  const short = await scrollOf(message);
  expect(short.whole).toBeLessThanOrEqual(short.shown);
});
