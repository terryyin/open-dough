// Mark as done on a session from the scope that offers it: a card or Recent
// sessions entry, a sidebar entry, or a terminal or report panel. A session
// whose intention is complete (its latest report is `completed`, and it reads
// neither working nor waiting) is marked done with `markDone`; any other
// session is marked done with `markDoneAnyway`, the step that will answer the
// question Mark as done asks about it.

import type { Locator } from "@playwright/test";

const markAsDone = (scope: Locator) =>
  scope.getByRole("button", { name: "Mark as done" });

// A session whose intention is complete.
export async function markDone(scope: Locator) {
  await markAsDone(scope).click();
}

// A session Mark as done will ask about.
export async function markDoneAnyway(scope: Locator) {
  await markAsDone(scope).click();
}
