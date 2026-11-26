import {
  admittedStory,
  isolatedAdmissionFlags,
} from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
// A definite native refusal after establishment keeps its session start; the
// page offers recovery without native uncertainty and an identical Start
// resumes the same attempt. It drives a real installed start and bare
// origin, with a synthetic host. Continue at the attempt run:
// ../../dashboard/backend-tests/launches/isolated-start-after-establishment.spec.ts.
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../../dashboard/src/launchRecord.ts";
import {
  attempts,
  recordsOf,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { recoveryOf } from "../../dashboard/test-support/responsiveRecovery.ts";
import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { keptSessionStarts } from "../../dashboard/test-support/support/keptSessionStart.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { expectReportingBlock } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import {
  openBacklog,
  originMain,
  radio,
} from "../../dashboard/test-support/support/sessionDialog.ts";
import {
  isolatedSession,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "../../dashboard/test-support/support/startSessionLanding.ts";

const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";
const continueLabel = "Continue session start of Ad hoc session";

// Unlike held-start recovery journeys, native refusal uses the normal start
// wait: establishment must finish before the refusing host is invoked.
test("a failed established session is offered for recovery and the identical Start request resumes it", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  dashboard.claudeScenario("refused");
  await openBacklog(page, origin, true);
  expectServedHomesReach(dashboard.github, defaultRepository, before);
  await startSession(page, "Open Dough").click();
  const dialog = startSessionDialog(page, "Open Dough");
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("failed");
  const [failed] = await attempts(dashboard);
  const id = failed?.id ?? "";
  const retained = `The Taken story was published. The established start was kept in workspace ~/git/open-dough/.worktrees/${slug} on branch claude/${slug}, where Continue or the same Start request can resume it.`;
  await expect(page.locator(".start-session-answer")).toContainText(retained);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(retained);
  await expect(recovery).toContainText(
    "no session was started. Continue resumes the kept start.",
  );
  await expect(recovery).not.toContainText("settled without confirming");
  await expect(recovery).not.toContainText(
    "Check `claude agents` before continuing",
  );
  await expect(
    recovery.getByRole("button", { name: continueLabel }),
  ).toBeEnabled();
  const admitted = await admittedStory(origin, text);
  expect(admitted.revision).not.toBe(before);
  expectServedHomesReach(
    dashboard.github,
    defaultRepository,
    admitted.revision,
  );
  const session = isolatedSession(
    origin.project,
    slug,
    "review",
    admitted.revision,
  );
  expect(keptSessionStarts(origin)[id]?.["session"]).toEqual(session);

  dashboard.claudeScenario("launched");
  await startSession(page, "Open Dough").click();
  await radio(dialog, "Workspace", "Isolated workspace").check();
  await startSessionField(dialog).fill(text);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("launched");
  await expect(recoveryOf(page)).toHaveCount(0);
  const [record] = (await recordsOf(
    dashboard,
    "open-dough",
  )) as LaunchWithState[];
  expect(record?.establishedSession).toEqual(session);
  expect(dashboard.claudeLaunchCalls()).toHaveLength(2);
  const call = dashboard.claudeLaunchCalls().at(-1);
  expect(call?.cwd).toBe(realpathSync(worktree(origin.project, slug)));
  const [block, reporting, ...developer] = (call?.argv.at(-1) ?? "").split(
    "\n\n",
  );
  expect(block).toBe(sessionBlock(session));
  if (record === undefined) throw new Error("Missing launch record.");
  expectReportingBlock(reporting, record.request, dashboard);
  expect(developer).toEqual([`Taken story: ${admitted.identity}`, text]);
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, slug)),
  ]);
  expect(worktrees(origin.project)).toEqual([slug]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id, acceptedAt: failed?.acceptedAt }),
  ]);
  expect(await originMain(origin)).toBe(admitted.revision);
});
