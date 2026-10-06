// Mark as done on a session from the scope that offers it: a card or Recently
// done entry, a sidebar entry, or a terminal or report panel. A session whose
// intention is complete (its latest report is `completed`, and it reads
// neither working nor waiting) is marked done with `markDone`; any other
// session is marked done with `markDoneAnyway`, which answers the question
// Mark as done asks about it in place, on an entry or within a panel.

import { expect, type Locator } from "@playwright/test";

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

// A session whose intention is complete.
export async function markDone(scope: Locator) {
  await markAsDone(scope).click();
}

// A session Mark as done asks about: presses it, then answers the question's
// Mark as done.
export async function markDoneAnyway(scope: Locator) {
  await markAsDone(scope).click();
  const question = doneQuestion(scope);
  await expect(question).toBeVisible();
  await markAsDone(question).click();
}
