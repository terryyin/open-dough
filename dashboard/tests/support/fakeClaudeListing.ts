// The synthetic `claude`'s session listing (../fixtures/fake-claude), as a
// test reads and changes it (./fakeClaude.ts): the listing is the fake's
// `agents.json` state file, replaced whole, so the fake never lists a
// half-written file.

import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

// What a listed session becomes, as the real `claude agents --json --all`
// lists it (Claude Code 2.1.284): working with its process busy (`working`)
// or idle between steps (`working-idle`); blocked, waiting on the developer
// (`blocked`, with what it waits for when a test gives it); done with its
// process still running idle (`done-live`) or exited (`done-exited`); failed
// or stopped with its process exited (`failed`, `stopped`); or no longer
// listed at all (`forgotten`); or in a state this dashboard does not know
// (`unrecognized`). Each replaces the session's `state`, `status`,
// and `waitingFor` whole.
export type ClaudeSessionChange =
  | "working"
  | "working-idle"
  | "blocked"
  | "done-live"
  | "done-exited"
  | "failed"
  | "stopped"
  | "forgotten"
  | "unrecognized";

const listedAs = {
  working: { state: "working", status: "busy" },
  "working-idle": { state: "working", status: "idle" },
  blocked: { state: "blocked", status: "waiting" },
  "done-live": { state: "done", status: "idle" },
  "done-exited": { state: "done" },
  failed: { state: "failed" },
  stopped: { state: "stopped" },
  unrecognized: { state: "napping" },
} as const;

const replacedFields = new Set(["state", "status", "waitingFor"]);

export type ClaudeListingControls = {
  // Changes how the fake lists the session with this id; only a blocked
  // one may say what it waits for.
  claudeSessionBecomes(
    sessionId: string,
    change: ClaudeSessionChange,
    waitingFor?: string,
  ): void;
  // Whether the fake's session listing fails, answering nothing.
  claudeListingFails(fails: boolean): void;
  // Lists an interactive session running in a terminal, as Claude Code
  // 2.1.285 does: with no short `id` and no `state`.
  claudeListsInteractiveSession(): void;
  // Lists a background session working with this name, started in `cwd` at
  // `startedAt` (epoch milliseconds), as another launch would have; answers
  // its session id.
  claudeListsSession(session: {
    readonly name: string;
    readonly cwd: string;
    readonly startedAt: number;
  }): string;
  // Every session the fake lists, as `claude agents --json --all` would.
  claudeListing(): Record<string, unknown>[];
};

export function fakeClaudeListing(
  stateDir: string,
  home: string,
): ClaudeListingControls {
  const state = (file: string) => path.join(stateDir, file);
  const claudeListing = () => {
    let listed = "[]";
    try {
      listed = readFileSync(state("agents.json"), "utf8");
    } catch {
      // Nothing listed yet.
    }
    return JSON.parse(listed) as Record<string, unknown>[];
  };
  const relist = (sessions: readonly object[]) => {
    writeFileSync(state("agents.json.next"), JSON.stringify(sessions));
    renameSync(state("agents.json.next"), state("agents.json"));
  };
  return {
    claudeListing,
    claudeSessionBecomes(sessionId, change, waitingFor) {
      if (waitingFor !== undefined && change !== "blocked") {
        throw new Error(`A ${change} session waits for nothing.`);
      }
      const listed = claudeListing();
      if (!listed.some((session) => session.sessionId === sessionId)) {
        throw new Error(`The fake claude lists no session ${sessionId}.`);
      }
      relist(
        listed.flatMap((session): object[] => {
          if (session.sessionId !== sessionId) return [session];
          if (change === "forgotten") return [];
          const kept = Object.entries(session).filter(
            ([key]) => !replacedFields.has(key),
          );
          return [
            {
              ...Object.fromEntries(kept),
              ...listedAs[change],
              ...(waitingFor === undefined ? {} : { waitingFor }),
            },
          ];
        }),
      );
    },
    claudeListingFails(fails) {
      if (fails) writeFileSync(state("listing-fails"), "");
      else rmSync(state("listing-fails"), { force: true });
    },
    claudeListsInteractiveSession() {
      relist([
        ...claudeListing(),
        {
          pid: 3394,
          cwd: home,
          kind: "interactive",
          startedAt: Date.now(),
          sessionId: "3ab4613a-744d-4545-adba-15346379854a",
          name: "terminal session",
          status: "busy",
        },
      ]);
    },
    claudeListsSession({ name, cwd, startedAt }) {
      const sessionId = randomUUID();
      relist([
        ...claudeListing(),
        {
          pid: 4242,
          id: sessionId.slice(0, 8),
          cwd,
          kind: "bg",
          startedAt,
          sessionId,
          name,
          status: "busy",
          state: "working",
        },
      ]);
      return sessionId;
    },
  };
}
