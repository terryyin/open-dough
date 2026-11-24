// The first write over a paged store an earlier dashboard left stores the
// history document and then removes `usage.json.pages` whole; a failure on
// either side of that leaves a readable history, and the next write finishes.
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import path from "node:path";
import { expect } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { retainedLaunchEnds } from "../../server/retainedUsageTasks.ts";
import { tokenIndexAnswer } from "../../server/tokenIndexRead.ts";
import { lastUsageCheck } from "../../server/usageCheck.ts";
import {
  readUsageHistory,
  usageHistoryFile,
  writeUsageHistory,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import { refreshUsageHistory } from "../../server/usageRefresh.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import { usageTariffs } from "../../server/usageTariffs.ts";
import { currentUsageTaskSummary } from "../../server/usageTaskSummaryCache.ts";
import { defaultCohort } from "../../src/usageTokenIndex.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";
import {
  legacyHistory,
  pagesOf,
  writePagedStore,
} from "../../test-support/usage-history/earlierStores.ts";
import {
  failing,
  importFailure,
  sessionTotals,
  writeCodexSession,
} from "../../test-support/usage-history/importHarness.ts";
import {
  launch,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import {
  finished,
  rootRollout,
} from "../../test-support/usage-history/tokenIndexHarness.ts";

const importOptions = (home: string, root: string) =>
  makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();

const unnamed = `${"f".repeat(64)}.json`;
function leaveUnnamedPage(home: string) {
  fs.writeFileSync(path.join(pagesOf(home), unnamed), JSON.stringify([]));
}
const neighbours = (home: string) => [
  `${pagesOf(home)}.kept`,
  path.join(pagesOf(home), "../reports"),
];
const neighbourFiles = (home: string) =>
  neighbours(home).map((directory) => fs.readdirSync(directory));
const pageBytes = (directory: string) =>
  fs
    .readdirSync(directory)
    .map((file) => [file, fs.readFileSync(path.join(directory, file))]);

// Seed a paged store with an unnamed page and unrelated neighbours.
// Return an empty root so later imports can only get totals from disk.
async function pagedStore(home: string, root: string) {
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
  await importAndKeepPages(home, root);
  leaveUnnamedPage(home);
  for (const neighbour of neighbours(home)) {
    fs.mkdirSync(neighbour);
    fs.writeFileSync(path.join(neighbour, "evidence.json"), "{}");
  }
  const gone = path.join(home, "native-removed");
  fs.mkdirSync(gone);
  return gone;
}

async function importAndKeepPages(home: string, root: string) {
  const options = importOptions(home, root);
  await importUsageHistory(options);
  const history = await readUsageHistory(options.store);
  const responses = JSON.parse(
    fs.readFileSync(options.responses, "utf8"),
  ) as UsageResponses;
  writePagedStore(home, legacyHistory({ ...history, ...responses }));
}

test("the first import over a paged store carries its tasks, gaps and totals into the document and removes the page directory whole, and nothing beside it", async ({
  home,
  root,
}) => {
  const gone = await pagedStore(home, root);
  const store = usageHistoryFile(home);
  const before = await readUsageHistory(store);
  expect(sessionTotals(before)).toEqual([
    ["kept", 2, 5],
    ["other", 1, 7],
    ["silent", 0, null],
  ]);
  expect(before.gaps).not.toEqual([]);
  expect(fs.readdirSync(pagesOf(home))).toContain(unnamed);

  await importUsageHistory(importOptions(home, gone));

  expect(await readUsageHistory(store)).toEqual(before);
  const document = JSON.parse(fs.readFileSync(store, "utf8")) as {
    format: string;
  };
  expect(document.format).toBe("usage-history-v2");
  expect(fs.existsSync(pagesOf(home))).toBe(false);
  expect(neighbourFiles(home)).toEqual([["evidence.json"], ["evidence.json"]]);
});

test("a page removal that fails leaves the complete document readable, and the next write removes the directory without changing the document", async ({
  home,
  root,
}) => {
  const gone = await pagedStore(home, root);
  const store = usageHistoryFile(home);
  const before = await readUsageHistory(store);

  expect(importFailure(home, gone, failing("rm", "/usage.json.pages"))).toEqual(
    { status: 1, stderr: "injected rm failure\n" },
  );

  const document = fs.readFileSync(store, "utf8");
  const { format } = JSON.parse(document) as { format: string };
  expect(format).toBe("usage-history-v2");
  expect(fs.readdirSync(pagesOf(home))).toContain(unnamed);
  expect(await readUsageHistory(store)).toEqual(before);
  // A reader takes nothing from the pages any more.
  fs.renameSync(pagesOf(home), `${pagesOf(home)}.aside`);
  expect(await readUsageHistory(store)).toEqual(before);
  fs.renameSync(`${pagesOf(home)}.aside`, pagesOf(home));

  // The writer Refresh uses, with nothing new: the bytes stay, the pages go.
  await writeUsageHistory({}, store);
  expect(fs.existsSync(pagesOf(home))).toBe(false);
  expect(fs.readFileSync(store, "utf8")).toBe(document);
  expect(neighbourFiles(home)).toEqual([["evidence.json"], ["evidence.json"]]);
});

test("a document replacement that fails leaves the paged store and every page as they were, and the next import converts it", async ({
  home,
  root,
}) => {
  const gone = await pagedStore(home, root);
  const store = usageHistoryFile(home);
  const before = await readUsageHistory(store);
  const options = importOptions(home, gone);
  const manifest = fs.readFileSync(store);
  const pages = pageBytes(pagesOf(home));
  const rename = fsPromises.rename;
  fsPromises.rename = async (source, target) => {
    if (target === store) throw new Error("injected rename failure");
    return rename(source, target);
  };
  syncBuiltinESMExports();
  try {
    await expect(importUsageHistory(options)).rejects.toThrow(
      "injected rename failure",
    );
  } finally {
    fsPromises.rename = rename;
    syncBuiltinESMExports();
  }

  expect(fs.readFileSync(store)).toEqual(manifest);
  expect(pageBytes(pagesOf(home))).toEqual(pages);
  expect(await readUsageHistory(store)).toEqual(before);

  await importUsageHistory(options);
  expect(await readUsageHistory(store)).toEqual(before);
  expect(fs.existsSync(pagesOf(home))).toBe(false);
});

test("the first Refresh over a paged store shows the same tasks and Token index values and removes the page directory", async ({
  home,
}) => {
  const sessions = path.join(home, ".codex/sessions");
  const store = usageHistoryFile(home);
  keepLaunchStore(home, { "open-dough": [finished("paged")] });
  writeCodexSession(
    path.join(sessions, "2026/11/14"),
    rootRollout("paged", 100).please(),
  );
  await importAndKeepPages(home, sessions);
  leaveUnnamedPage(home);
  const chart = async () =>
    tokenIndexAnswer(
      {
        summary: await currentUsageTaskSummary(store),
        projects: [makeMe.aPublishedSource.openDough.please()],
        launches: await retainedLaunchEnds(home),
        tariff: usageTariffs.codex,
        checkedAt: await lastUsageCheck(store),
      },
      defaultCohort,
    );
  const before = await chart();
  expect(before.tasks.map(({ identity }) => identity)).toEqual([
    "SEED-7#paged",
  ]);
  expect(fs.existsSync(pagesOf(home))).toBe(true);

  await refreshUsageHistory({ home, store });

  expect((await chart()).tasks).toEqual(before.tasks);
  expect(fs.existsSync(pagesOf(home))).toBe(false);
});
