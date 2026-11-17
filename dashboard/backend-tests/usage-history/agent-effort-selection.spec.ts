// How selections resolve: exact tasks, ambiguous story identities and
// retained native family windows through the documented CLI contract.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  test,
  expect,
  launch,
} from "../../tests/usage-history/retainedUsageTest.ts";
import { keepLaunchStore } from "../../tests/support/launchStore.ts";
import {
  readImported,
  runImport,
  writeCodexSession,
} from "../../tests/usage-history/importHarness.ts";
import { bytes } from "../../tests/usage-history/agentEffortHarness.ts";
import { costReport } from "../../tests/usage-history/agentEffortCost.ts";
import {
  effortCli,
  listedTasks,
  readableListing,
  reportedSelection,
  succeeded,
  type ListedTask,
} from "../../tests/usage-history/agentEffortSelection.ts";

const story = "SEED-358#reconstruct-codex-and-claude-code-usage-history";

test("an exact story identity with several tasks is refused and --list exposes the task ids that select each one", ({
  home,
  root,
}) => {
  keepLaunchStore(home, {
    "open-dough": [launch("first", "one"), launch("second", "two")],
  });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("first")
      .withResponse("one", "first-own", { output_tokens: 7 })
      .please(),
  );
  const refused = effortCli(home, ["--task", story, "--json"]);
  expect(refused.status).toBe(1);
  expect(refused.stdout).toBe("");
  expect(refused.stderr).toContain("Task selection is ambiguous");

  const catalog = listedTasks(succeeded(effortCli(home, ["--list", "--json"])));
  expect(catalog.format).toBe("agent-effort-v1");
  const storyTasks = catalog.selections.filter(
    (entry) => entry.identity === story,
  );
  expect(storyTasks.map((entry) => entry.sessionId).sort()).toEqual([
    "first",
    "second",
  ]);
  for (const entry of storyTasks) {
    expect(Object.keys(entry).sort()).toEqual([
      "host",
      "id",
      "identity",
      "launchedAt",
      "rootTurnId",
      "sessionId",
    ]);
    expect(refused.stderr).toContain(JSON.stringify(entry.id).slice(1, -1));
  }
  const readable = readableListing<ListedTask>(
    succeeded(effortCli(home, ["--list"])),
  );
  expect(readable.map((entry) => entry.id).sort()).toEqual(
    catalog.selections.map((entry) => entry.id).sort(),
  );

  const first = storyTasks.find((entry) => entry.sessionId === "first");
  if (!first) throw new Error("Expected the first session's task listed");
  const selected = JSON.parse(
    succeeded(effortCli(home, ["--task", first.id, "--json"])),
  ) as { totals: { output: { value: number | null } } };
  expect(selected.totals.output.value).toBe(7);
});

test("a native family window includes its start and excludes its end in JSON and readable output", ({
  home,
  root,
}) => {
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("family")
      .withTurnContext("turn")
      .withResponse(
        "turn",
        "before-start",
        { output_tokens: 50 },
        {
          timestamp: "2026-11-14T09:59:59.999Z",
        },
      )
      .withResponse(
        "turn",
        "at-start",
        { output_tokens: 3 },
        {
          timestamp: "2026-11-14T10:00:00.000Z",
        },
      )
      .withResponse(
        "turn",
        "at-end",
        { output_tokens: 100 },
        {
          timestamp: "2026-11-14T11:00:00.000Z",
        },
      )
      .please(),
  );
  const window = [
    "--host",
    "codex",
    "--family",
    "family",
    "--from",
    "2026-11-14T10:00:00.000Z",
    "--until",
    "2026-11-14T11:00:00.000Z",
  ];
  const json = succeeded(effortCli(home, [...window, "--json"]));
  const { totals } = JSON.parse(json) as {
    totals: {
      output: { value: number | null };
      requests: { value: number | null };
    };
  };
  expect(totals.output.value).toBe(3);
  expect(totals.requests.value).toBe(1);
  expect(reportedSelection(json).selection).toMatchObject({
    from: "2026-11-14T10:00:00.000Z",
    until: "2026-11-14T11:00:00.000Z",
    boundary: "explicit-half-open-native-family-window",
  });
  const readable = succeeded(effortCli(home, window));
  expect(readable).toContain("explicit-half-open-native-family-window");
  expect(readable).toContain('"output":{"value":3');
});

test("a native family selection without its window is refused before reading evidence", ({
  home,
}) => {
  const refused = effortCli(home, ["--host", "codex", "--family", "family"]);
  expect(refused.status).toBe(1);
  expect(refused.stderr).toContain(
    "Native --family requires --host, --from and --until",
  );
});

test("an explicit retained family remains inspectable when Usage excludes its unrelated project", ({
  home,
  root,
}) => {
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("unrelated")
      .withGit({ repository_url: "git@github.com:other/unrelated.git" })
      .withTurnContext("turn")
      .withDeveloperInput("$dough-execute-plan SEED-8#example")
      .withResponse("turn", "own", {
        input_tokens: 10,
        cached_input_tokens: 0,
        cache_write_input_tokens: 0,
        output_tokens: 3,
      })
      .please(),
  );
  const imported = runImport(home, root);
  expect(imported).toMatchObject({ excludedUnrelatedObservations: 1 });
  expect(Object.values(readImported(home).observations)).toEqual([]);
  const before = bytes(home);
  const actual = costReport(home, [
    "--host",
    "codex",
    "--family",
    "unrelated",
    "--from",
    "2026-11-14T00:00:00.000Z",
    "--until",
    "2026-11-15T00:00:00.000Z",
  ]);
  expect(actual.totals.requests.value).toBe(1);
  expect(actual.totals.totalTokens.value).toBe(13);
  expect(actual.selection.boundary).toBe(
    "explicit-half-open-native-family-window",
  );
  expect(actual.gaps).not.toContain("unrelated-project-excluded");
  expect(bytes(home)).toEqual(before);
});
