import { createElement } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { SessionEntry } from "../../src/SessionEntry.tsx";
import { ProjectsOnPage } from "../../src/projectList.tsx";
import { SessionsOnPage } from "../../src/pageSessions.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { inertPageSessions } from "./inert-page-sessions.ts";
import { sessionEntry } from "./session-card-page.ts";

test("a working Cursor entry keeps its resume command selectable and reports copied, refused and unavailable clipboard access truthfully", async () => {
  const sessionId = "12345678-1234-4123-8123-123456789abc";
  const launch = makeMe.aLaunchRecord
    .executing({ identity: "SEED-3", title: "Improve the dashboard" })
    .inCursorSession({
      sessionId,
      continuation: { workspace: "/work/open-dough" },
    })
    .requestingModel("auto")
    .please();
  const machine = makeMe.aMachineAnswer.please();
  const record = makeMe.anObservedLaunch
    .of(launch)
    .withSessionState(makeMe.aSessionState.loaded("working").please())
    .please();
  await mountComponent(
    createElement(ProjectsOnPage, {
      projects: [],
      replaceProjects: () => undefined,
      children: createElement(SessionsOnPage, {
        value: { ...inertPageSessions, hostOperations: machine.hostOperations },
        children: createElement(SessionEntry, { record, onStoryCard: true }),
      }),
    }),
  );
  const session = sessionEntry(
    page.getByRole("article", { name: "Execution session" }),
  );
  await expect.element(session.state).toHaveTextContent("Working");
  await expect
    .element(session.entry.getByText("Cursor", { exact: true }))
    .toBeVisible();
  await expect
    .element(
      session.entry.getByText("Model: auto (requested)", { exact: true }),
    )
    .toBeVisible();
  await expect
    .element(session.details)
    .toHaveAttribute("aria-expanded", "false");
  const commandLine = session.entry.getByText(/^Continue in Cursor:/);
  await expect.element(commandLine).not.toBeVisible();
  await userEvent.click(session.details);

  const command = `'cursor-agent' '--workspace' '/work/open-dough' '--resume' '${sessionId}'`;
  const code = commandLine.getByText(command, { exact: true });
  await expect.element(code).toHaveTextContent(command);
  expect(getComputedStyle(code.element()).userSelect).not.toBe("none");
  await expect.element(session.entry.getByText(/^Workspace /)).toBeVisible();
  expect(session.entry.getByText(/^Workspace /).elements()).toHaveLength(1);

  const keptClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const supplyClipboard = (
    clipboard: Pick<Clipboard, "writeText"> | undefined,
  ) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: clipboard,
    });
  };
  onTestFinished(() => {
    if (keptClipboard === undefined) {
      Reflect.deleteProperty(navigator, "clipboard");
    } else {
      Object.defineProperty(navigator, "clipboard", keptClipboard);
    }
  });
  const writeText = vi
    .fn<Clipboard["writeText"]>()
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new Error("Clipboard access denied"))
    .mockResolvedValueOnce(undefined);
  supplyClipboard({ writeText });
  const copy = session.entry.getByRole("button", {
    name: "Copy resume command",
    exact: true,
  });
  await userEvent.click(copy);
  await expect
    .element(session.status)
    .toHaveTextContent("Resume command copied.");
  expect(writeText).toHaveBeenCalledExactlyOnceWith(command);

  const refusal =
    "The resume command could not be copied. Select it in Session details.";
  await userEvent.click(copy);
  await expect.element(session.status).toHaveTextContent(refusal);
  await userEvent.click(copy);
  await expect
    .element(session.status)
    .toHaveTextContent("Resume command copied.");
  supplyClipboard(undefined);
  await userEvent.click(copy);
  await expect.element(session.status).toHaveTextContent(refusal);
  expect(writeText).toHaveBeenCalledTimes(3);
  await expect.element(code).toHaveTextContent(command);
  await userEvent.click(session.details);
  await expect.element(session.status).toBeVisible();
  await expect.element(session.open).toBeVisible();
});
