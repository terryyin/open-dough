// Held Cursor follow-up observation when belonging subagent transcripts
// exist under the workspace Cursor project directory: unfinished jsonl
// (no `turn_ended`) maps a confirmed follow-up to working; finished,
// missing, empty, or unreadable trees keep review; unconfirmed first
// instruction stays awaiting-instruction; a live stop-hint label stays
// working without needing those transcripts.
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
import { cursorHeldLabel } from "../../src/cursorHeldLabel.ts";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";

const sessionId = "c6df5a96-3f57-48ff-8b44-d6fbe2faba34";
const workspace =
  "/Users/terryyin/git/doughnut/.worktrees/use-donut-note-context-from-an-https-mcp-client";

function cursorFollowUpRecord(
  firstInputState: "confirmed" | "awaiting" = "confirmed",
): LaunchRecord {
  return {
    request: {
      source: "open-dough",
      identity: "SEED-155#cursor-background-work-reads-working",
      title: "Background work",
      workflow: "execution",
      host: "cursor",
    },
    session: {
      host: "cursor",
      sessionId,
      name: "Background work",
      continuation: {
        workspace,
        args: ["cursor-agent", "--workspace", workspace, "--resume", sessionId],
      },
    },
    firstInput: { state: firstInputState },
    launchedAt: "2026-10-27T00:00:00.000Z",
  };
}

function heldFollowUp(record: LaunchRecord): HeldCursorSession {
  return { record, label: cursorHeldLabel.followUp };
}

function stageSubagents(
  home: string,
  transcripts: Readonly<Record<string, string>>,
): void {
  const directory = cursorBelongingSubagentsDirectory(
    home,
    workspace,
    sessionId,
  );
  mkdirSync(directory, { recursive: true });
  for (const [name, body] of Object.entries(transcripts)) {
    writeFileSync(path.join(directory, name), body);
  }
}

function expectAvailableActivity(
  record: LaunchRecord,
  held: HeldCursorSession,
  home: string,
  activity: Extract<SessionState, { kind: "available" }>["activity"],
): void {
  expect(observeHeldCursorSession(record, held, home).sessionState).toEqual({
    kind: "available",
    availability: "loaded",
    activity,
  });
}

test.describe("follow-up with belonging subagent transcripts", () => {
  let home: string;
  test.beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "dough-cursor-subagents-"));
  });
  test.afterEach(() => {
    rmSync(home, { recursive: true, force: true });
  });

  test("an unfinished belonging subagent observes working", () => {
    const record = cursorFollowUpRecord();
    stageSubagents(home, {
      "finished.jsonl":
        '{"type":"user"}\n{"type":"turn_ended","status":"success"}\n',
      "running.jsonl": '{"type":"user"}\n{"type":"assistant"}\n',
    });
    expectAvailableActivity(record, heldFollowUp(record), home, "working");
  });

  for (const [name, transcripts] of [
    [
      "only turn_ended siblings",
      {
        "done-a.jsonl": '{"type":"turn_ended","status":"success"}\n',
        "done-b.jsonl":
          '{"type":"assistant"}\n{"type":"turn_ended","status":"success"}\n',
      },
    ],
    ["no subagents directory", undefined],
    ["empty subagents directory", {}],
  ] as const) {
    test(`${name} keep review`, () => {
      const record = cursorFollowUpRecord();
      if (transcripts !== undefined) stageSubagents(home, transcripts);
      expectAvailableActivity(record, heldFollowUp(record), home, "review");
    });
  }

  test("an unreadable subagents tree keeps review", () => {
    const record = cursorFollowUpRecord();
    const directory = cursorBelongingSubagentsDirectory(
      home,
      workspace,
      sessionId,
    );
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      path.join(directory, "running.jsonl"),
      '{"type":"assistant"}\n',
    );
    chmodSync(directory, 0);
    try {
      expectAvailableActivity(record, heldFollowUp(record), home, "review");
    } finally {
      chmodSync(directory, 0o700);
    }
  });

  test("unconfirmed first instruction stays awaiting-instruction despite unfinished subagents", () => {
    const record = cursorFollowUpRecord("awaiting");
    stageSubagents(home, {
      "running.jsonl": '{"type":"user"}\n{"type":"assistant"}\n',
    });
    expectAvailableActivity(
      record,
      heldFollowUp(record),
      home,
      "awaiting-instruction",
    );
  });
});

test("a live stop-hint label observes working without needing transcripts", () => {
  const record = cursorFollowUpRecord();
  const held: HeldCursorSession = {
    record,
    label: cursorHeldLabel.working,
  };
  expectAvailableActivity(
    record,
    held,
    "/tmp/dough-unused-cursor-home",
    "working",
  );
});
