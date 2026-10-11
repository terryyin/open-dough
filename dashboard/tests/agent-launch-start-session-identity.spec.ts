// An unattached Start session's identity includes its Workspace and After
// checks choices, over raw HTTP with a real bare origin
// (./support/startOrigin.ts), the installed start recorded
// (./support/startSessionLanding.ts) and the protocol-only Codex: while a
// conversation's first input is unconfirmed, a Start session with another
// landing choice starts a new session in its own place and leaves that
// conversation and workspace intact; repeating its choices recovers it. Both
// matching axes are proved in ./agent-launch-matching-rules.spec.ts. Kept
// start continuation belongs to ./agent-launch-start-session-kept.spec.ts.

import type { LaunchWithState } from "../src/launchRecord.ts";
import { launch, recordsOf } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { stored } from "./support/codexLaunch.ts";
import type { FakeCodex } from "./support/fakeCodex.ts";
import { expect, test } from "./support/preparationPage.ts";
import { originMain } from "./support/sessionDialog.ts";
import {
  isolatedSession,
  isolatedStart,
  recordStarts,
  worktrees,
} from "./support/startSessionLanding.ts";

const request = { source: "open-dough", workflow: "ad-hoc", host: "codex" };
const isolated = { workspace: "isolated", landing: "review" };
const landing = { workspace: "isolated", landing: "auto-land" };

type Answer = { kind: string; record?: LaunchWithState };

const answerOf = async (answer: Promise<{ body: string }>) =>
  JSON.parse((await answer).body) as Answer;

const callsOf = (native: FakeCodex, method: string) =>
  native.calls.filter((call) => call.method === method);

// Leaves a conversation of `body` whose first input is unconfirmed: its
// acknowledgment is lost with the connection. Answers what the native side
// then holds of it, to hand back before it is recovered.
async function pendingInput(
  dashboard: DashboardServer,
  native: FakeCodex,
  body: object,
) {
  const fixture = native;
  fixture.hold = true;
  const starting = launch(dashboard, body);
  await expect.poll(() => fixture.history.length, { timeout: 30_000 }).toBe(1);
  fixture.failConnection();
  expect((await answerOf(starting)).kind).toBe("uncertain");
  fixture.hold = false;
  const [saved] = stored(dashboard.home);
  expect(saved?.firstInput).toMatchObject({ state: "uncertain" });
  return { saved, turns: fixture.history, cwd: fixture.cwd };
}

// The native side holds the pending conversation again, its input accepted.
function holdAgain(
  native: FakeCodex,
  pending: Awaited<ReturnType<typeof pendingInput>>,
) {
  const fixture = native;
  fixture.threadId = pending.saved?.session.sessionId ?? "";
  fixture.history = pending.turns;
  fixture.cwd = pending.cwd;
  const turn = pending.turns[0];
  if (turn === undefined) throw new Error("Missing accepted native input.");
  turn.status = "completed";
}

// The next native conversation is another one, with no input yet.
function anotherConversation(native: FakeCodex, threadId: string) {
  const fixture = native;
  fixture.threadId = threadId;
  fixture.history = [];
}

test.use({ preparationHost: "codex" });

test("a pending Isolated workspace conversation waiting for review is not resumed by one landing automatically, and is resumed by the same choices again", async ({
  dashboard,
  codexProtocol,
  origin,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const starts = recordStarts(origin, "codex");
  const before = await originMain(origin);
  const pending = await pendingInput(dashboard, native, {
    ...request,
    policy: isolated,
  });

  anotherConversation(native, "landing-thread-id");
  const launched = await answerOf(
    launch(dashboard, { ...request, policy: landing }),
  );
  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  expect(launched.record?.session.sessionId).toBe("landing-thread-id");
  expect(launched.record?.establishedSession).toEqual(
    isolatedSession(origin.project, "session-2", "auto-land", before, "codex"),
  );
  const bothStarts = [
    isolatedStart(origin.project, "session", "review", "codex"),
    isolatedStart(origin.project, "session-2", "auto-land", "codex"),
  ];
  expect(starts().map(({ argv }) => argv)).toEqual(bothStarts);
  expect(worktrees(origin.project)).toEqual(["session", "session-2"]);
  expect(await recordsOf(dashboard, "open-dough")).toHaveLength(2);
  expect(stored(dashboard.home)).toContainEqual(pending.saved);

  // The same choices again: the pending conversation, in its own workspace.
  holdAgain(native, pending);
  const recovered = await answerOf(
    launch(dashboard, { ...request, policy: isolated }),
  );
  expect(recovered.kind, JSON.stringify(recovered)).toBe("launched");
  expect(recovered.record?.session).toEqual(pending.saved?.session);
  expect(recovered.record?.establishedSession).toEqual(
    pending.saved?.establishedSession,
  );
  expect(await recordsOf(dashboard, "open-dough")).toHaveLength(2);
  expect(callsOf(native, "thread/start")).toHaveLength(2);
  expect(callsOf(native, "turn/start")).toHaveLength(2);
  expect(starts().map(({ argv }) => argv)).toEqual(bothStarts);
  expect(worktrees(origin.project)).toEqual(["session", "session-2"]);
});
