import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { StartSession } from "../../src/StartSession.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  adHocLaunches,
  launchDialog,
  startSession,
} from "./ad-hoc-launch-page.ts";

test("Start session names the project and host, focuses an empty instruction, and Escape and Cancel return focus without sending", async () => {
  const project = makeMe.aPublishedSource.openDough.please();
  const launches = adHocLaunches();
  await mountComponent(
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches,
      presentTerminal: vi.fn(),
    }),
  );
  const button = startSession(project.label);
  const form = launchDialog("Start a session in Open Dough in Claude Code");

  await button.click();
  await expect
    .poll(() => form.dialog.element().textContent)
    .toContain(
      "Claude Code starts a background session on this machine, in this project's folder, with no story or skill.",
    );
  await expect.element(form.instruction).toHaveFocus();
  await expect.element(form.instruction).toHaveValue("");
  await expect.element(form.start).toBeEnabled();
  await form.instruction.fill("never sent");
  await userEvent.keyboard("{Escape}");
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(button).toHaveFocus();
  expect(launches.startAdHoc).not.toHaveBeenCalled();

  await button.click();
  await expect.element(form.instruction).toHaveValue("");
  await form.cancel.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(button).toHaveFocus();
  expect(launches.startAdHoc).not.toHaveBeenCalled();
});

test("an instructed Start session sends the draft, hands focus to progress, and restores the launcher after startup", async () => {
  const project = makeMe.aPublishedSource.openDough.please();
  const launches = adHocLaunches();
  const view = () =>
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches,
      presentTerminal: vi.fn(),
    });
  const { rerender } = await mountComponent(view());
  const button = startSession(project.label);
  const form = launchDialog("Start a session in Open Dough in Claude Code");
  const instruction = "summarize the open issues";

  launches.startAdHoc.mockImplementation(() => {
    launches.adHocAttemptOf.mockReturnValue({ kind: "starting" });
    rerender(view());
    return Promise.resolve(true);
  });
  await button.click();
  await form.instruction.fill(instruction);
  await form.start.click();
  const progress = page.getByText(
    "Starting a session in Open Dough… Local startup in progress.",
  );
  await expect.element(progress).toHaveFocus();
  await expect.element(button).toBeDisabled();
  expect(launches.startAdHoc).toHaveBeenCalledExactlyOnceWith(
    project.id,
    expect.objectContaining({ instruction, host: "claude" }),
    expect.any(Function),
    undefined,
  );

  launches.adHocAttemptOf.mockReturnValue(undefined);
  rerender(view());
  await expect.element(button).toHaveFocus();
  await expect.element(progress).not.toBeInTheDocument();
});

test("Enter on the launcher right after Cancel reopens the launch dialog", async () => {
  const project = makeMe.aPublishedSource.openDough.please();
  await mountComponent(
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches: adHocLaunches(),
      presentTerminal: vi.fn(),
    }),
  );
  const button = startSession(project.label);
  const form = launchDialog("Start a session in Open Dough in Claude Code");
  await button.click();
  await expect.element(form.instruction).toHaveFocus();

  // Cancel closes the dialog at once and the keyboard is back on the
  // launcher before the browser delivers the dialog's close event; Enter
  // arrives in that gap.
  form.cancel
    .element()
    .dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(document.activeElement).toBe(button.element());
  button
    .element()
    .dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

  await expect.element(form.instruction).toHaveFocus();
  await expect.element(form.dialog).toBeVisible();
});
