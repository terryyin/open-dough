// The launch boundary honors an unattached request's isolated workspace,
// with a real bare origin (../../dashboard/tests/support/startOrigin.ts), the installed start
// recorded as it runs (../../dashboard/tests/support/startSessionLanding.ts): slug variations
// and collisions belong to ../../dashboard/backend-tests/launches/launch-workspace.spec.ts. A host
// whose installation cannot establish a session offers only the default
// choices in the dialog; Codex's worktree start is
// ../../dashboard/backend-tests/launches/agent-launch-start-session-isolated-codex.spec.ts.
// The dialog's journeys are in ./agent-launch-start-session-isolated.spec.ts.

import { realpathSync } from "node:fs";
import { recordsOf } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
} from "../../dashboard/tests/launchStoryCardPage.ts";
import { expect, test } from "../../dashboard/tests/support/preparationPage.ts";
import {
  openBacklog,
  radio,
} from "../../dashboard/tests/support/sessionDialog.ts";
import {
  withoutSessionFormatter,
  worktrees,
} from "../../dashboard/tests/support/startSessionLanding.ts";

test("a host whose installation cannot establish a session offers only the default choices, and says why", async ({
  page,
  dashboard,
  origin,
}) => {
  withoutSessionFormatter(origin);
  await openBacklog(page, origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  const why = dialog.getByText(
    "Isolated workspace and Automatically land are not offered: the installed skills in this project do not establish a session without a story for this host.",
  );
  await expect(why).toBeVisible();
  await expect(
    dialog.getByRole("group", { name: "Workspace" }),
  ).toHaveAccessibleDescription(await why.innerText());
  for (const [group, name] of [
    ["Workspace", "Isolated workspace"],
    ["After checks", "Automatically land"],
  ] as const)
    await expect(radio(dialog, group, name)).toBeDisabled();
  for (const [group, name] of [
    ["Workspace", "Default main"],
    ["After checks", "Wait for review"],
  ] as const) {
    await expect(radio(dialog, group, name)).toBeEnabled();
    await expect(radio(dialog, group, name)).toBeChecked();
  }

  // The default choices still start, needing nothing of the installation.
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = await recordsOf(dashboard, "open-dough");
  expect(record).not.toHaveProperty("establishedSession");
  expect(dashboard.claudeLaunchCalls()[0]?.cwd).toBe(
    realpathSync(origin.project),
  );
  expect(worktrees(origin.project)).toEqual([]);
});
