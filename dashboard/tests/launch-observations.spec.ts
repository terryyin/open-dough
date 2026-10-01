// The shared observation seam receives saved targets and isolates native errors.
// Browser/HTTP journeys in the session, alert and terminal specs prove meanings.
import { expect, test } from "@playwright/test";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { claudeHost } from "../server/claudeHost.ts";
import { codexHost } from "../server/codexHost.ts";
import { withStates } from "../server/launchStates.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";

const folder = { path: "/unused", shown: "unused" };
const targets: readonly LaunchRecord[] = (["claude", "codex"] as const).map(
  (host) => ({
    request: { ...launchRequest, workflow: "execution", host },
    session: {
      host,
      sessionId: "same-native-id",
      shortId: "alias",
      name: host,
      continuation: {
        workspace: "/saved-workspace",
        endpoint: "/saved-endpoint",
        args: [],
      },
    },
    launchedAt: "2026-10-01T00:00:00.000Z",
  }),
);

// Only this test process's host objects are substituted; no native runtime or
// server process is reached, and both boundaries are restored in finally.
test.describe("record-targeted host observations", () => {
  test.describe.configure({ mode: "serial" });

  test("passes saved records to each host and preserves healthy observations when another host throws", async () => {
    const claude = claudeHost.sessions;
    const codex = codexHost.sessions;
    try {
      claudeHost.sessions = (records, observedFolder, signal) => {
        expect(records).toEqual([targets[0]]);
        expect(observedFolder).toEqual(folder);
        expect(signal.aborted).toBe(false);
        return Promise.reject(new Error("native read failed"));
      };
      codexHost.sessions = (records) => {
        expect(records).toEqual([targets[1]]);
        return Promise.resolve(
          records.map(({ session }) => ({
            session,
            sessionState: {
              kind: "available",
              availability: "retained",
              activity: "review",
            },
          })),
        );
      };
      expect(
        (await withStates(folder, targets)).map(
          ({ sessionState }) => sessionState,
        ),
      ).toEqual([
        { kind: "unknown" },
        { kind: "available", availability: "retained", activity: "review" },
      ]);
    } finally {
      if (claude === undefined) delete claudeHost.sessions;
      else claudeHost.sessions = claude;
      if (codex === undefined) delete codexHost.sessions;
      else codexHost.sessions = codex;
    }
  });

  test("bounds an unsettled host read and treats omitted targets as unknown rather than confirmed absence", async () => {
    const claude = claudeHost.sessions;
    const codex = codexHost.sessions;
    let observedSignal: AbortSignal | undefined;
    try {
      claudeHost.sessions = (records, observedFolder, signal) => {
        expect(records).toEqual([targets[0]]);
        expect(observedFolder).toEqual(folder);
        observedSignal = signal;
        return new Promise(() => {});
      };
      codexHost.sessions = () => Promise.resolve([]);
      expect(
        (await withStates(folder, targets)).map(
          ({ sessionState }) => sessionState,
        ),
      ).toEqual([{ kind: "unknown" }, { kind: "unknown" }]);
      expect(observedSignal?.aborted).toBe(true);
    } finally {
      if (claude === undefined) delete claudeHost.sessions;
      else claudeHost.sessions = claude;
      if (codex === undefined) delete codexHost.sessions;
      else codexHost.sessions = codex;
    }
  });
});
