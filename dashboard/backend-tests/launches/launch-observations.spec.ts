// The shared observation seam receives saved targets and isolates native errors.
// Browser/HTTP journeys in the session, alert and terminal specs prove meanings.
import { afterEach, expect, test, vi } from "vitest";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { claudeHost } from "../../server/claudeHost.ts";
import { codexHost } from "../../server/codexHost.ts";
import { withStates } from "../../server/launchStates.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const folder = { path: "/unused", shown: "unused" };
// Two kept launches whose sessions share one native ID on different hosts.
const story = { identity: "SEED-001#first", title: "First story" };
const targets: readonly LaunchRecord[] = [
  makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession({ sessionId: "same-native-id" })
    .please(),
  makeMe.aLaunchRecord
    .executing(story)
    .inCodexSession({
      sessionId: "same-native-id",
      continuation: {
        workspace: "/saved-workspace",
        endpoint: "/saved-endpoint",
      },
    })
    .please(),
];

// Only this process's host reads are substituted; no native runtime is reached.
afterEach(() => {
  vi.restoreAllMocks();
});

test("passes saved records to each host and preserves healthy observations when another host throws", async () => {
  const claude = vi
    .spyOn(claudeHost, "sessions")
    .mockRejectedValue(new Error("native read failed"));
  const codex = vi.spyOn(codexHost, "sessions").mockImplementation((records) =>
    Promise.resolve(
      records.map(({ session }) => ({
        session,
        sessionState: makeMe.aSessionState.retained("review").please(),
      })),
    ),
  );

  const answer = await withStates(folder, targets);

  expect(claude).toHaveBeenCalledExactlyOnceWith(
    [targets[0]],
    folder,
    expect.objectContaining({ aborted: false }),
  );
  expect(codex).toHaveBeenCalledExactlyOnceWith(
    [targets[1]],
    folder,
    expect.anything(),
  );
  expect(answer.map(({ session }) => session)).toEqual(
    targets.map(({ session }) => session),
  );
  expect(answer.map(({ sessionState }) => sessionState)).toEqual([
    { kind: "unknown" },
    { kind: "available", availability: "retained", activity: "review" },
  ]);
});

test("bounds an unsettled host read and treats omitted targets as unknown rather than confirmed absence", async () => {
  // Control only the external deadline, retaining the real observation race.
  const deadline = new AbortController();
  const timeout = vi
    .spyOn(AbortSignal, "timeout")
    .mockReturnValue(deadline.signal);
  const claude = vi
    .spyOn(claudeHost, "sessions")
    .mockReturnValue(new Promise(() => {}));
  vi.spyOn(codexHost, "sessions").mockResolvedValue([]);
  let settled = false;
  const reading = withStates(folder, targets).then((states) => {
    settled = true;
    return states;
  });
  await new Promise<void>((resolve) => setImmediate(resolve));

  expect(timeout.mock.calls).toEqual([[10_000], [10_000]]);
  expect(claude).toHaveBeenCalledExactlyOnceWith(
    [targets[0]],
    folder,
    deadline.signal,
  );
  expect(deadline.signal.aborted).toBe(false);
  expect(settled).toBe(false);
  deadline.abort();
  expect((await reading).map(({ sessionState }) => sessionState)).toEqual([
    { kind: "unknown" },
    { kind: "unknown" },
  ]);
});
