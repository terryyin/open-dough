// A working Cursor entry, compact like any session
// (./compact-session-entry.spec.ts), keeps its resume command in Session
// details, selectable, and its copy reports the clipboard's answer
// truthfully: copied, refused, or unavailable. Against a controlled machine
// read and Cursor runner sessions read.

import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../test-support/support/frontendApp.ts";
import { frontendStoryLaunch } from "../../test-support/support/frontendServiceState.ts";
import { fulfillJson } from "../../test-support/support/frontendSubstituteAnswers.ts";
import { sessionDetailsControl } from "../../test-support/support/sessionEntryDisclosure.ts";
import {
  parts,
  sessionStateOf,
  storyCardSessions,
} from "../../test-support/dashboardPage.ts";
import { takenStory } from "../../test-support/launchJourney.ts";
import { openTerminalControl } from "../../test-support/terminalScreenPage.ts";
import { cursorRunnerSessionsEndpoint } from "../../src/cursorRunnerSessions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

test("a working Cursor entry keeps its resume command selectable and reports copied, refused and unavailable clipboard access truthfully", async ({
  page,
  frontendServices,
}) => {
  const sessionId = "12345678-1234-4123-8123-123456789abc";
  const record = frontendStoryLaunch("executing", takenStory)
    .inCursorSession({
      sessionId,
      continuation: { workspace: "/work/open-dough" },
    })
    .requestingModel("auto")
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observingOpen(record).please(),
  );
  // The Cursor runner holds the session, working.
  await page.route(
    (url) => url.pathname === cursorRunnerSessionsEndpoint,
    (route) =>
      fulfillJson(
        route,
        makeMe.aRunningCursorSessions
          .holding({ record, label: "working" })
          .please(),
      ),
  );
  await openFrontendTakenBacklog(page);
  const entry = storyCardSessions(
    parts(page).taken.getByRole("article", { name: takenStory, exact: true }),
  );
  await expect(sessionStateOf(entry)).toHaveText("Working");
  await expect(entry.getByText("Cursor", { exact: true })).toBeVisible();
  await expect(
    entry.getByText("Model: auto (requested)", { exact: true }),
  ).toBeVisible();
  const details = sessionDetailsControl(entry);
  await expect(details).toHaveAttribute("aria-expanded", "false");
  await expect(
    entry.locator("p", { hasText: /^Continue in Cursor:/ }),
  ).toBeHidden();
  await details.click();
  const commandLine = entry.locator("p", { hasText: /^Continue in Cursor:/ });
  // The command quotes each argument for the shell.
  const command = `'cursor-agent' '--workspace' '/work/open-dough' '--resume' '${sessionId}'`;
  await expect(commandLine).toBeVisible();
  await expect(commandLine.locator("code")).toHaveText(command);
  await expect(entry.locator("p", { hasText: /^Workspace / })).toHaveCount(1);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          document.documentElement.dataset["copiedCommand"] = text;
          return Promise.resolve();
        },
      },
    }),
  );
  const copy = entry.getByRole("button", {
    name: "Copy resume command",
    exact: true,
  });
  await copy.click();
  await expect(entry.getByRole("status")).toHaveText("Resume command copied.");
  expect(
    await page.evaluate(
      () => document.documentElement.dataset["copiedCommand"],
    ),
  ).toBe(command);
  const refusal =
    "The resume command could not be copied. Select it in Session details.";
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: () => Promise.reject(new Error("Clipboard access denied")),
      },
    }),
  );
  await copy.click();
  await expect(entry.getByRole("status")).toHaveText(refusal);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    }),
  );
  await copy.click();
  await expect(entry.getByRole("status")).toHaveText(refusal);
  await expect(commandLine.locator("code")).toHaveText(command);
  await details.click();
  await expect(entry.getByRole("status")).toBeVisible();
  await expect(openTerminalControl(entry)).toBeVisible();
});
