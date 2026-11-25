import { isolatedAdmissionFlags } from "../../test-support/support/isolatedSessionAdmissionProof.ts";
import { expectBorrowedStarts } from "../../test-support/support/unattachedLaunchAssertions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
// What an unattached Start session keeps of its start, and when, over raw
// HTTP with a real bare origin (../../test-support/support/startOrigin.ts) and the installed
// start recorded and held as the case needs (../../test-support/support/keptSessionStart.ts):
// a start refused before any workspace existed keeps nothing, so a later
// Start selects its workspace afresh; an execution checkout start that outlasts its
// wait is kept as an isolated one is and continues without a second start,
// once the execution checkout holds no unconfirmed change; and a conversation
// whose first input is unconfirmed is recovered by its continuation, which
// runs no start and makes no second workspace. The page journey and a start
// lost with its server: ../../../e2e/launches/agent-launch-start-session-recovery.spec.ts.

import { realpathSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchWithState } from "../../src/launchRecord.ts";
import {
  attempts,
  continueAttempt,
  continued,
  launch,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { stored } from "../../test-support/support/codexLaunch.ts";
import {
  holdStarts,
  keptSessionStarts,
  keptWords,
} from "../../test-support/support/keptSessionStart.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  executionCheckoutSession,
  git,
  isolatedSession,
  recordStarts,
  worktree,
  worktrees,
} from "../../test-support/support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const request = makeMe.aLaunchRequest.adHoc().please();
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
  const originalRemote = git(
    origin.project,
    "config",
    "--get",
    "remote.origin.url",
  );
  git(origin.project, "remote", "set-url", "origin", `${origin.origin}-gone`);
  const refused = await answerOf(
    launch(dashboard, { ...request, policy: isolated }),
  );
  expect(refused).toMatchObject({ kind: "failed", reason: "start-refused" });
  expect(refused.explanation).toMatch(/Nothing was launched\.$/);
  expect(worktrees(origin.project)).toEqual([]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await originMain(origin)).toBe(before);
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
  git(origin.project, "remote", "set-url", "origin", originalRemote);
  git(origin.project, "branch", "codex/session");
  dashboard.claudeScenario("launched");
  const launched = await answerOf(
    launch(dashboard, { ...request, policy: isolated }),
  );
  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const revision = await originMain(origin);
  expect(revision).not.toBe(before);
  expect(launched.record?.establishedSession).toEqual(
    isolatedSession(origin.project, "session-2", "review", revision),
  );
  expect(starts().map(({ argv }) => argv)).toEqual([
    expect.arrayContaining(isolatedAdmissionFlags(origin.project, "session-2")),
  ]);
  expect(worktrees(origin.project)).toEqual(["session-2"]);
  expect(keptSessionStarts(origin)).toEqual({});
});

test.describe("an execution checkout start that outlasts its wait", () => {
  // The start is held past this wait, however long the machine takes.
  test.use({ startTimeoutMs: 500 });

  test("is kept in the execution checkout on trunk, and continues without a second start once execution checkout holds no unconfirmed change", async ({
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
    const session = executionCheckoutSession(
      origin.project,
      "auto-land",
      before,
    );
    await expect
      .poll(() => keptSessionStarts(origin)[id]?.["session"], {
        timeout: 30_000,
      })
      .toEqual(session);

    await expect
      .poll(() => keptSessionStarts(origin)[id]?.["claim"])
      .toMatchObject({ publishedSha: expect.any(String) });

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
    expect(dashboard.claudeLaunches()[0]?.instruction).toBeUndefined();
    expect(launched.record?.landingReporting?.authority).toMatchObject({
      workspace: session.workspace,
      branch: session.branch,
    });
    expectBorrowedStarts(
      starts,
      origin.project,
      "auto-land",
      launched.record,
      dashboard.home,
    );
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
    native.hold = true;
    const starting = launch(dashboard, {
      ...request,
      host: "codex",
      instruction: "Session",
      policy: isolated,
    });
    await expect.poll(() => native.history.length, { timeout: 30_000 }).toBe(1);
    native.failConnection();
    expect((await answerOf(starting)).kind).toBe("uncertain");
    const [uncertain] = await attempts(dashboard);
    const id = uncertain?.id ?? "";
    const revision = await originMain(origin);
    expect(revision).not.toBe(before);
    const session = isolatedSession(
      origin.project,
      "session",
      "review",
      revision,
      "codex",
    );
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
      expect.arrayContaining(
        isolatedAdmissionFlags(origin.project, "session", "codex"),
      ),
    ]);
    expect(worktrees(origin.project)).toEqual(["session"]);
    expect(realpathSync(worktree(origin.project, "session"))).toBeTruthy();
    expect(keptSessionStarts(origin)).toEqual({});
  });
});
