import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { test, expect } from "../../tests/usage-history/retainedUsageTest.ts";
import { report, bytes } from "../../tests/usage-history/agentEffortHarness.ts";
import { writeCodexSession, runImport, readImported } from "../../tests/usage-history/importHarness.ts";

test("an explicit retained family remains inspectable when Usage excludes its unrelated project", ({ home, root }) => {
  writeCodexSession(root, makeMe.aCodexRollout.forSession("unrelated").withGit({ repository_url: "git@github.com:other/unrelated.git" }).withTurnContext("turn").withDeveloperInput("$dough-execute-plan SEED-8#example").withResponse("turn", "own", { input_tokens: 10, cached_input_tokens: 0, cache_write_input_tokens: 0, output_tokens: 3 }).please());
  const imported = runImport(home, root);
  expect(imported).toMatchObject({ excludedUnrelatedObservations: 1 });
  expect(Object.values(readImported(home).observations)).toEqual([]);
  const before = bytes(home);
  const actual = report(home, root, ["--host", "codex", "--family", "unrelated", "--from", "2026-11-14T00:00:00.000Z", "--until", "2026-11-15T00:00:00.000Z"]);
  expect(actual.totals.requests.value).toBe(1);
  expect(actual.totals.totalTokens.value).toBe(13);
  expect(actual.selection.boundary).toBe("explicit-half-open-native-family-window");
  expect(actual.gaps).not.toContain("unrelated-project-excluded");
  expect(bytes(home)).toEqual(before);
});
