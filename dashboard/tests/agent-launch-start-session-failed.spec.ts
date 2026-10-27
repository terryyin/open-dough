// A definite native refusal after establishment keeps its session start.
// The raw launch boundary resumes through Continue; the page offers recovery
// without native uncertainty and an identical Start resumes the same attempt.
// Both drive a real installed start and bare origin, with a synthetic host.
import { realpathSync } from "node:fs";
import type { LaunchWithState } from "../src/launchRecord.ts";
import {
  attempts,
  continued,
  launch,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchStoryCardPage.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import { keptSessionStarts } from "./support/keptSessionStart.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";
import {
  isolatedSession,
  isolatedStart,
  originHeads,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "./support/startSessionLanding.ts";

const request = { source: "open-dough", workflow: "ad-hoc", host: "claude" };
const text = "Tidy the README wording";
const slug = "tidy-the-readme-wording";
const continueLabel = "Continue session start of Ad hoc session";
type Answer = {
  kind: string;
  reason?: string;
  explanation?: string;
  record?: LaunchWithState;
};
const answerOf = async (answer: Promise<{ body: string }>) =>
  JSON.parse((await answer).body) as Answer;

test("a native refusal keeps the established session, and Continue resumes its workspace, landing choice and handoff", async ({
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  const heads = await originHeads(origin);
  const policy = { workspace: "isolated", landing: "auto-land" };
  const session = isolatedSession(
    origin.project,
    "session",
    "auto-land",
    before,
  );
  dashboard.claudeScenario("refused");
  const refused = await answerOf(launch(dashboard, { ...request, policy }));
  expect(refused).toMatchObject({
    kind: "failed",
    reason: "refused",
    sessionStartKept: true,
  });
  expect(refused.explanation).toContain(
    "Nothing was published. The established start was kept in workspace ~/git/open-dough/.worktrees/session on branch claude/session, where Continue or the same Start request can resume it.",
  );
  const [failed] = await attempts(dashboard);
  const id = failed?.id ?? "";
  expect(failed?.publication).toEqual({ kind: "none" });
  expect(keptSessionStarts(origin)[id]?.["session"]).toEqual(session);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);

  dashboard.claudeScenario("launched");
  const launched = await answerOf(continued(dashboard, id));
  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.establishedSession).toEqual(session);
  const calls = dashboard.claudeLaunchCalls();
  expect(calls).toHaveLength(2);
  for (const call of calls) {
    expect(call.cwd).toBe(realpathSync(worktree(origin.project, "session")));
    expect((call.argv.at(-1) ?? "").split("\n\n")[0]).toBe(
      sessionBlock(session),
    );
  }
  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, "session", "auto-land"),
  ]);
  expect(worktrees(origin.project)).toEqual(["session"]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id, acceptedAt: failed?.acceptedAt }),
  ]);
  expect(await originHeads(origin)).toBe(heads);
});

// Unlike held-start recovery journeys, native refusal uses the normal start
// wait: establishment must finish before the refusing host is invoked.
test("a failed established session is offered for recovery and the identical Start request resumes it", async ({
  page,
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  const heads = await originHeads(origin);
  dashboard.claudeScenario("refused");
  await openBacklog(page, origin);
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
  const retained = `Nothing was published. The established start was kept in workspace ~/git/open-dough/.worktrees/${slug} on branch claude/${slug}, where Continue or the same Start request can resume it.`;
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
  const session = isolatedSession(origin.project, slug, "review", before);
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
  expect(developer).toEqual([text]);
  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, slug, "review"),
  ]);
  expect(worktrees(origin.project)).toEqual([slug]);
  expect(keptSessionStarts(origin)).toEqual({});
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({ id, acceptedAt: failed?.acceptedAt }),
  ]);
  expect(await originHeads(origin)).toBe(heads);
});
