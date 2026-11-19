// A mounted case's attached session terminal: its socket answered on the
// provider's page for this case only, the session opened from the Sessions
// sidebar, and its screen read as ../terminalScreenPage.ts reads it.
import { expect, onTestFinished } from "vitest";
import { commands, page } from "vitest/browser";
// The terminal commands' declarations, for `commands`.
import type {} from "../support/mountedTerminalCommands.ts";
import { actSettled, click } from "./mountedActInput.ts";

// Answers this case's terminal socket with an application that prints
// `opening` once attached; `print` prints more while it stays attached.
export async function attachedTerminal(opening: string) {
  await commands.attachTerminal(opening);
  onTestFinished(() => commands.detachTerminal());
  return {
    // Output the page receives settles inside act, as input does.
    print: (output: string) =>
      actSettled(() => commands.printToTerminal(output)),
    attachments: () => commands.terminalAttaches(),
  };
}

export function sessionTerminal() {
  const panel = page.getByRole("region", { name: "Terminal", exact: true });
  // The rows' text, with the renderer's non-breaking spaces as spaces.
  const rowsText = () =>
    (panel.query()?.querySelector(".xterm-rows")?.textContent ?? "").replace(
      /\u00a0/g,
      " ",
    );
  return {
    // Opens the session of this title from the Sessions sidebar.
    open: async (title: string) => {
      await click(page.getByRole("button", { name: "Sessions", exact: true }));
      await click(
        page
          .getByRole("complementary", { name: "Sessions sidebar", exact: true })
          .getByRole("button", { name: title }),
      );
      await expect.element(panel).toBeVisible();
    },
    expectText: async (text: string) => {
      await actSettled(() => expect.poll(rowsText).toContain(text));
    },
    screen: () => {
      const screen = panel.element().querySelector(".xterm-screen");
      if (!screen) throw new Error("The terminal shows no screen.");
      return screen;
    },
  };
}
