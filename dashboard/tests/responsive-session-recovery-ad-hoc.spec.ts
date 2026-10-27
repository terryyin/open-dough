// An unresolved ad hoc launch is recovered outside every card
// (../src/StartupRecovery.tsx): a blank Codex session whose persistence the
// native connection left unconfirmed is listed under Startup recovery as the
// project's ad hoc session, with no card or story made for it and no card
// protected. Continuing it from the page runs that same attempt under the
// existing blank-intent recovery: the recorded conversation is confirmed
// without any input submitted.

import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import { attempts, continueAttempt, launch } from "./agentLaunchBoundary.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { recoveryOf } from "./responsiveRecovery.ts";
import { expect, stored, test } from "./support/codexLaunch.ts";

const request = { source: "open-dough", host: "codex", workflow: "ad-hoc" };
test.use({ projectFolders: ["open-dough"] });

test("an unconfirmed blank ad hoc session is recovered under Startup recovery with no card, and continuing it submits no input", async ({
  page,
  dashboard,
  codexProtocol,
  launchJourney,
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

  await openTakenBacklog(page, launchJourney);
  const { board } = parts(page);
  const cards = board.locator("[data-work]");
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
  await expect(
    cards.and(page.getByRole("article", { name: /ad hoc/i })),
  ).toHaveCount(0);
  await expect(board).not.toContainText("Startup needs reconciliation");
  // The recorded native id has its local entry; recovery concerns whether
  // the blank conversation persisted, not a new published story.
  const session = stored(dashboard.home)[0]?.session.sessionId;
  expect(session).toBeDefined();
  const entry = parts(page).taken.locator(".session-entry");
  await expect(entry).toHaveCount(1);
  await expect(entry).toContainText(`Session ${String(session)}`);
  await expect(parts(page).recentlyDone.locator(".session-entry")).toHaveCount(
    0,
  );

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
  attempt.completion = {
    receipt: randomUUID(),
    reference: randomUUID(),
    outcome: "unfinished",
    message: "",
    receivedAt: new Date().toISOString(),
  };
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
