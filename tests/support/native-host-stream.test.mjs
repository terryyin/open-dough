// The reader's contract beyond what corpus replay (tests/native-stream-replay.sh)
// covers: missing and unknown streams, separator splitting, each host's
// command outputs, paired with their commands, and each host's messages, exit
// codes, other tool calls, file reads, and inspection targets on real
// recorded streams.
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  commandSegments,
  hosts,
  readHostStream,
  readHostStreamText,
} from "./native-host-stream.mjs";

const corpus = (entry) =>
  fileURLToPath(
    new URL(`../fixtures/native-streams/${entry}`, import.meta.url),
  );

test("an empty or absent stream is missing, any other shape unknown", () => {
  for (const host of hosts) {
    assert.equal(readHostStreamText(host, "").status, "missing");
    assert.equal(
      readHostStream(host, corpus("absent.jsonl")).status,
      "missing",
    );
    assert.equal(
      readHostStreamText(host, '{"unrecognized":true}\n').status,
      "unknown",
    );
    assert.equal(readHostStreamText(host, "\n").status, "unknown");
  }
  // A line cut mid-write leaves the whole stream unreadable, because
  // one bad line fails the whole parse.
  assert.equal(
    readHostStreamText("codex", '{"type":"turn.started"}\n{"type":"it').status,
    "unknown",
  );
});

test("commands join line continuations and split at separators", () => {
  assert.deepEqual(
    commandSegments("git add a\\\n    b &&git commit -m x; echo ok | cat\nls"),
    ["git add a b", "git commit -m x", "echo ok", "cat", "ls"],
  );
  // Whitespace on both sides of a continuation collapses to one space.
  assert.deepEqual(commandSegments("node a.mjs \\\n  --x  \\\n  y"), [
    "node a.mjs --x y",
  ]);
});

test("each host's command outputs pair with the commands that produced them", () => {
  const entries = {
    claude:
      "claude/publication/startup-selected-source/20260923T040305-58dd/events.jsonl.gz",
    codex:
      "codex/publication/startup-trunk/20260923T062909-023d/events.jsonl.gz",
    cursor:
      "cursor/publication/one-shot-result/20260929T035401-179d/events.jsonl.gz",
  };
  for (const [host, entry] of Object.entries(entries)) {
    const read = readHostStream(host, corpus(entry));
    assert.equal(read.outputs.length, read.commands.length, host);
    assert.deepEqual(
      read.calls.map((call) => call.command),
      read.commands,
      host,
    );
    assert.deepEqual(
      read.calls.map((call) => call.output),
      read.outputs,
      host,
    );
    assert.ok(
      read.calls.some(
        (call) =>
          /execution-start\.mjs"? +start /.test(call.command) &&
          /^\{"ok":/.test(call.output),
      ),
      `${host} pairs the start command with its report`,
    );
  }
});

const deliveryUpdate = {
  claude:
    "claude/delivery/updated-use/20260908T033706-419d/update-events.jsonl.gz",
  codex:
    "codex/delivery/updated-use/20260908T034417-3228/update-events.jsonl.gz",
  cursor:
    "cursor/delivery/updated-use/20260908T030715-5dbe/update-events.jsonl.gz",
};

test("each host's messages end with its final response", () => {
  for (const [host, entry] of Object.entries(deliveryUpdate)) {
    const read = readHostStream(host, corpus(entry));
    assert.ok(read.messages.length > 0, host);
    assert.ok(
      read.messages.every((message) => typeof message === "string"),
      host,
    );
  }
  const codex = readHostStream("codex", corpus(deliveryUpdate.codex));
  assert.equal(codex.messages.at(-1), codex.response);
});

test("Codex and Cursor calls carry exit codes; Claude reports none", () => {
  for (const host of ["codex", "cursor"]) {
    const read = readHostStream(host, corpus(deliveryUpdate[host]));
    assert.ok(read.calls.length > 0, host);
    assert.ok(
      read.calls.every((call) => Number.isInteger(call.exitCode)),
      host,
    );
  }
  const failing = readHostStream(
    "cursor",
    corpus(
      "cursor/publication/admission-investigation/20260929T035934-4301/events.jsonl.gz",
    ),
  );
  assert.ok(failing.calls.some((call) => call.exitCode === 1));
  const claude = readHostStream(
    "claude",
    corpus(
      "claude/publication/startup-selected-source/20260923T040305-58dd/events.jsonl.gz",
    ),
  );
  assert.ok(claude.calls.every((call) => call.exitCode === null));
});

test("other tool calls, file reads, and inspection targets come per host", () => {
  const claude = readHostStream("claude", corpus(deliveryUpdate.claude));
  assert.deepEqual([...new Set(claude.tools.map((tool) => tool.name))].sort(), [
    "Glob",
    "Read",
    "Skill",
  ]);
  const skill = claude.tools.find((tool) => tool.name === "Skill");
  assert.deepEqual(skill.input, { skill: "dough-update" });
  assert.match(skill.output, /dough-update/);
  const claudeReads = claude.tools.filter((tool) => tool.name === "Read");
  assert.deepEqual(
    claude.reads,
    claudeReads.map((tool) => ({
      path: tool.input.file_path,
      content: tool.output,
    })),
  );
  // Read, Glob, and Grep inputs are targets; the Skill name is not.
  assert.ok(claude.targets.includes(".claude/skills/*"));
  assert.ok(claude.targets.includes(claudeReads[0].input.file_path));
  assert.ok(!claude.targets.includes("dough-update"));

  const cursor = readHostStream("cursor", corpus(deliveryUpdate.cursor));
  const skillRead = cursor.reads.find((read) =>
    read.path.endsWith("/dough-update/SKILL.md"),
  );
  assert.match(skillRead.content, /^---\nname: dough-update\n/);
  // Every Cursor tool call's arguments are targets; shell commands are not.
  assert.ok(cursor.targets.includes(skillRead.path));
  assert.ok(cursor.tools.every((tool) => tool.name !== "shellToolCall"));
  for (const command of cursor.commands) {
    assert.ok(!cursor.targets.includes(command));
  }

  const codex = readHostStream("codex", corpus(deliveryUpdate.codex));
  assert.deepEqual([codex.tools, codex.reads, codex.targets], [[], [], []]);
});
