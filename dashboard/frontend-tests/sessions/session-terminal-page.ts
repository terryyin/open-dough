import { expect } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cardSession } from "./session-card-page.ts";

const workingQuestion =
  "This session is still working. Marking it done asks it to stop. Mark it done anyway?";

export const terminal = page.getByRole("region", {
  name: "Terminal",
  exact: true,
});
export const terminalStatus = terminal.getByRole("status");
export const terminalMarkDone = terminal
  .getByRole("group", { name: "Session actions" })
  .getByRole("button", { name: "Mark as done", exact: true });
export const terminalInput = terminal.getByRole("textbox");
export const terminalClose = terminal.getByRole("button", {
  name: "Close",
  exact: true,
});
export const terminalMaximize = terminal.getByRole("button", {
  name: "Maximize",
  exact: true,
});
export const terminalRestore = terminal.getByRole("button", {
  name: "Restore",
  exact: true,
});

export async function openCardTerminal(session = cardSession()) {
  await userEvent.click(session.open);
  await expect.element(terminalInput).toHaveFocus();
}

export async function markWorkingTerminalDone() {
  await userEvent.click(terminalMarkDone);
  const question = terminal.getByRole("group", {
    name: workingQuestion,
    exact: true,
  });
  const accept = question.getByRole("button", {
    name: "Mark as done",
    exact: true,
  });
  await expect
    .element(question.getByText(workingQuestion, { exact: true }))
    .toBeVisible();
  await expect
    .element(question.getByRole("button", { name: "Keep open" }))
    .toHaveFocus();
  await expect.element(accept).toBeEnabled();
  await userEvent.click(accept);
}
