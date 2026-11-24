import { expect, onTestFinished } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { tapWhereShown } from "../navigation/board-touch-page.ts";
import { terminal } from "../sessions/session-terminal-page.ts";

export const actions = terminal.getByRole("group", { name: "Session actions" });
export const dictate = actions.getByRole("button", {
  name: "Dictate into terminal",
});
export const prompts = actions.getByRole("button", {
  name: "Prompts",
  exact: true,
});
export const promptMenu = terminal.getByRole("menu", {
  name: "Prompts",
  exact: true,
});
export const promptItem = (phrase: string) =>
  promptMenu.getByRole("menuitem", { name: phrase, exact: true });
export const openAgain = terminal.getByRole("button", {
  name: "Open again",
  exact: true,
});
export const reconnect = terminal.getByRole("button", {
  name: "Reconnect",
  exact: true,
});

export async function tapTerminalControl(control: Locator) {
  await expect.element(control).toBeVisible();
  await tapWhereShown(control.element());
}

export async function tapTerminalScreen() {
  const screen = terminal.element().querySelector(".xterm-screen");
  if (!screen) throw new Error("The terminal has no screen.");
  await tapWhereShown(screen);
}

export async function choosePrompt(
  phrase: string,
  press: (control: Locator) => Promise<void> = (control) =>
    userEvent.click(control),
) {
  await press(prompts);
  await press(promptItem(phrase));
}

export function unfocusedPromptButtons() {
  const onMouseDown = (event: MouseEvent) => {
    if (
      !event.defaultPrevented &&
      event.target instanceof Element &&
      event.target.closest('[role="menuitem"]') &&
      document.activeElement instanceof HTMLElement
    ) {
      // Model the pointer default that clears focus before the click.
      event.preventDefault();
      document.activeElement.blur();
    }
  };
  document.addEventListener("mousedown", onMouseDown);
  onTestFinished(() => {
    document.removeEventListener("mousedown", onMouseDown);
  });
}
