import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { MachineReadSource } from "../../src/machineReadSource.ts";
import {
  mountSessionCards,
  readyStory,
  revealPage,
  sessionsReading,
} from "./session-card-mount.ts";
import { cardSession } from "./session-card-page.ts";

const reportedMessage = "Published. Reminder: check the migration.";
const label = "Completed with attention";

function reported(message: string, receipt: string, read = false) {
  const launch = makeMe.aLaunchRecord
    .executing(readyStory)
    .completedWith({ message, receipt });
  return makeMe.anObservedLaunch
    .of((read ? launch.withReportRead() : launch).please())
    .withSessionState(makeMe.aSessionState.loaded("review").please())
    .please();
}

const entry = cardSession();
const heading = entry.entry.getByRole("button", { name: label, exact: true });
const text = entry.entry.getByRole("region", { name: "Attention message" });
const markRead = entry.entry.getByRole("button", {
  name: "Mark as read",
  exact: true,
});

async function showsMessage(message: string) {
  await expect.element(heading).toHaveAccessibleName(label);
  await expect.element(heading).toHaveAttribute("aria-expanded", "true");
  await expect.element(text).toBeVisible();
  await expect.poll(() => text.element().textContent).toBe(message);
}

async function hidesMessage() {
  await expect.element(heading).toHaveAccessibleName(label);
  await expect.element(heading).toHaveAttribute("aria-expanded", "false");
  await expect.element(text).not.toBeInTheDocument();
  await expect.element(markRead).not.toBeInTheDocument();
}

function buttonsByName() {
  return new Map(
    [...entry.entry.element().querySelectorAll("button")].map((button) => [
      button,
      button.getAttribute("aria-label") ?? button.textContent,
    ]),
  );
}

test("a card entry's unread message is marked read in its message part, beside the entry's own Mark as done", async () => {
  const receipt = "11111111-1111-4111-8111-111111111111";
  const record = reported(reportedMessage, receipt);
  const read = vi
    .fn<MachineReadSource["markRead"]>()
    .mockResolvedValueOnce(undefined)
    .mockResolvedValueOnce(reported(reportedMessage, receipt, true));
  await mountSessionCards({
    reading: sessionsReading("unread", record),
    markRead: read,
  });
  await showsMessage(reportedMessage);

  await userEvent.click(entry.actions);
  await expect.element(entry.done).toBeVisible();
  const part = heading.element().closest(".session-attention-message");
  expect(part?.contains(markRead.element())).toBe(true);
  expect(part?.contains(entry.done.element())).toBe(false);
  expect(markRead.all()).toHaveLength(1);

  await userEvent.click(markRead);
  await expect
    .element(entry.status)
    .toHaveTextContent("The report could not be marked read.");
  await showsMessage(reportedMessage);
  await expect.element(markRead).toBeEnabled();

  const doneBefore = entry.done.element();
  const buttonsBefore = buttonsByName();
  await userEvent.click(markRead);
  await hidesMessage();
  await expect.element(heading).toHaveFocus();
  await expect.element(entry.status).toBeEmptyDOMElement();
  expect(entry.done.element()).toBe(doneBefore);
  const newNames = [...buttonsByName()].filter(
    ([button, name]) => buttonsBefore.get(button) !== name,
  );
  expect(newNames.map(([, name]) => name)).not.toContainEqual(
    expect.stringMatching(/Mark as done|Delete record/),
  );
  expect(read.mock.calls.map(([asked]) => asked.session.sessionId)).toEqual([
    record.session.sessionId,
    record.session.sessionId,
  ]);

  await userEvent.click(heading);
  await showsMessage(reportedMessage);
  await expect.element(markRead).not.toBeInTheDocument();
  await userEvent.click(heading);
  await hidesMessage();
  await userEvent.keyboard("{Enter}");
  await showsMessage(reportedMessage);
  await expect.element(markRead).not.toBeInTheDocument();
  await userEvent.keyboard(" ");
  await hidesMessage();
});

function scrollOfMessage() {
  const element = text.element();
  return {
    shown: element.clientHeight,
    whole: element.scrollHeight,
    top: element.scrollTop,
  };
}

function lastMessageLineFits(lastLine: string) {
  const element = text.element();
  const line = element.lastChild;
  const start = line?.textContent?.lastIndexOf(lastLine) ?? -1;
  if (line === null || start < 0) return false;
  const range = document.createRange();
  range.setStart(line, start);
  range.setEnd(line, start + lastLine.length);
  const box = element.getBoundingClientRect();
  const words = range.getBoundingClientRect();
  return words.top >= box.top && words.bottom <= box.bottom + 1;
}

async function expectBothActionsInView() {
  await expect.element(markRead).toBeInViewport({ ratio: 1 });
  await expect.element(entry.done).toBeInViewport({ ratio: 1 });
}

test("a long unread message scrolls inside its message part, with Mark as read and the entry's Mark as done in view", async () => {
  const last = "Last: confirm the rollback before continuing.";
  const long = [
    ...Array.from(
      new Array<undefined>(60).keys(),
      (index) =>
        `Finding ${index + 1}: the migration left a table the next step reads.`,
    ),
    last,
  ].join("\n");
  const machine = await mountSessionCards({
    reading: sessionsReading(
      "long report",
      reported(long, "11111111-1111-4111-8111-111111111111"),
    ),
  });
  await showsMessage(long);
  await userEvent.click(entry.actions);
  const done = entry.done.element();
  done.scrollIntoView({ block: "nearest" });
  const before = scrollOfMessage();
  expect(before.whole).toBeGreaterThan(before.shown);
  expect(before.top).toBe(0);
  expect(getComputedStyle(text.element()).overflowY).toBe("auto");
  await expectBothActionsInView();

  const body = text.element();
  if (!(body instanceof HTMLElement))
    throw new Error("The message cannot take the keyboard.");
  body.focus();
  await expect.element(text).toHaveFocus();
  await userEvent.keyboard("{End}");
  await expect
    .poll(() => {
      const after = scrollOfMessage();
      return after.top + after.shown >= after.whole - 1;
    })
    .toBe(true);
  expect(lastMessageLineFits(last)).toBe(true);
  await expectBothActionsInView();

  const reveal = revealPage();
  machine.answerWith(
    sessionsReading(
      "short report",
      reported(reportedMessage, "22222222-2222-4222-8222-222222222222"),
    ),
  );
  reveal();
  await showsMessage(reportedMessage);
  const short = scrollOfMessage();
  expect(short.whole).toBeLessThanOrEqual(short.shown);
});
