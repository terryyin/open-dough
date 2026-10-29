import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { startSessionField } from "./launchStoryCardPage.ts";
import { expect, keptRecord, test } from "./support/cursorStart.ts";
import {
  cursorEffortModels,
  cursorModels,
  cursorOtherEffortModels,
} from "./support/fakeCursor.ts";
import { launchWaitMs } from "./support/launchWait.ts";

const effortListing = [
  ...cursorModels,
  ...cursorEffortModels,
  ...cursorOtherEffortModels,
];

test("a multi-effort Cursor model lists effort choices and Start sends the composed listed id", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  cursor.listModels(effortListing);
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  const models = dialog.getByRole("combobox", { name: "Model" });
  await expect(models.locator("option")).toHaveText([
    "Default (your Cursor setting)",
    "Auto (default)",
    "GPT-5.2",
    "Fixture Orb Low",
    "Fixture Luna Medium",
  ]);
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await expect(effort).toBeVisible();
  await expect(effort).toBeDisabled();
  await expect(effort).toHaveAccessibleDescription(
    "Choose a specific model to select reasoning effort.",
  );
  await startSessionField(dialog).fill("why is the CI slow?");
  await models.selectOption("auto");
  await expect(effort).toBeDisabled();
  await expect(effort).toHaveAccessibleDescription(
    "Choose a specific model to select reasoning effort.",
  );
  await models.selectOption("fixture-orb");
  await expect(effort).toBeEnabled();
  await expect(effort.locator("option")).toHaveText([
    "Choose a listed effort",
    "low — Fixture Orb Low",
    "high — Fixture Orb High",
    "high-fast — Fixture Orb High Fast",
  ]);
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await effort.selectOption("high");
  await models.selectOption("");
  await expect(effort).toBeDisabled();
  await expect(effort).toHaveValue("");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await models.selectOption("fixture-orb");
  await effort.selectOption("high");
  await models.selectOption("auto");
  await expect(effort).toBeDisabled();
  await expect(effort).toHaveValue("");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await models.selectOption("fixture-orb");
  await effort.selectOption("high");
  await models.selectOption("gpt-5.2");
  await expect(effort).toBeDisabled();
  await expect(effort).toHaveValue("");
  await expect(effort).toHaveAccessibleDescription(
    "This model does not offer reasoning effort choices.",
  );
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
  await models.selectOption("fixture-orb");
  await expect(effort).toBeEnabled();
  await effort.selectOption("high-fast");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(parts(page).taken.locator(".session-entry")).toContainText(
    "First input accepted",
    { timeout: launchWaitMs },
  );
  const client = cursor.attaches()[0];
  if (client === undefined) {
    throw new Error("Cursor did not start a terminal client.");
  }
  expect(client.args).toEqual([
    "--workspace",
    origin.project,
    "--resume",
    cursor.sessionId,
    "--model",
    "fixture-orb-high-fast",
  ]);
  expect(keptRecord(dashboard.home).request).toMatchObject({
    model: "fixture-orb",
    effort: "high-fast",
  });
});

test("switching Cursor model retains unsupported effort as invalid and blocks Start", async ({
  page,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  cursor.listModels(effortListing);
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
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  const models = dialog.getByRole("combobox", { name: "Model" });
  const effort = dialog.getByLabel("Reasoning effort", { exact: true });
  await models.selectOption("fixture-orb");
  await effort.selectOption("high");
  await models.selectOption("fixture-luna");
  await expect(effort).toHaveValue("high");
  await expect(effort).toHaveAttribute("aria-invalid", "true");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeDisabled();
  await expect(dialog).toContainText("cannot be verified");
  await effort.selectOption("medium");
  await expect(effort).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeEnabled();
});

test("Cursor effort admission refuses unsupported pairs and accepts a composed listed id", async ({
  dashboard,
  cursor,
}) => {
  cursor.listModels(effortListing);
  const unsupported = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "fixture-orb",
    effort: "medium",
    instruction: "Do work",
  });
  expect(unsupported.status).toBe(400);
  expect(JSON.parse(unsupported.body)).toMatchObject({
    error: expect.stringContaining("reasoning effort"),
  });
  expect(cursor.calls()).toEqual([]);

  const missingEffort = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "fixture-orb",
    instruction: "Do work",
  });
  expect(missingEffort.status).toBe(400);
  expect(cursor.calls()).toEqual([]);

  const ok = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "fixture-orb",
    effort: "low",
    instruction: "Do work",
  });
  expect(JSON.parse(ok.body)).toMatchObject({ kind: "launched" });
  const client = cursor.attaches()[0];
  expect(client?.args).toEqual([
    "--workspace",
    expect.any(String),
    "--resume",
    cursor.sessionId,
    "--model",
    "fixture-orb-low",
  ]);
  expect(keptRecord(dashboard.home).request).toMatchObject({
    model: "fixture-orb",
    effort: "low",
  });
});
