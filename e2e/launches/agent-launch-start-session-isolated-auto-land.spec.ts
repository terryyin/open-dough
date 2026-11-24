// Isolated workspace · Automatically land admits its Taken story and starts
// at once with no text, leaving existing changes in the execution checkout
// untouched.
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../dashboard/src/launchRecord.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  dirty,
  existingChangesHeading as heading,
  status,
} from "../../dashboard/test-support/support/executionCheckoutChanges.ts";
import {
  admittedStory,
  isolatedAdmissionFlags,
} from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  openBacklog,
  originMain,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  established,
  isolatedSession,
  recordStarts,
  worktree,
} from "../../dashboard/test-support/support/startSessionLanding.ts";

const inNew = "The session runs in a new workspace under .worktrees/";

test("with existing changes in the execution checkout, Isolated workspace · Automatically land starts at once with no text, in `.worktrees/session`, and leaves the changes untouched", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  await openBacklog(page, origin, true);
  const before = await originMain(origin);
  dirty(origin.project);
  const changes = status(origin.project);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await radio(dialog, "After checks", "Automatically land").check();
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await expect(start).toHaveAccessibleDescription(
    `Isolated workspace · Automatically land Start publishes a Taken story before the session opens. ${inNew}; verified results land on origin without another review. Pressing Start authorizes that push.`,
  );

  dashboard.claudeScenario("launched");
  await start.click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: heading })).toHaveCount(0);
  await expect
    .poll(() => recordsOf(dashboard, "open-dough"), { timeout: launchWaitMs })
    .toHaveLength(1);
  const [record] = (await recordsOf(
    dashboard,
    "open-dough",
  )) as LaunchWithState[];
  if (record === undefined) throw new Error("Missing launch record.");

  const admitted = await admittedStory(origin, record.request.title);
  expect(record.request.title).toMatch(/^Ad hoc work — /);
  expect(admitted.revision).not.toBe(before);
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session")),
  ]);
  expect(established(origin.project, "session")).toEqual({
    branch: "claude/session",
    revision: admitted.revision,
  });
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    admitted.revision,
  );
  expect(record.establishedSession).toEqual(session);
  expect(record.request).toMatchObject({
    policy: { workspace: "isolated", landing: "auto-land" },
  });
  expect(record.request).not.toHaveProperty("instruction");
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, "session")));
  expect(call?.argv.at(-1)).not.toContain("Established session");
  expect(record.request).toMatchObject({ storyIdentity: admitted.identity });

  expect(status(origin.project)).toBe(changes);
  expect(status(worktree(origin.project, "session"))).toBe("");
  expect(await originMain(origin)).toBe(admitted.revision);
});
