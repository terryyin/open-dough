// The first write over a paged store an earlier dashboard left stores the
// history document and then removes `usage.json.pages` whole; a failure on
// either side of that leaves a readable history, and the next write finishes.
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { usageHistoryFile } from "../../server/usageHistory.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  legacyHistory,
  pagesOf,
  writePagedStore,
} from "../../test-support/usage-history/earlierStores.ts";
import {
  failing,
  importFailure,
  nodeProcess,
  readImported,
  runImport,
  sessionTotals,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  test,
  expect,
  launch,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  test as refreshTest,
  usageServer,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const unnamed = `${"f".repeat(64)}.json`;
/** Leaves a page no manifest names in the store's page directory. */
function leaveUnnamedPage(home: string) {
  writeFileSync(path.join(pagesOf(home), unnamed), JSON.stringify([]));
}
// Directories beside the page directory that are not the store's.
const neighbours = (home: string) => [
  `${pagesOf(home)}.kept`,
  path.join(pagesOf(home), "../reports"),
];
const neighbourFiles = (home: string) =>
  neighbours(home).map((directory) => readdirSync(directory));
const storedFormat = (home: string) =>
  (
    JSON.parse(readFileSync(usageHistoryFile(home), "utf8")) as {
      format: string;
    }
  ).format;
// What conversion carries over: tasks, gaps and each task's totals.
const carried = (home: string) => {
  const history = readImported(home);
  return {
    tasks: history.tasks,
    gaps: history.gaps,
    totals: sessionTotals(history),
  };
};

/**
 * Leaves in `home` the paged store of an import of two sessions with usage
 * and one launch without, with one page no manifest names, beside two
 * neighbouring directories that are not the store's. Returns the directory
 * the import may read from now: empty, so every total comes from the store.
 */
function pagedStore(home: string, root: string) {
  keepLaunchStore(home, {
    "open-dough": [
      launch("kept", "turn"),
      launch("other", "turn"),
      launch("silent", "turn"),
    ],
  });
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("kept")
      .withResponse("turn", "one", { output_tokens: 2 })
      .withResponse("turn", "two", { output_tokens: 3 })
      .please(),
  );
  writeCodexSession(
    root,
    makeMe.aCodexRollout
      .forSession("other")
      .withResponse("turn", "three", { output_tokens: 7 })
      .please(),
  );
  runImport(home, root);
  writePagedStore(home, legacyHistory(readImported(home)));
  leaveUnnamedPage(home);
  for (const neighbour of neighbours(home)) {
    mkdirSync(neighbour);
    writeFileSync(path.join(neighbour, "evidence.json"), "{}");
  }
  const gone = path.join(home, "native-removed");
  mkdirSync(gone);
  return gone;
}

test("the first import over a paged store carries its tasks, gaps and totals into the document and removes the page directory whole, and nothing beside it", ({
  home,
  root,
}) => {
  const gone = pagedStore(home, root);
  const before = carried(home);
  expect(before.totals).toEqual([
    ["kept", 2, 5],
    ["other", 1, 7],
    ["silent", 0, null],
  ]);
  expect(before.gaps).not.toEqual([]);
  expect(readdirSync(pagesOf(home))).toContain(unnamed);

  runImport(home, gone);

  expect(carried(home)).toEqual(before);
  expect(storedFormat(home)).toBe("usage-history-v2");
  expect(existsSync(pagesOf(home))).toBe(false);
  expect(neighbourFiles(home)).toEqual([["evidence.json"], ["evidence.json"]]);
});

test("a page removal that fails leaves the complete document readable, and the next write removes the directory without changing the document", ({
  home,
  root,
}) => {
  const gone = pagedStore(home, root);
  const before = carried(home);

  expect(
    importFailure(home, gone, failing("rm", "/usage.json.pages")),
  ).toMatchObject({
    status: 1,
    stderr: expect.stringContaining("injected rm failure"),
  });

  const document = readFileSync(usageHistoryFile(home), "utf8");
  expect(storedFormat(home)).toBe("usage-history-v2");
  expect(readdirSync(pagesOf(home))).toContain(unnamed);
  expect(carried(home)).toEqual(before);
  // A reader takes nothing from the pages any more.
  renameSync(pagesOf(home), `${pagesOf(home)}.aside`);
  expect(carried(home)).toEqual(before);
  renameSync(`${pagesOf(home)}.aside`, pagesOf(home));

  // The writer Refresh uses, with nothing new: the bytes stay, the pages go.
  nodeProcess(
    home,
    `const { writeUsageHistory } = await import('./dashboard/server/usageHistory.ts');
     await writeUsageHistory({});`,
  );
  expect(existsSync(pagesOf(home))).toBe(false);
  expect(readFileSync(usageHistoryFile(home), "utf8")).toBe(document);
  expect(neighbourFiles(home)).toEqual([["evidence.json"], ["evidence.json"]]);
});

test("a document replacement that fails leaves the paged store and every page as they were, and the next import converts it", ({
  home,
  root,
}) => {
  const gone = pagedStore(home, root);
  const before = carried(home);
  const manifest = readFileSync(usageHistoryFile(home), "utf8");
  const pages = readdirSync(pagesOf(home));

  expect(
    importFailure(home, gone, failing("rename", "/usage.json")),
  ).toMatchObject({
    status: 1,
    stderr: expect.stringContaining("injected rename failure"),
  });

  expect(readFileSync(usageHistoryFile(home), "utf8")).toBe(manifest);
  expect(readdirSync(pagesOf(home))).toEqual(pages);
  expect(carried(home)).toEqual(before);

  runImport(home, gone);
  expect(carried(home)).toEqual(before);
  expect(existsSync(pagesOf(home))).toBe(false);
});

refreshTest(
  "the first Refresh over a paged store shows the same tasks and Token index values and removes the page directory",
  async ({ machine }) => {
    const { home } = machine;
    const sessions = path.join(home, ".codex/sessions");
    keepLaunchStore(home, {
      "open-dough": [
        makeMe.aLaunchRecord
          .executing({ identity: "SEED-7#paged", title: "Paged story" })
          .inCodexSession({ sessionId: "paged" })
          .launchedAt("2026-11-14T09:00:00.000Z")
          .withFirstInput({ state: "confirmed", turnId: "turn" })
          .completedWith({ message: "" })
          .please(),
      ],
    });
    writeCodexSession(
      path.join(sessions, "2026/11/14"),
      makeMe.aCodexRollout
        .forSession("paged")
        .withTurnContext("turn", "gpt-6.1-sol", "xhigh")
        .withResponse("turn", "one", {
          input_tokens: 10_000,
          cached_input_tokens: 8_000,
          cache_write_input_tokens: 0,
          output_tokens: 100,
        })
        .please(),
    );
    runImport(home, sessions);
    writePagedStore(home, legacyHistory(readImported(home)));
    leaveUnnamedPage(home);
    const usage = await usageServer(machine);
    const before = await usage.chart();
    expect(before.tasks.map(({ identity }) => identity)).toEqual([
      "SEED-7#paged",
    ]);
    expect(existsSync(pagesOf(home))).toBe(true);

    await usage.refresh();

    expect((await usage.chart()).tasks).toEqual(before.tasks);
    expect(existsSync(pagesOf(home))).toBe(false);
  },
);
