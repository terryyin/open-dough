// What an unattached Start session keeps of its start, and when, over raw
// HTTP with a real bare origin (../support/startOrigin.ts) and the installed
// start recorded and held as the case needs (../support/keptSessionStart.ts):
// a start refused before any workspace existed keeps nothing, so a later
// Start selects its workspace afresh; a Default main start that outlasts its
// wait is kept as an isolated one is and continues without a second start,
// once the default checkout holds no unconfirmed change; and a conversation
// whose first input is unconfirmed is recovered by its continuation, which
// runs no start and makes no second workspace. The page journey and a start
// lost with its server: ../agent-launch-start-session-recovery.spec.ts.

import { realpathSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import {
  attempts,
  continueAttempt,
  continued,
  launch,
  recordsOf,
} from "../agentLaunchBoundary.ts";
import { stored } from "../support/codexLaunch.ts";
import {
  holdStarts,
  keptSessionStarts,
  keptWords,
} from "../support/keptSessionStart.ts";
import { expect, test } from "../support/preparationPage.ts";
import { originMain } from "../support/sessionDialog.ts";
import {
  defaultMainSession,
  defaultMainStart,
  git,
  isolatedSession,
  isolatedStart,
  recordStarts,
  sessionBlock,
  worktree,
  worktrees,
} from "../support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const request = { source: "open-dough", workflow: "ad-hoc", host: "claude" };
const isolated = { workspace: "isolated", landing: "review" };

type Answer = {
  kind: string;
  reason?: string;
  explanation?: string;
  record?: LaunchWithState;
};

const answerOf = async (answer: Promise<{ body: string }>) =>
  JSON.parse((await answer).body) as Answer;

test("a start refused before any workspace existed keeps nothing, and a later Start selects its workspace afresh", async ({
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  // Origin cannot be fetched, so the start stops before it makes a workspace.
  git(origin.project, "remote", "set-url", "origin", `${origin.origin}-gone`);
  const refused = await answerOf(
    launch(dashboard, { ...request, policy: isolated }),
  );
  expect(refused).toMatchObject({ kind: "failed", reason: "start-refused" });
  expect(refused.explanation).toMatch(/Nothing was launched\.$/);
  expect(worktrees(origin.project)).toEqual([]);
  expect(keptSessionStarts(origin)).toEqual({});
  // Nothing of it is left to continue.
  const [stopped] = await attempts(dashboard);
  expect(await answerOf(continueAttempt(dashboard, stopped?.id ?? ""))).toEqual(
    {
      kind: "failed",
      reason: "refused",
      explanation:
        "This start no longer needs reconciliation, so nothing was continued.",
    },
  );

  // A later Start chooses again: another host's branch took the slug since.
  git(origin.project, "remote", "set-url", "origin", origin.origin);
  git(origin.project, "branch", "codex/session");
  dashboard.claudeScenario("launched");
  const launched = await answerOf(
    launch(dashboard, { ...request, policy: isolated }),
  );
  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.establishedSession).toEqual(
    isolatedSession(origin.project, "session-2", "review", before),
  );
  expect(starts().map(({ argv }) => argv)).toEqual([
    isolatedStart(origin.project, "session", "review"),
    isolatedStart(origin.project, "session-2", "review"),
  ]);
  expect(worktrees(origin.project)).toEqual(["session-2"]);
  expect(keptSessionStarts(origin)).toEqual({});
});

test.describe("a Default main start that outlasts its wait", () => {
  // The start is held past this wait, however long the machine takes.
  test.use({ startTimeoutMs: 500 });

  test("is kept in the project folder on trunk, and continues without a second start once default main holds no unconfirmed change", async ({
    dashboard,
    origin,
  }) => {
    const starts = recordStarts(origin);
    const hold = holdStarts(origin, "after");
    const before = await originMain(origin);
    const policy = { workspace: "default-checkout", landing: "auto-land" };
    expect(
      await answerOf(launch(dashboard, { ...request, policy })),
    ).toMatchObject({
      kind: "uncertain",
      reason: "timed-out",
      explanation: keptWords("~/git/open-dough", "main"),
    });
    const [uncertain] = await attempts(dashboard);
    const id = uncertain?.id ?? "";
    expect(keptSessionStarts(origin)[id]).toMatchObject({
      workspace: origin.project,
      branch: "main",
    });
    hold.release();
    const session = defaultMainSession(origin.project, "auto-land", before);
    await expect
      .poll(() => keptSessionStarts(origin)[id]?.["session"], {
        timeout: 30_000,
      })
      .toEqual(session);

    // Changes made since are not confirmed from recovery: nothing continues.
    const note = path.join(origin.project, "note.txt");
    writeFileSync(note, "later\n");
    expect((await answerOf(continueAttempt(dashboard, id))).kind).toBe(
      "existing-changes",
    );
    expect(await attempts(dashboard)).toEqual([uncertain]);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);

    rmSync(note);
    dashboard.claudeScenario("launched");
    const launched = await answerOf(continued(dashboard, id));
    expect(launched.kind, JSON.stringify(launched)).toBe("launched");
    expect(launched.record?.establishedSession).toEqual(session);
    const [call, ...others] = dashboard.claudeLaunchCalls();
    expect(others).toEqual([]);
    expect(call?.cwd).toBe(realpathSync(origin.project));
    expect((call?.argv.at(-1) ?? "").split("\n\n")[0]).toBe(
      sessionBlock(session),
    );
    expect(starts().map(({ argv }) => argv)).toEqual([
      defaultMainStart(origin.project, "auto-land"),
    ]);
    expect(worktrees(origin.project)).toEqual([]);
    expect(keptSessionStarts(origin)).toEqual({});
  });
});

test.describe("Codex", () => {
  test.use({ preparationHost: "codex" });

  test("a conversation whose first input is unconfirmed is recovered by its continuation, with no second start, workspace, or conversation", async ({
    dashboard,
    codexProtocol,
    origin,
  }) => {
    const native = codexProtocol;
    if (native === undefined) throw new Error("Missing native fixture.");
    const starts = recordStarts(origin, "codex");
    const before = await originMain(origin);
    const session = isolatedSession(
      origin.project,
      "session",
      "review",
      before,
      "codex",
    );
    native.hold = true;
    const starting = launch(dashboard, {
      ...request,
      host: "codex",
      policy: isolated,
    });
    await expect.poll(() => native.history.length, { timeout: 30_000 }).toBe(1);
    native.failConnection();
    expect((await answerOf(starting)).kind).toBe("uncertain");
    const [uncertain] = await attempts(dashboard);
    const id = uncertain?.id ?? "";
    const saved = stored(dashboard.home)[0];
    expect(saved?.firstInput).toMatchObject({ state: "uncertain" });
    expect(saved?.establishedSession).toEqual(session);
    // Its start stays kept while its session is not known to have started.
    expect(keptSessionStarts(origin)[id]).toMatchObject({ session });

    native.hold = false;
    const turn = native.history[0];
    if (turn === undefined) throw new Error("Missing accepted native input.");
    turn.status = "completed";
    const recovered = await answerOf(continued(dashboard, id));
    expect(recovered.kind, JSON.stringify(recovered)).toBe("launched");
    expect(await recordsOf(dashboard, "open-dough")).toHaveLength(1);
    expect(stored(dashboard.home)[0]?.session).toEqual(saved?.session);
    for (const method of ["thread/start", "turn/start"])
      expect(
        native.calls.filter((call) => call.method === method),
      ).toHaveLength(1);
    expect(starts().map(({ argv }) => argv)).toEqual([
      isolatedStart(origin.project, "session", "review", "codex"),
    ]);
    expect(worktrees(origin.project)).toEqual(["session"]);
    expect(realpathSync(worktree(origin.project, "session"))).toBeTruthy();
    expect(keptSessionStarts(origin)).toEqual({});
  });
});
