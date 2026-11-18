// A session entry's two independent disclosures and the lifecycle actions they
// reveal. Scope may also be a panel or an already-open question, whose existing
// direct controls need no disclosure.
import type { Locator } from "@playwright/test";

// The disclosure controls themselves, for a journey whose input or focus on
// them is under proof.
export const sessionActionsControl = (scope: Locator) =>
  scope.getByRole("button", { name: "More session actions", exact: true });
export const sessionDetailsControl = (scope: Locator) =>
  scope.getByRole("button", { name: "Session details", exact: true });

async function disclose(scope: Locator, control: Locator): Promise<Locator> {
  await scope.waitFor({ state: "attached" });
  if (
    (await control.count()) === 1 &&
    (await control.getAttribute("aria-expanded")) === "false"
  ) {
    // Keyboard focus also reveals a paged-out Board column before its control
    // is pressed, as the dashboard's normal cross-column keyboard route does.
    await control.focus();
    await control.click();
  }
  return scope;
}

export const sessionActions = (scope: Locator) =>
  disclose(scope, sessionActionsControl(scope));
export const sessionDetails = (scope: Locator) =>
  disclose(scope, sessionDetailsControl(scope));

// Collapse Session details when the disclosure is expanded. Opening stays on
// sessionDetails so callers keep a single open/close pair.
export async function closeSessionDetails(scope: Locator): Promise<Locator> {
  await scope.waitFor({ state: "attached" });
  const control = sessionDetailsControl(scope);
  if (
    (await control.count()) === 1 &&
    (await control.getAttribute("aria-expanded")) === "true"
  ) {
    await control.click();
  }
  return scope;
}

// The named lifecycle control after its entry disclosure is opened. A panel or
// in-place question already offering the control follows the same route.
export async function sessionAction(
  scope: Locator,
  name: string,
): Promise<Locator> {
  return (await sessionActions(scope)).getByRole("button", {
    name,
    exact: true,
  });
}

// The question Delete record… asks in place on an entry, a group named by its
// words, with its confirming and keeping answers. The caller states the words
// it expects the question to say.
export function deleteRecordQuestion(entry: Locator) {
  const question = entry.getByRole("group", {
    name: /^Delete this session's dashboard record\?/,
  });
  return {
    question,
    confirm: question.getByRole("button", {
      name: "Delete record",
      exact: true,
    }),
    keep: question.getByRole("button", { name: "Keep", exact: true }),
  };
}

// Presses the entry's Delete record…, opening its actions first, and returns
// the question it asks; answering it stays the caller's separate step.
export async function askToDeleteRecord(entry: Locator) {
  await (await sessionAction(entry, "Delete record…")).click();
  return deleteRecordQuestion(entry);
}
