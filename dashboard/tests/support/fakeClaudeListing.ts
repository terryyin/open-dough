// The synthetic `claude`'s session listing (../fixtures/fake-claude), as a
// test reads and changes it (./fakeClaude.ts): the listing is the fake's
// `agents.json` state file, replaced whole, so the fake never lists a
// half-written file.

import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { claudeListingAppearance } from "../../../tests/support/claudeListingTestData.mjs";
import { makeMe } from "../../../tests/support/makeMe.mjs";

// What a listed session becomes, as the real `claude agents --json --all`
// lists it (Claude Code 2.1.284): a background appearance from MakeMe's
// listing row, or no longer listed (`forgotten`). Each replaces the
// session's `state`, `status`, and `waitingFor` whole.
export type ClaudeSessionChange =
  keyof typeof claudeListingAppearance | "forgotten";

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
  // Replaces the native listing, including omitted or restored sessions.
  claudeListingBecomes(sessions: readonly object[]): void;
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
    claudeListingBecomes: relist,
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
          const row = makeMe.aClaudeListingRow.fromListed(session).as(change);
          return [
            waitingFor === undefined
              ? row.please()
              : row.waitingFor(waitingFor).please(),
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
        makeMe.aClaudeListingRow
          .interactive({
            pid: 3394,
            cwd: home,
            startedAt: Date.now(),
            sessionId: "3ab4613a-744d-4545-adba-15346379854a",
            name: "terminal session",
          })
          .please(),
      ]);
    },
    claudeListsSession({ name, cwd, startedAt }) {
      const sessionId = randomUUID();
      relist([
        ...claudeListing(),
        makeMe.aClaudeListingRow
          .background({
            pid: 4242,
            sessionId,
            name,
            cwd,
            startedAt,
          })
          .please(),
      ]);
      return sessionId;
    },
  };
}
