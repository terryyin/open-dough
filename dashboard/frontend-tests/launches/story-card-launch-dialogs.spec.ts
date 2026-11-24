import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { mountStoryLaunches } from "./story-card-launch-page.ts";

const establishingSentence =
  "Start also publishes this story's Take to the project's trunk on origin and creates a workspace under .worktrees/ in the execution checkout; pressing Start authorizes that push.";

async function inspectAndDismiss(
  action: Locator,
  { name, title, command }: { name: string; title: string; command: string },
) {
  const { dialog, instruction, cancel } = launchDialog(
    `${name} in Claude Code`,
  );
  await action.click();
  await expect.element(dialog.getByText(title, { exact: true })).toBeVisible();
  await expect
    .element(dialog.getByText(command, { exact: true }))
    .toBeInTheDocument();
  await expect
    .element(dialog.getByRole("button", { name: "Attach images" }))
    .toBeVisible();
  await expect.element(instruction).toHaveFocus();
  await instruction.fill("never sent");
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(action).toHaveFocus();

  await action.click();
  await expect.element(instruction).toHaveValue("");
  await instruction.fill("never sent either");
  await cancel.click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(action).toHaveFocus();
}

test("Start execution names the story, host and command, then Escape and Cancel restore the offer without starting", async () => {
  const entry = makeMe.aWorkEntry
    .with({ identity: "SEED-B#b", title: "Execute this story" })
    .please();
  const { execution, refinement, start } = await mountStoryLaunches(entry);
  await expect.element(execution).toBeEnabled();
  await inspectAndDismiss(execution, {
    name: "Start execution",
    title: entry.title,
    command: "/dough-execute-plan SEED-B#b",
  });
  await expect.element(execution).toBeEnabled();
  await expect.element(refinement).toBeEnabled();
  expect(start).not.toHaveBeenCalled();
});

test("Start refinement names the story, host and command, then Escape and Cancel restore the offer without starting", async () => {
  const entry = makeMe.aWorkEntry
    .with({ identity: "SEED-A#a", title: "Refine this story" })
    .please();
  const { execution, refinement, start } = await mountStoryLaunches(entry);
  await expect.element(refinement).toBeEnabled();
  await inspectAndDismiss(refinement, {
    name: "Start refinement",
    title: entry.title,
    command: "/dough-story-refinement SEED-A#a",
  });
  await expect.element(execution).toBeEnabled();
  await expect.element(refinement).toBeEnabled();
  expect(start).not.toHaveBeenCalled();
});

test("only execution on a project whose installed skill establishes a start names the Take and workspace", async () => {
  const entry = makeMe.aWorkEntry
    .with({ identity: "SEED-B#b", title: "Prepare to start this story" })
    .please();
  const { execution, refinement } = await mountStoryLaunches(entry, {
    establishesExecution: true,
  });
  const dialog = launchDialog("Start execution in Claude Code");
  await execution.click();
  await expect
    .element(dialog.dialog.getByText(establishingSentence, { exact: true }))
    .toBeInTheDocument();
  await dialog.cancel.click();

  const other = launchDialog("Start refinement in Claude Code");
  await refinement.click();
  await expect
    .element(other.dialog.getByText(entry.title, { exact: true }))
    .toBeVisible();
  await expect
    .element(other.dialog.getByText(/publishes|\.worktrees\//))
    .not.toBeInTheDocument();
});

test("execution without an establishing skill gives no Take or workspace promise", async () => {
  const entry = makeMe.aWorkEntry
    .with({ identity: "SEED-C#c", title: "Start this story without a Take" })
    .please();
  const { execution } = await mountStoryLaunches(entry);
  const { dialog } = launchDialog("Start execution in Claude Code");
  await execution.click();
  await expect
    .element(dialog.getByText(entry.title, { exact: true }))
    .toBeVisible();
  await expect
    .element(dialog.getByText(/publishes|\.worktrees\//))
    .not.toBeInTheDocument();
});
