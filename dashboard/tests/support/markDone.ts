// Mark as done on a session from the scope that offers it: a card or Recently
// done entry, a sidebar entry, or a terminal or report panel. A session whose
// intention is complete (its latest report is `completed`, and it reads
// neither working nor waiting) is marked done with `markDone`; any other
// session is marked done with `markDoneAnyway`, which answers the question
// Mark as done asks about it in place, on an entry or within a panel. A
// question already open is answered with `markDone` on the question itself.
// Either mark waits until the boundary has answered it
// (`untilDoneMarkAnswered`); a journey that holds the answer presses with
// `sendDoneMarkAnyway` instead.

import { expect, type Locator } from "@playwright/test";
import { untilDoneMarkAnswered } from "../pageRequestNotes.ts";
import type { ClaudeListingControls } from "./fakeClaudeListing.ts";

const anyway = "Mark it done anyway?";

// What the question says of a session that reads working.
export const stillWorking =
  "This session is still working. Marking it done asks it to stop.";

// What the question says of a session that reads waiting for input.
export const waitingForInput = "This session is waiting for your input.";

// The Mark as done button in this scope.
export const markAsDone = (scope: Locator) =>
  scope.getByRole("button", { name: "Mark as done" });

// The question Mark as done asks in place before it marks a session whose
// intended work is not known to be complete, by its words.
export const doneQuestion = (scope: Locator) =>
  scope.getByRole("group", { name: anyway });

// Presses Mark as done and expects the question that opens with this
// statement (`expectQuestion`).
export async function expectAsked(scope: Locator, statement: string) {
  await markAsDone(scope).click();
  return expectQuestion(scope, statement);
}

// Expects the open question in this scope to say this statement, announced as
// a group labelled by its whole words, with the keyboard on Keep open.
export async function expectQuestion(scope: Locator, statement: string) {
  const words = `${statement} ${anyway}`;
  const question = scope.getByRole("group", { name: words, exact: true });
  await expect(question).toBeVisible();
  await expect(question.getByRole("paragraph").first()).toHaveText(words);
  await expect(
    question.getByRole("button", { name: "Keep open" }),
  ).toBeFocused();
  await expect(markAsDone(question)).toBeEnabled();
  return question;
}

// Leaves the fake `claude`'s session still working, but idle between steps:
// it still reads Working, so Mark as done still asks about it, yet its prompt
// takes the native rename at once instead of Mark as done waiting out the
// rename wait while the session is busy.
export function idleBetweenSteps(
  claude: Pick<ClaudeListingControls, "claudeSessionBecomes">,
  sessionId: string,
) {
  claude.claudeSessionBecomes(sessionId, "working-idle");
}

// Presses the Mark as done in this scope that sends the mark -- a session's
// own when its intention is complete, or an open question's -- and waits
// until the boundary has answered it and the page has acted on the answer.
export async function markDone(scope: Locator) {
  await markAsDone(scope).click();
  await untilDoneMarkAnswered(scope.page());
}

// Presses Mark as done on a session it asks about and answers the question's
// Mark as done, without waiting for the mark's answer: for a journey that
// holds it.
export async function sendDoneMarkAnyway(scope: Locator) {
  await markAsDone(scope).click();
  const question = doneQuestion(scope);
  await expect(question).toBeVisible();
  await markAsDone(question).click();
}

// A session Mark as done asks about: presses it, answers the question's Mark
// as done, and waits as `markDone` does.
export async function markDoneAnyway(scope: Locator) {
  await sendDoneMarkAnyway(scope);
  await untilDoneMarkAnswered(scope.page());
}
