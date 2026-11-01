// Real dialogs, stores and native requests: the story shape starts installed
// work; the ad-hoc shape and catalog-only cases read the worker's launch
// journey. The substitute supplies catalog pages and native identities, never
// dashboard records. Refinement's selection survives its retained start in
// agent-launch-preparation-codex.spec.ts.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { test, expect, stored } from "./support/codexStart.ts";
import { test as journeyTest } from "./support/codexLaunch.ts";
import type { FakeCodex } from "./support/fakeCodex.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { openTakenBacklog } from "./launchStoryCardPage.ts";

// Chooses Native Luna at low effort from a catalog read one page at a time.
async function chooseLuna(page: Page) {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  const models = dialog.getByLabel("Model", { exact: true });
  await expect(models.locator("option")).toHaveText([
    "Use Codex setting",
    "Native Sol",
    "Native Luna",
  ]);
  await models.selectOption("native-luna");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("low");
  await expect(dialog).toContainText("Host supplied Luna description");
  return dialog.getByRole("button", { name: "Start", exact: true });
}

// The one launch record and native creation carry the chosen model and effort.
async function expectLunaCreation(
  home: string,
  codexProtocol: FakeCodex,
  workspace: string,
  firstInput: "confirmed" | "not-requested",
) {
  await expect
    .poll(
      () =>
        existsSync(path.join(home, ".open-dough/dashboard/agent-launches.json"))
          ? stored(home)[0]?.firstInput?.state
          : undefined,
      { timeout: 30_000 },
    )
    .toBe(firstInput);
  const record = stored(home)[0];
  expect(record?.request.model).toBe("native-luna");
  expect(record?.request.effort).toBe("low");
  expect(
    codexProtocol.calls.filter((c) => c.method === "thread/start"),
  ).toEqual([
    {
      method: "thread/start",
      params: {
        cwd: workspace,
        model: "native-luna",
        config: { model_reasoning_effort: "low" },
      },
    },
  ]);
  expect(
    codexProtocol.calls.some(
      (c) => c.method === "model/list" && c.params["cursor"] === "1",
    ),
  ).toBe(true);
  return record;
}

test("execution chooses a discovered model before preparation and native creation", async ({
  page,
  dashboard,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  codexProtocol.modelPageSize = 1;
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await parts(page)
    .backlog.getByRole("article", { name: "Story A", exact: true })
    .getByRole("button", { name: "Start execution" })
    .click();
  const start = await chooseLuna(page);
  codexProtocol.beforeInput = () => {
    const starts: unknown = JSON.parse(
      readFileSync(
        path.join(
          dashboard.home,
          ".open-dough/dashboard/execution-starts.json",
        ),
        "utf8",
      ),
    );
    expect(starts).toMatchObject({
      "open-dough": { "SEED-A#a": { model: "native-luna", effort: "low" } },
    });
  };
  await start.click();
  const workspace = path.join(origin.project, ".worktrees/story-a");
  const record = await expectLunaCreation(
    dashboard.home,
    codexProtocol,
    workspace,
    "confirmed",
  );
  expect(await origin.takenProfiles()).toEqual([
    expect.objectContaining({ host: "codex", model: "native-luna" }),
  ]);
  expect(record?.start?.workspace).toBe(workspace);
});

journeyTest(
  "ad-hoc chooses a discovered model before native creation",
  async ({ page, dashboard, launchJourney, codexProtocol: fixture }) => {
    if (!fixture) throw new Error("Native fixture missing");
    const codexProtocol = fixture;
    codexProtocol.modelPageSize = 1;
    await openTakenBacklog(page, launchJourney);
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    await (await chooseLuna(page)).click();
    const record = await expectLunaCreation(
      dashboard.home,
      codexProtocol,
      path.join(dashboard.home, "git", "open-dough"),
      "not-requested",
    );
    expect(
      codexProtocol.calls.filter((c) => c.method === "turn/start"),
    ).toEqual([]);
    expect(record?.firstInput).toMatchObject({
      state: "not-requested",
      intent: "blank",
    });
  },
);

import "./codexModelCatalogCases.ts";

import "./codexEffortDialogCases.ts";

import "./codexEffortWorkspaceCases.ts";
