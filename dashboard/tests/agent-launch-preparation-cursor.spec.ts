import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
// A refinement launch on Cursor establishes its preparation before the
// session, over the page, the real installed preparation start, and a bare
// origin (./support/startOrigin.ts). The fixture `cursor-agent` on PATH
// prints the create-chat id and records argv. The published Preparing
// assignment, not the launch record, is what places the story. Claude's
// preparation specs and Codex's preparation spec stay the proofs of those
// hosts.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { expect, test } from "./support/cursorStart.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

const omitted = ["--model", "-w", "--worktree", "--trust", "--force", "--yolo"];
const instruction = "Focus on the examples.";

function recordsIn(stored: string | null): LaunchRecord[] {
  if (stored === null) return [];
  const document = JSON.parse(stored) as Record<string, LaunchRecord[]>;
  return document["open-dough"] ?? [];
}

test("a queued story starts Cursor refinement and the published assignment is what shows it being prepared", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const original = (await origin.originGit("rev-parse", "main")).trim();
  const commitsBefore = Number(
    (await origin.originGit("rev-list", "--count", "main")).trim(),
  );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await card.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await expect(dialog).toHaveAccessibleName("Start refinement in Cursor");
  await expect(dialog.getByRole("combobox", { name: "Model" })).toHaveValue("");
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill(instruction);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const entry = page.getByRole("article", {
    name: "Refinement session",
    exact: true,
  });
  await expect(entry).toContainText("Refinement started in Cursor", {
    timeout: launchWaitMs,
  });
  await expect(entry).toContainText("First input accepted", {
    timeout: launchWaitMs,
  });
  await expect(entry).toContainText(cursor.sessionId);
  await expect(
    entry.getByRole("button", { name: "Open terminal" }),
  ).toHaveCount(1);

  expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
  const created = cursor.calls()[0];
  if (created === undefined) {
    throw new Error("Cursor did not record create-chat.");
  }
  expect(created.executable.endsWith(`${path.sep}cursor-agent`)).toBe(true);
  expect(created.stored).toBeNull();
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const client = cursor.attaches()[0];
  if (client === undefined) {
    throw new Error("Cursor did not start a terminal client.");
  }
  const [keptDuringPrompt] = recordsIn(client.stored);
  expect(keptDuringPrompt?.session).toMatchObject({
    host: "cursor",
    sessionId: cursor.sessionId,
  });
  expect(keptDuringPrompt?.firstInput?.state).toBe("uncertain");

  const kept = JSON.parse(
    readFileSync(
      path.join(
        dashboard.home,
        ".open-dough",
        "dashboard",
        "agent-launches.json",
      ),
      "utf8",
    ),
  ) as Record<string, LaunchRecord[]>;
  const [record] = kept["open-dough"] ?? [];
  const prompt = cursor.input(client.pid).replace(/\r$/u, "");
  expect(client.executable.endsWith(`${path.sep}cursor-agent`)).toBe(true);
  expect(client.args).toEqual([
    "--workspace",
    workspace,
    "--resume",
    cursor.sessionId,
  ]);
  expect(record?.session).toMatchObject({
    host: "cursor",
    sessionId: cursor.sessionId,
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
  for (const flag of omitted) {
    expect(client.args).not.toContain(flag);
    expect(
      record?.session.host === "cursor" ? record.session.continuation.args : [],
    ).not.toContain(flag);
  }
  expect(record?.request).not.toHaveProperty("model");
  expect(record?.request).toMatchObject({
    workflow: "refinement",
    host: "cursor",
    identity: queuedIdentity,
  });
  expect(record?.firstInput).toMatchObject({
    state: "confirmed",
    instruction: prompt,
  });
  expect(keptDuringPrompt?.firstInput?.instruction).toBe(prompt);
  const [skill, block, reporting, developer, ...extra] = prompt.split("\n\n");
  expect(extra).toEqual([]);
  expectReportingBlock(reporting, record?.request, dashboard);
  expect(skill).toBe(`/dough-story-refinement ${queuedIdentity}`);
  expect(developer).toBe(instruction);
  expect(prompt).not.toContain("dough-execute-plan");
  expect(block?.match(/Established preparation:/g)).toHaveLength(1);
  const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
  expect(publishedSha).not.toBe(original);
  const [profile] = await origin.takenProfiles();
  expect(profile).toMatchObject({
    identity: queuedIdentity,
    activity: "preparation",
    host: "cursor",
  });
  expect(profile).not.toHaveProperty("model");
  expect(profile).not.toHaveProperty("mode");
  expect(profile).not.toHaveProperty("branch");
  const agent = String(profile?.["agent"]);
  for (const line of [
    `- identity: ${queuedIdentity}`,
    `- workspace: ${workspace}`,
    "- branch: cursor/story-a",
    `- agent: ${agent}`,
    "- remote: origin",
    "- target: main",
    `- publishedSha: ${publishedSha}`,
    `- integration checkout: ${origin.project}`,
  ]) {
    expect(block).toContain(line);
  }
  expect(record).not.toHaveProperty("start");
  expect(record?.preparation).toEqual({
    identity: queuedIdentity,
    workspace,
    branch: "cursor/story-a",
    remote: "origin",
    target: "main",
    publishedSha,
    agent,
  });
  expect(
    execFileSync(
      "git",
      [
        "-C",
        workspace,
        "rev-parse",
        "refs/worktree/dough/preparation-assignment",
      ],
      { encoding: "utf8" },
    ).trim(),
  ).toBe(publishedSha);
  expect(
    Number((await origin.originGit("rev-list", "--count", "main")).trim()),
  ).toBe(commitsBefore + 1);
  expect(
    execFileSync("git", ["branch", "--show-current"], {
      cwd: workspace,
      encoding: "utf8",
    }).trim(),
  ).toBe("cursor/story-a");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  await page.reload();
  const prepared = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await expect(prepared).toBeVisible();
  await expect(
    parts(page).taken.getByRole("article", { name: "Story A", exact: true }),
  ).toHaveCount(0);
  await expect(prepared.locator(".preparing-activity")).toHaveText("Preparing");
  await expect(prepared).toContainText("Being prepared");
  await expect(
    prepared.getByRole("article", { name: "Refinement session" }),
  ).toContainText(cursor.sessionId);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    publishedSha,
  );
  expect(cursor.calls()).toHaveLength(1);
});
