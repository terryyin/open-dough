// Catalog interaction cases registered by agent-launch-codex-model.spec.ts.
import { existsSync } from "node:fs";
import path from "node:path";
import { test, expect, stored } from "./support/codexStart.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";

test("slow/unavailable discovery retains focus, retry works, host changes and fresh openings reset; cancel creates nothing", async ({
  page,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const open = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await open.click();
  const dialog = page.getByRole("dialog");
  codexProtocol.holdCatalog = true;
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog.getByRole("textbox").focus();
  await expect(dialog).toContainText("Reading Codex model choices");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  codexProtocol.catalogError = { code: -32000, message: "Unavailable" };
  codexProtocol.holdCatalog = false;
  codexProtocol.release();
  await expect(
    dialog.getByRole("button", { name: "Retry model choices" }),
  ).toBeVisible();
  await expect(dialog.getByRole("textbox")).toBeFocused();
  await expect(
    dialog.getByLabel("Reasoning effort", { exact: true }),
  ).toHaveValue("");
  await expect(dialog.getByLabel("Host", { exact: true })).toHaveValue("codex");
  codexProtocol.catalogError = undefined;
  await dialog.getByRole("button", { name: "Retry model choices" }).click();
  await expect(
    dialog.getByLabel("Model", { exact: true }).locator("option"),
  ).toHaveCount(3);
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("ultra");
  await dialog.getByLabel("Host", { exact: true }).selectOption("claude");
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-sol");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await open.click();
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await page.keyboard.press("Escape");
  expect(
    codexProtocol.calls.filter((c) =>
      ["thread/start", "turn/start"].includes(c.method),
    ),
  ).toEqual([]);
});

test("a vanished explicit model is explained; deliberate default and former dynamic labels remain safe in the real UI", async ({
  page,
  dashboard,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  const dynamicId = "<img src=x onerror=alert(1)>";
  const dynamic = {
    model: dynamicId,
    displayName: "Native dynamic model",
    description: "Host description",
    supportedReasoningEfforts: [],
  };
  codexProtocol.models = [dynamic];
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const open = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  const dialog = page.getByRole("dialog");
  await open.click();
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await dialog.getByLabel("Model", { exact: true }).selectOption(dynamicId);
  codexProtocol.models = [];
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator(".start-session-answer")).toContainText(
    "no longer available",
  );
  expect(
    codexProtocol.calls.filter((c) => c.method === "thread/start"),
  ).toEqual([]);
  await open.click();
  await expect(dialog.getByLabel("Model", { exact: true })).toHaveValue("");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() =>
      existsSync(
        path.join(dashboard.home, ".open-dough/dashboard/agent-launches.json"),
      )
        ? stored(dashboard.home)[0]?.firstInput?.state
        : undefined,
    )
    .toBe("not-requested");
  await page
    .getByRole("region", { name: "Terminal" })
    .getByRole("button", { name: "Close", exact: true })
    .click();
  expect(stored(dashboard.home)[0]?.request).not.toHaveProperty("model");
  codexProtocol.models = [dynamic];
  codexProtocol.threadId = "dynamic-model-thread";
  codexProtocol.history = [];
  await open.click();
  await dialog.getByLabel("Model", { exact: true }).selectOption(dynamicId);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(() => stored(dashboard.home)[1]?.firstInput?.state)
    .toBe("not-requested");
  codexProtocol.models = [];
  await page.reload();
  await expect(parts(page).recentlyDone).toContainText(
    `Model: ${dynamicId} (requested)`,
  );
  await expect(page.locator("img[src=x]")).toHaveCount(0);
});

test("a late catalog reply cannot replace another host's current options", async ({
  page,
  origin,
  codexProtocol: fixture,
}) => {
  if (!fixture) throw new Error("Native fixture missing");
  const codexProtocol = fixture;
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  codexProtocol.holdCatalog = true;
  await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
  await expect
    .poll(() => codexProtocol.calls.some((c) => c.method === "model/list"))
    .toBe(true);
  await dialog.getByLabel("Host", { exact: true }).selectOption("claude");
  codexProtocol.holdCatalog = false;
  codexProtocol.release();
  await expect(
    dialog.getByLabel("Model", { exact: true }).locator("option"),
  ).toHaveText([
    "Default (your Claude Code setting)",
    "Fable",
    "Opus",
    "Sonnet",
  ]);
  await page.keyboard.press("Escape");
});

test.describe("project catalog isolation", () => {
  test.use({ projectFolders: ["open-dough", "doughnut"] });
  test("a late reply from the previous project cannot replace the current project's choices", async ({
    page,
    origin,
    codexProtocol: fixture,
  }) => {
    if (!fixture) throw new Error("Native fixture missing");
    const codexProtocol = fixture;
    await publishCommittedOrigin(page, {
      repoDir: origin.origin,
      revision: (await origin.originGit("rev-parse", "main")).trim(),
      repository: "terryyin/open-dough",
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    codexProtocol.models = codexProtocol.models.slice(0, 1);
    codexProtocol.holdCatalog = true;
    await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
    await expect
      .poll(() => codexProtocol.calls.some((c) => c.method === "model/list"))
      .toBe(true);
    await page.keyboard.press("Escape");
    await page.getByRole("radio", { name: "Doughnut", exact: true }).check();
    codexProtocol.models = [
      {
        model: "project-luna",
        displayName: "Project Luna",
        description: "Current catalog",
        supportedReasoningEfforts: [],
      },
    ];
    codexProtocol.holdCatalog = false;
    await page
      .getByRole("button", { name: "Start session in Doughnut" })
      .click();
    await dialog.getByLabel("Host", { exact: true }).selectOption("codex");
    await expect(
      dialog.getByLabel("Model", { exact: true }).locator("option"),
    ).toHaveText(["Use Codex setting", "Project Luna"]);
    codexProtocol.release();
    await expect(
      dialog.getByLabel("Model", { exact: true }).locator("option"),
    ).toHaveText(["Use Codex setting", "Project Luna"]);
    await page.keyboard.press("Escape");
  });
});
