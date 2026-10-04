// Cursor's Model menu lists `cursor-agent models` after Default, over the
// page, the real installed execution-start, and a bare origin. The fixture
// `cursor-agent` on PATH prints the configured listing in the observed
// layout, or fails, and records launch argv apart from model reads. The
// Cursor start, preparation, and ad hoc specs stay the proofs that Default
// sends no `--model`.

import { readFileSync } from "node:fs";
import path from "node:path";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { startSessionField } from "./launchCardPage.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { expect, test } from "./support/cursorStart.ts";
import { cursorModels } from "./support/fakeCursor.ts";
import { stayedUp } from "./support/keptCursorTurn.ts";
import { expectAdHocReportingInput } from "./support/reportingInputAssertions.ts";

const savedNote =
  "Cursor also saves a chosen model as your Cursor setting for later sessions.";

function keptRecord(home: string): LaunchRecord {
  const kept = JSON.parse(
    readFileSync(
      path.join(home, ".open-dough", "dashboard", "agent-launches.json"),
      "utf8",
    ),
  ) as Record<string, LaunchRecord[]>;
  const [record] = kept["open-dough"] ?? [];
  if (record === undefined) throw new Error("No Cursor session was recorded.");
  return record;
}

test("execution on a Cursor-listed model sends it on the prompted run only and discloses Cursor's saved setting", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
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
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  const models = dialog.getByRole("combobox", { name: "Model" });
  await expect(models.locator("option")).toHaveText([
    "Default (your Cursor setting)",
    "Auto (default)",
    "GPT-5.2",
  ]);
  expect(
    await models
      .locator("option")
      .evaluateAll((options) => options.map((option) => option.textContent)),
  ).toEqual(["Default (your Cursor setting)", "Auto (default)", "GPT-5.2"]);
  await expect(dialog).toContainText(
    "Cursor starts with your current Cursor model setting.",
  );
  await expect(dialog).not.toContainText(savedNote);
  await models.selectOption("gpt-5.2");
  await expect(dialog).toContainText(savedNote);
  expect(cursor.calls()).toEqual([]);
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Implement the selected slice.");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const entry = page.getByRole("article", {
    name: "Execution session",
    exact: true,
  });
  await expect(entry).toContainText("First input accepted");
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const client = cursor.attaches()[0];
  if (client === undefined) {
    throw new Error("Cursor did not start a terminal client.");
  }
  const prompt = cursor.input(client.pid).replace(/\r$/u, "");
  expect(prompt.split("\n\n")[0]).toMatch(/^\/dough-execute-plan /);
  expect(client.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
    "--model",
    "gpt-5.2",
  ]);
  const record = keptRecord(dashboard.home);
  expect(record.request.model).toBe("gpt-5.2");
  expect(record.session).toMatchObject({
    host: "cursor",
    continuation: {
      workspace,
      args: [
        "cursor-agent",
        "--workspace",
        workspace,
        "--resume",
        cursor.sessionId,
      ],
    },
  });
  await stayedUp(cursor, client.pid, 500);
  await entry.getByRole("button", { name: "Open terminal" }).click();
  await expect.poll(() => cursor.attaches()).toHaveLength(1);
  expect(cursor.attaches()[0]?.pid).toBe(client.pid);
  expect(cursor.attaches()[0]?.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
    "--model",
    "gpt-5.2",
  ]);
  expect(await origin.takenProfiles()).toEqual([
    expect.objectContaining({ host: "cursor", model: "gpt-5.2" }),
  ]);
  expect(cursor.modelReads().length).toBeGreaterThanOrEqual(2);
  for (const read of cursor.modelReads()) expect(read.args).toEqual(["models"]);
});

test("an unreadable Cursor list is explained, Retry rereads it, and Default still starts", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  cursor.listModels(undefined);
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
  const unreadable =
    "Cursor model choices could not be read. Retry, or use your Cursor setting.";
  const retry = dialog.getByRole("button", { name: "Retry model choices" });
  await expect(dialog).toContainText(unreadable);
  const models = dialog.getByRole("combobox", { name: "Model" });
  await expect(models.locator("option")).toHaveText([
    "Default (your Cursor setting)",
  ]);
  const failedReads = cursor.modelReads().length;

  cursor.listModels(cursorModels);
  await retry.click();
  await expect(models.locator("option")).toHaveText([
    "Default (your Cursor setting)",
    "Auto (default)",
    "GPT-5.2",
  ]);
  expect(cursor.modelReads().length).toBe(failedReads + 1);

  cursor.listModels(undefined);
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await expect(dialog).toContainText(unreadable);
  await expect(models).toHaveValue("");
  await startSessionField(dialog).fill("why is the CI slow?");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(parts(page).recentSessions.getByRole("article")).toContainText(
    "First input accepted",
  );
  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  const client = cursor.attaches()[0];
  if (client === undefined) {
    throw new Error("Cursor did not start a terminal client.");
  }
  const prompt = cursor.input(client.pid).replace(/\r$/u, "");
  expectAdHocReportingInput(
    prompt,
    "why is the CI slow?",
    keptRecord(dashboard.home).request,
    dashboard,
  );
  expect(client.args).toEqual([
    "--workspace",
    origin.project,
    "--resume",
    cursor.sessionId,
  ]);
  expect(keptRecord(dashboard.home).request).not.toHaveProperty("model");
});

test("a launch naming a model Cursor does not list is refused before create-chat", async ({
  dashboard,
  cursor,
}) => {
  const refused = await launch(dashboard, {
    source: "open-dough",
    host: "cursor",
    workflow: "ad-hoc",
    model: "not-a-listed-model",
    instruction: "Do work",
  });
  expect(refused.status).toBe(400);
  expect(JSON.parse(refused.body)).toMatchObject({
    error:
      "The selected Cursor model is no longer available. Choose another model or use your Cursor setting.",
  });
  expect(cursor.modelReads()).toHaveLength(1);
  expect(cursor.calls()).toEqual([]);
});
