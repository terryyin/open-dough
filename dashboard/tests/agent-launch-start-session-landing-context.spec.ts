// An unattached Start session that establishes a session is handed its
// launch's landing context, as a story launch is, and a landing made from
// its workspace is captured for that launch with no story identity. With a
// real bare origin (./support/startOrigin.ts), the installed start and
// publication scripts, and the synthetic `claude`: the reporting context in
// the first message names `--landing-context <file>`; that file names the
// launch, its remote and trunk target and no identity; the installed shared
// publication, as Dough Land runs it, given that file, prepares the
// comparison before its push and records the accepted one, which the launch
// record keeps. Default-main handoff belongs to the automatic-landing page
// journey; shared capture variations belong to the one-shot landing suite. Which
// launches a landing is captured for, and the installed delivery command,
// are in ./boundary/agent-launch-start-session-landing-admission.spec.ts.

import type { LaunchRecord } from "../src/launchRecord.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import { startSession, startSessionDialog } from "./launchStoryCardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog, radio } from "./support/sessionDialog.ts";
import {
  expectCapturedLanding,
  expectLandingHandoff,
} from "./support/startSessionLandingCapture.ts";
import { worktree } from "./support/startSessionLanding.ts";

test("Isolated workspace · Automatically land with no text hands the session its landing context, and a landing from its worktree is captured for the launch with no story", async ({
  page,
  dashboard,
  origin,
}) => {
  await openBacklog(page, origin);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await radio(dialog, "After checks", "Automatically land").check();
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  if (record === undefined) throw new Error("Missing launch record.");
  expect(record.request).not.toHaveProperty("instruction");

  const { session } = expectLandingHandoff(
    record,
    dashboard.claudeLaunchCalls()[0]?.argv.at(-1) ?? "",
    dashboard,
    origin.project,
  );
  expect(session).toMatchObject({
    workspace: worktree(origin.project, "session"),
    role: "isolated",
    branch: "claude/session",
    landing: "auto-land",
  });
  await expectCapturedLanding(dashboard, origin, record, "isolated.txt");
});
