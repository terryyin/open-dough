// An unresolved ad hoc launch is recovered outside every card
// (../../dashboard/src/StartupRecovery.tsx): a blank Codex session whose persistence the
// native connection left unconfirmed is listed under Startup recovery as the
// project's ad hoc session, with no card or story made for it and no card
// protected. Continuing it from the page runs that same attempt under the
// existing blank-intent recovery: the recorded conversation is confirmed
// without any input submitted.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchAttemptRecord } from "../../dashboard/src/agentLaunch.ts";
import {
  attempts,
  continueAttempt,
  launch,
} from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  expectSettledPage,
  parts,
  sessionEntriesIn,
} from "../../dashboard/test-support/dashboardPage.ts";
import { recoveryOf } from "../../dashboard/test-support/responsiveRecovery.ts";
import {
  expect,
  stored,
  test,
} from "../../dashboard/test-support/support/codexLaunch.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { openInstalledStoryBoard } from "../../dashboard/test-support/installedStoryCardPage.ts";
import { catalogOrigin } from "../../dashboard/test-support/support/catalogProjectOrigin.ts";

const request = makeMe.aLaunchRequest.adHoc({ host: "codex" }).please();
test.use({ projectFolders: ["open-dough"] });

test("an admitted blank session with unconfirmed native persistence is recovered without input", async ({
  page,
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  native.beforeRead = (includeTurns) => {
    if (includeTurns) native.failConnection();
  };
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "uncertain",
  });
  const [uncertain] = await attempts(dashboard);
  expect(stored(dashboard.home)[0]?.firstInput).toEqual({
    state: "awaiting",
    intent: "blank",
  });

  await openInstalledStoryBoard(page, catalogOrigin(dashboard.home));
  await expectSettledPage(page);
  const { board } = parts(page);
  const cards = board.locator("[data-story-card]");
  const storyCards = await cards.count();
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Codex",
  );
  await expect(recovery).toContainText("Startup needs reconciliation");
  const nativeAdvice =
    "Check the dashboard history and native Codex conversations before continuing; a recorded conversation is resumed, never submitted again.";
  await expect(recovery.locator('[id$="-check"]')).toHaveText(nativeAdvice);
  await expect(
    recovery.getByRole("button", {
      name: "Continue session start of Ad hoc session",
    }),
  ).toHaveAccessibleDescription(nativeAdvice);
  await expect(
    recovery.getByRole("button", { name: "Recheck Ad hoc session" }),
  ).toBeEnabled();
  await expect(cards).toHaveCount(storyCards);
  await expect(board).not.toContainText("Startup needs reconciliation");
  const storedRequest = stored(dashboard.home)[0]?.request;
  if (
    storedRequest?.workflow !== "ad-hoc" ||
    storedRequest.storyIdentity === undefined
  )
    throw new Error("Missing admitted story membership.");
  const session = stored(dashboard.home)[0]?.session.sessionId;
  expect(session).toBeDefined();
  const entry = sessionEntriesIn(
    parts(page).taken.getByRole("article", {
      name: storedRequest.title,
      exact: true,
    }),
  );
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText(`Session ${String(session)}`);
  await expect(sessionEntriesIn(parts(page).recentlyDone)).toHaveCount(0);

  delete native.beforeRead;
  await recovery
    .getByRole("button", { name: "Continue session start of Ad hoc session" })
    .click();
  await expect(recoveryOf(page)).toHaveCount(0, { timeout: 30_000 });
  // The item leaves once the attempt runs again, before it settles.
  await expect
    .poll(async () => (await attempts(dashboard))[0]?.outcome?.kind, {
      timeout: 30_000,
    })
    .toBe("launched");
  expect(await attempts(dashboard)).toEqual([
    expect.objectContaining({
      id: uncertain?.id,
      acceptedAt: uncertain?.acceptedAt,
      request,
      outcome: expect.objectContaining({ kind: "launched" }),
    }),
  ]);
  expect(stored(dashboard.home)).toHaveLength(1);
  expect(stored(dashboard.home)[0]?.session.sessionId).toBe(session);
  await expect(entry).toContainText(`Session ${String(session)}`);
  expect(stored(dashboard.home)[0]?.firstInput).toMatchObject({
    state: "not-requested",
    intent: "blank",
  });
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual(
    [],
  );

  // Old machine state can retain an established start after completion,
  // including a later failed retry that overwrote the launch outcome.
  const attemptsFile = path.join(
    dashboard.home,
    ".open-dough/dashboard/launch-attempts.json",
  );
  const saved = JSON.parse(readFileSync(attemptsFile, "utf8")) as Record<
    string,
    LaunchAttemptRecord[]
  >;
  const attempt = saved["open-dough"]?.[0];
  if (attempt === undefined)
    throw new Error("Missing retained launch attempt.");
  attempt.outcome = {
    kind: "failed",
    reason: "not-installed",
    sessionStartKept: true,
    explanation: "Old failed continuation.",
  };
  attempt.completion = makeMe.aCompletionReport
    .withOutcome("unfinished")
    .please();
  const staleWorkspace = path.join(
    dashboard.home,
    "git/open-dough/.worktrees/retired-session",
  );
  writeFileSync(
    path.join(dashboard.home, ".open-dough/dashboard/session-starts.json"),
    JSON.stringify({
      "open-dough": {
        [attempt.id]: {
          host: "codex",
          workspace: staleWorkspace,
          branch: "codex/retired-session",
          startedAt: attempt.acceptedAt,
        },
      },
    }),
  );
  writeFileSync(attemptsFile, JSON.stringify(saved));
  await page.reload();
  await expect(recoveryOf(page)).toContainText("Old failed continuation.");
  attempt.completion.outcome = "completed";
  writeFileSync(attemptsFile, JSON.stringify(saved));
  await page.reload();
  await expectSettledPage(page);
  await expect(recoveryOf(page)).toHaveCount(0);
  expect(
    JSON.parse((await continueAttempt(dashboard, attempt.id)).body),
  ).toMatchObject({ kind: "failed", reason: "refused" });
  expect(
    native.calls.filter((call) => call.method === "thread/start"),
  ).toHaveLength(1);
});
