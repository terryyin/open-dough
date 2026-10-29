// Held Cursor follow-up when this conversation owns CI mailbox coverage: a
// fresh pending revision maps confirmed follow-up to working; terminal,
// stale, missing, unreadable, other-conversation, child-owned, or worker-only
// coverage keeps review. Unfinished belonging subagents and a live stop-hint
// label still map to working without inventing CI evidence.
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { observeHeldCursorSession } from "../../server/hosts/cursor/sessions.ts";
import type { HeldCursorSession } from "../../server/hosts/cursor/heldSessions.ts";
import { cursorBelongingSubagentsDirectory } from "../../server/hosts/cursor/unfinishedSubagents.ts";
import { createMailbox } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-location.mjs";
import {
  observerOwner,
  claimMailbox,
} from "../../../src/skills/dough-execute-plan/scripts/ci-observer-owner.mjs";
import {
  pendingFreshnessMs,
  publishRevisionRecord,
  registerPushedRevision,
} from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-revision-records.mjs";
import { recordWorkerIdentity } from "../../../src/skills/dough-execute-plan/scripts/ci-mailbox-store.mjs";
import { cursorHeldLabel } from "../../src/cursorHeldLabel.ts";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";

const sessionId = "ae8d2091-5757-4962-b22a-011937f5e8e3";
const otherSessionId = "39365b69-73a9-456e-8778-e7b97a2dad87";
const workspace =
  "/Users/terryyin/git/open-dough/.worktrees/keep-a-cursor-session-working-while-its-ci-is-st";
const revisionSha = "423b18053aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

function cursorFollowUpRecord(): LaunchRecord {
  return {
    request: {
      source: "open-dough",
      identity: "SEED-175#keep-cursor-session-working-while-its-ci-runs",
      title: "Owned CI stays Working",
      workflow: "execution",
      host: "cursor",
    },
    session: {
      host: "cursor",
      sessionId,
      name: "Owned CI stays Working",
      continuation: {
        workspace,
        args: ["cursor-agent", "--workspace", workspace, "--resume", sessionId],
      },
    },
    firstInput: { state: "confirmed" },
    launchedAt: "2026-10-29T00:00:00.000Z",
  };
}

function conversationOwner(session = sessionId, child = ""): string {
  return observerOwner({ root: workspace, host: "cursor", session, child });
}

function stageOwnedRevision(
  storage: string,
  owner: string,
  state: "pending" | "success" | "failure",
  observedAt = Date.now(),
): string {
  const directory = createMailbox(
    { mode: "execution", repo: "open-dough/open-dough", branch: "main" },
    { root: workspace, storage },
  );
  expect(claimMailbox(directory, owner)).toBe(true);
  registerPushedRevision(directory, revisionSha);
  publishRevisionRecord(directory, { sha: revisionSha, state, observedAt });
  return directory;
}

function expectAvailableActivity(
  record: LaunchRecord,
  held: HeldCursorSession,
  home: string,
  mailboxStorage: string,
  activity: Extract<SessionState, { kind: "available" }>["activity"],
): void {
  expect(
    observeHeldCursorSession(record, held, home, mailboxStorage).sessionState,
  ).toEqual({ kind: "available", availability: "loaded", activity });
}

test.describe("follow-up with owned pending CI mailbox", () => {
  let home: string;
  let mailboxStorage: string;
  test.beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "dough-cursor-ci-home-"));
    mailboxStorage = mkdtempSync(path.join(tmpdir(), "dough-cursor-ci-mail-"));
  });
  test.afterEach(() => {
    rmSync(home, { recursive: true, force: true });
    rmSync(mailboxStorage, { recursive: true, force: true });
  });

  function followUp(
    activity: Extract<SessionState, { kind: "available" }>["activity"],
    storage = mailboxStorage,
  ): void {
    const record = cursorFollowUpRecord();
    expectAvailableActivity(
      record,
      { record, label: cursorHeldLabel.followUp },
      home,
      storage,
      activity,
    );
  }

  test("owner-matched fresh pending revision observes working", () => {
    stageOwnedRevision(mailboxStorage, conversationOwner(), "pending");
    followUp("working");
  });

  for (const example of [
    {
      name: "owned revision success",
      prepare: (s: string) =>
        stageOwnedRevision(s, conversationOwner(), "success"),
    },
    {
      name: "owned revision failure",
      prepare: (s: string) =>
        stageOwnedRevision(s, conversationOwner(), "failure"),
    },
    {
      name: "pending observation older than freshness window",
      prepare: (s: string) =>
        stageOwnedRevision(
          s,
          conversationOwner(),
          "pending",
          Date.now() - pendingFreshnessMs - 1,
        ),
    },
    {
      name: "missing mailbox storage",
      prepare: () => {},
      storage: (s: string) => path.join(s, "absent"),
    },
    {
      name: "another conversation's pending mailbox",
      prepare: (s: string) =>
        stageOwnedRevision(s, conversationOwner(otherSessionId), "pending"),
    },
    {
      name: "child-owned pending mailbox",
      prepare: (s: string) =>
        stageOwnedRevision(
          s,
          conversationOwner(sessionId, "agent-child-1"),
          "pending",
        ),
    },
    {
      name: "live worker identity with terminal owned revisions",
      prepare: (s: string) => {
        const directory = stageOwnedRevision(s, conversationOwner(), "success");
        recordWorkerIdentity(directory, {
          pid: process.pid,
          startedAt: Date.now(),
        });
      },
    },
  ] as const) {
    test(`${example.name} observes review`, () => {
      example.prepare(mailboxStorage);
      followUp(
        "review",
        "storage" in example ? example.storage(mailboxStorage) : mailboxStorage,
      );
    });
  }

  test("unreadable mailbox storage observes review", () => {
    stageOwnedRevision(mailboxStorage, conversationOwner(), "pending");
    chmodSync(mailboxStorage, 0);
    try {
      followUp("review");
    } finally {
      chmodSync(mailboxStorage, 0o700);
    }
  });

  test("unfinished belonging subagents still observe working", () => {
    const directory = cursorBelongingSubagentsDirectory(
      home,
      workspace,
      sessionId,
    );
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(directory, "running.jsonl"),
      '{"type":"user"}\n{"type":"assistant"}\n',
    );
    followUp("working");
  });

  test("a live stop-hint label observes working without reading the mailbox", () => {
    const record = cursorFollowUpRecord();
    // Conflicting evidence must not be consulted for a live stop hint.
    stageOwnedRevision(
      mailboxStorage,
      conversationOwner(otherSessionId),
      "pending",
    );
    expectAvailableActivity(
      record,
      { record, label: cursorHeldLabel.working },
      home,
      mailboxStorage,
      "working",
    );
  });
});
