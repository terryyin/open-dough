import path from "node:path";
import { execFileSync } from "node:child_process";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import {
  bytes,
  command,
  cursorReport,
  writeCursorTranscript,
} from "../../tests/usage-history/agentEffortHarness.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  cursorCli,
  listedCursorFamilies,
  readableListing,
  succeeded,
  type ListedCursorFamily,
} from "../../tests/usage-history/agentEffortSelection.ts";

test("Cursor names whole-family evidence when requested time boundaries are unprovable", ({
  home,
  root,
}) => {
  writeCursorTranscript(
    path.join(root, "family/family.jsonl"),
    makeMe.aCursorTranscript
      .withToolCall("TodoWrite", {})
      .withUserInput("Now start a different task in this same conversation.")
      .withToolCall("TodoWrite", {})
      .please(),
  );
  const actual = cursorReport(home, root, [
    "--from",
    "2026-11-14T00:00:00Z",
    "--until",
    "2026-11-15T00:00:00Z",
  ]);
  expect(actual.selection).toMatchObject({
    from: "2026-11-14T00:00:00Z",
    until: "2026-11-15T00:00:00Z",
    boundary: expect.stringContaining("whole-retained-directory-family"),
  });
  expect(actual.selection.appliedBoundary).toEqual({
    kind: "whole-retained-directory-family",
    from: null,
    until: null,
    nativeTurnBoundary: null,
  });
  expect(actual.workflow.todoWriteCalls).toBe(2);
  expect(actual.gaps).toContain(
    "requested-time-window-unprovable-whole-family-reported",
  );
  const readable = execFileSync(
    process.execPath,
    [
      command,
      "--home",
      home,
      "--host",
      "cursor",
      "--cursor-root",
      root,
      "--family",
      "family",
    ],
    { encoding: "utf8" },
  );
  expect(readable).toContain('"todoWriteCalls":2');
  expect(readable).toContain("whole-retained-directory-family");
  expect(readable).toContain(
    'Observed settings coverage: {"model":null,"effort":null,"serviceTier":null,"status":"unavailable"',
  );
  expect(readable).toContain("unavailable");
});

test("Cursor ambiguous families list recoverable roots and an explicit root selects the intended evidence", ({
  home,
  root,
}) => {
  const other = path.join(home, "other-project");
  writeCursorTranscript(
    path.join(root, "family/family.jsonl"),
    makeMe.aCursorTranscript.withToolCall("TodoWrite", {}).please(),
  );
  writeCursorTranscript(
    path.join(other, "family/family.jsonl"),
    makeMe.aCursorTranscript
      .withToolCall("Read", { path: "/project/PLAN.md" })
      .please(),
  );
  const before = bytes(home);
  const roots = [root, other];
  const refused = cursorCli(home, roots, ["--family", "family", "--json"]);
  expect(refused.status).toBe(1);
  expect(refused.stderr).toContain("Cursor family is ambiguous");
  const catalog = listedCursorFamilies(
    succeeded(cursorCli(home, roots, ["--list", "--json"])),
  );
  expect(catalog.format).toBe("agent-effort-v1");
  const readable = readableListing<ListedCursorFamily>(
    succeeded(cursorCli(home, roots, ["--list"])),
  );
  expect(readable).toEqual(catalog.selections);
  for (const entry of catalog.selections)
    expect(Object.keys(entry).sort()).toEqual([
      "directory",
      "host",
      "id",
      "root",
    ]);
  const selected = catalog.selections.find(
    (entry) => entry.directory === path.join(other, "family"),
  );
  if (!selected) throw new Error("Expected listed Cursor family");
  const recovered = JSON.parse(
    succeeded(
      cursorCli(home, [selected.root], ["--family", selected.id, "--json"]),
    ),
  ) as { workflow: Record<string, number | null>; gaps: string[] };
  expect(recovered.workflow).toMatchObject({
    todoWriteCalls: 0,
    readCalls: 1,
    planReads: 1,
  });
  expect(recovered.gaps).not.toContain("native-files-unavailable");
  expect(bytes(home)).toEqual(before);
});

test("Cursor missing native family evidence remains unavailable rather than zero", ({
  home,
  root,
}) => {
  const before = bytes(home);
  const actual = cursorReport(home, root);
  expect(actual.workflow.transcripts).toBeNull();
  expect(actual.workflow.workers).toBeNull();
  expect(actual.workflow.bytes).toBeNull();
  expect(actual.gaps).toContain("native-files-unavailable");
  expect(actual.totals.totalInput.value).toBeNull();
  expect(bytes(home)).toEqual(before);
});
