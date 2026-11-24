import { readFileSync, rmSync } from "node:fs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  readUsageHistory,
  taskUsage,
  usageHistoryFile,
} from "../../server/usageHistory.ts";
import {
  claudeUsageRoots,
  importUsageHistory,
} from "../../server/usageImport.ts";
import type { UsageResponses } from "../../server/usageResponsesFile.ts";
import {
  expect,
  test,
} from "../../test-support/usage-history/retainedUsageTest.ts";
import { configuredRepository } from "../../test-support/usage-history/recoveryHarness.ts";
import {
  recoveredTask as task,
  recordHistoricalTask as record,
} from "../../test-support/usage-history/historicalReferenceHarness.ts";

const seed = ".planning/seeds/SEED-013-old.md";
const plan = ".planning/quick/050-historical-work/PLAN.md";
const otherSeed = ".planning/seeds/SEED-014-other.md";
const identity = "SEED-013#historical-work";
const otherIdentity = "SEED-014#other-work";
const homeText = (id: string, anchor: string, title: string) =>
  `---\nid: ${id}\n---\n# Seed\n<a id="${anchor}"></a>\n### ${title}\n**Identity:** ${id}#${anchor}\n`;
const description = () =>
  makeMe.aRepository
    .withRevision("then", {
      files: {
        [seed]: homeText("SEED-013", "historical-work", "Title at execution"),
        [otherSeed]: homeText(
          "SEED-014",
          "other-work",
          "Other historical story",
        ),
        [".planning/quick/051-example/PLAN.md"]:
          "# Example plan\n```text\n## Source and outcome\n[example](../../seeds/SEED-013-old.md#historical-work)\n```\n",
        [plan]:
          "# Quick plan\n\n## Source and outcome\n\n[SEED-013 Story 1](../../seeds/SEED-013-old.md#historical-work).\n\n## Work\n",
      },
    })
    .withRevision("duplicate", {
      files: {
        ".planning/slice-plans/050-duplicate/PLAN.md": `# Plan\n**Identity:** ${otherIdentity}\n**Source:** [other](../../seeds/SEED-014-other.md#other-work)\n`,
      },
    })
    .withRevision("now", {
      remove: [seed, plan],
      files: {
        [otherSeed]: homeText(
          "SEED-014",
          "other-work",
          "Current title must not leak",
        ),
      },
    })
    .please();

test("resolves only the unique numbered historical plan and retains pinned source facts through replay and source removal", async ({
  home,
  root,
}) => {
  const options = makeMe.aUsageImportOptions
    .with({
      home,
      store: usageHistoryFile(home),
      codexRoots: [root],
      claudeRoots: claudeUsageRoots(home),
    })
    .please();
  const { store, responses } = options;
  const repo = await configuredRepository(home, description());
  const file = record(
    root,
    repo.integration,
    repo.revisions.then,
    "unique",
    "$dough-execute-plan 50\nPRIVATE-NUMERIC-PROMPT",
  );
  record(
    root,
    repo.integration,
    repo.revisions.duplicate,
    "duplicate",
    "$dough-execute-plan 050",
  );
  record(
    root,
    repo.integration,
    repo.revisions.then,
    "missing",
    "$dough-execute-plan 52",
  );
  record(
    root,
    repo.integration,
    repo.revisions.then,
    "fencedPlan",
    "$dough-execute-plan 51",
  );
  const original = readFileSync(file, "utf8");
  await importUsageHistory(options);
  const history = {
    ...(await readUsageHistory(store)),
    ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
  };
  const resolved = task(history, "unique");
  expect(resolved).toEqual(
    expect.objectContaining({
      identity,
      title: "Title at execution",
      workflow: "dough-execute-plan",
      origin: "unknown",
    }),
  );
  for (const field of ["identity", "title"])
    expect(resolved.fieldSources?.[field]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: "git",
          file: plan,
          repository: "example/historic",
          revision: repo.revisions.then,
        }),
        expect.objectContaining({
          kind: "git",
          file: seed,
          revision: repo.revisions.then,
        }),
      ]),
    );
  for (const turn of ["duplicate", "missing", "fencedPlan"])
    expect(task(history, turn)).toEqual(
      expect.objectContaining({
        identity: null,
        title: null,
        gaps: expect.arrayContaining(["unresolved-historical-story"]),
      }),
    );
  expect(taskUsage(history, resolved.id).tokens.output).toBe(7);
  expect(readFileSync(file, "utf8")).toBe(original);
  expect(JSON.stringify(history)).not.toContain("PRIVATE-NUMERIC-PROMPT");
  const saved = JSON.stringify(history);
  await importUsageHistory(options);
  expect(
    JSON.stringify({
      ...(await readUsageHistory(store)),
      ...(JSON.parse(readFileSync(responses, "utf8")) as UsageResponses),
    }),
  ).toBe(saved);
  rmSync(root, { recursive: true });
  rmSync(repo.integration, { recursive: true });
  await importUsageHistory(options);
  const withoutSources = await readUsageHistory(store);
  const { observations } = JSON.parse(
    readFileSync(responses, "utf8"),
  ) as UsageResponses;
  expect(withoutSources.tasks).toEqual(history.tasks);
  expect(withoutSources.sessions).toEqual(history.sessions);
  expect(taskUsage(withoutSources, resolved.id).tokens.output).toBe(7);
  // That import read no response.
  expect(observations).toEqual({});
  expect(withoutSources.gaps).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ code: "native-source-unavailable" }),
    ]),
  );
});
