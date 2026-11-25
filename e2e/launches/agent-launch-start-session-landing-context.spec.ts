// An isolated Start session keeps the admitted story in its landing context.
// With a real bare origin, the installed start and publication scripts, and
// synthetic Claude, the first message names `--landing-context <file>`. The
// file binds the launch and story to its remote and trunk target. The publisher
// prepares the comparison before push and the launch keeps the accepted pair
// under that story. Default-main handoff belongs to the automatic-landing page
// journey; shared capture variations belong to the one-shot landing suite. Which
// launches a landing is captured for, and the installed delivery command,
// are in ../../dashboard/backend-tests/launches/agent-launch-start-session-landing-admission.spec.ts.

import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  openBacklog,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  expectCapturedLanding,
  expectLandingHandoff,
} from "../../dashboard/test-support/support/startSessionLandingCapture.ts";
import { worktree } from "../../dashboard/test-support/support/startSessionLanding.ts";

test("Isolated workspace · Automatically land carries its landing context and captures a landing from its admitted worktree", async ({
  page,
  dashboard,
  origin,
}) => {
  await openBacklog(page, origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await radio(dialog, "After checks", "Automatically land").check();
  await startSessionField(dialog).fill("Session");
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  if (record === undefined) throw new Error("Missing launch record.");
  expect(record.request).toMatchObject({
    instruction: "Session",
    storyIdentity: expect.any(String),
  });

  const { session } = expectLandingHandoff(
    record,
    dashboard.claudeLaunches()[0]?.instruction ?? "",
    dashboard,
    origin.project,
    [
      `Taken story: ${"storyIdentity" in record.request ? record.request.storyIdentity : ""}`,
      "Session",
    ],
  );
  expect(session).toMatchObject({
    workspace: worktree(origin.project, "session"),
    role: "isolated",
    branch: "claude/session",
    landing: "auto-land",
  });
  await expectCapturedLanding(dashboard, origin, record, "isolated.txt");
});
