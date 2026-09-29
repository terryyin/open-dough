// The reader's contract beyond what corpus replay (tests/native-stream-replay.sh)
// covers: missing and unknown streams, separator splitting, and each host's
// command outputs, paired with their commands, on a real recorded stream.
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
  }
  // A line cut mid-write leaves the whole stream unreadable, as for jq -s.
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
