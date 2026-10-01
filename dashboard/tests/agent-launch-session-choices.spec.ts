// A story launch dialog's Session group, with the real installed start, a
// real bare origin (./support/startOrigin.ts) the page reads as GitHub would
// (./committedOrigin.ts), and the synthetic `claude`: one-shot is offered
// only for a host whose installation takes the policy, and a kept one-shot
// start shows the policy it was started with instead of choices.

import { parts } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog, radio } from "./support/sessionDialog.ts";

test("one-shot is offered only for a host whose installation takes the policy, and a kept start shows its own", async ({
  page,
  dashboard,
  origin,
}) => {
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Start refinement" }).click();
  let dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await radio(dialog, "Tracking", "One-shot").check();
  // The dialog's name follows its host.
  const start = page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true });
  await expect(start).toBeEnabled();

  // This project installs no Codex skills: one-shot cannot start there.
  await page.getByLabel("Host", { exact: true }).selectOption("codex");
  dialog = page.getByRole("dialog", { name: "Start refinement in Codex" });
  await expect(radio(dialog, "Tracking", "One-shot")).toBeDisabled();
  await expect(
    dialog.getByRole("group", { name: "Tracking" }),
  ).toHaveAccessibleDescription(
    "One-shot is not offered: the installed skills in this project do not start refinement with a session policy for this host.",
  );
  await expect(start).toBeDisabled();
  await radio(dialog, "Tracking", "Standard").check();
  await expect(start).toBeEnabled();

  // Back in Claude Code, a refused session keeps its one-shot start.
  await page.getByLabel("Host", { exact: true }).selectOption("claude");
  dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(radio(dialog, "Tracking", "One-shot")).toBeEnabled();
  await radio(dialog, "Tracking", "One-shot").check();
  dashboard.claudeScenario("refused");
  await start.click();
  await expect(card.locator(".launch-problem")).toContainText(
    "No session started; nothing was published.",
  );
  await page.reload();
  const reloaded = parts(page).backlog.getByRole("article", {
    name: "Story A",
  });
  await expect(reloaded).toContainText("Started here, no session yet");
  await reloaded.getByRole("button", { name: "Start refinement" }).click();
  await expect(dialog.getByRole("group", { name: "Session" })).toContainText(
    "Isolated workspace · One-shot · Wait for review, as this kept start was started.",
  );
  await expect(dialog.getByRole("radio")).toHaveCount(0);
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toHaveAccessibleDescription(
    "Isolated workspace · One-shot · Wait for review No assignment is published; the recorded refinement waits for review and nothing is pushed.",
  );
  await expect(
    dialog.getByText(
      "The session runs in workspace ~/git/open-dough/.worktrees/story-a.",
    ),
  ).toBeAttached();
});
