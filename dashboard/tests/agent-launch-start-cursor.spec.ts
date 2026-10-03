// An execution launch on Cursor establishes its start before the session,
// over the page, the real installed execution-start, and a bare origin
// (./support/startOrigin.ts). The fixture `cursor-agent` on PATH prints the
// create-chat id and records argv. Claude's start spec and Codex's start spec
// stay the proofs of those hosts.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { expect, test } from "./support/cursorStart.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

const omitted = ["--model", "-w", "--worktree", "--trust", "--force", "--yolo"];

function recordsIn(stored: string | null): LaunchRecord[] {
  if (stored === null) return [];
  const document = JSON.parse(stored) as Record<string, LaunchRecord[]>;
  return document["open-dough"] ?? [];
}

test("a queued story starts Cursor execution in the dashboard workspace and the card shows that session", async ({
  page,
  dashboard,
  origin,
  cursor,
}) => {
  test.setTimeout(120_000);
  const original = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const queued = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await queued.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await expect(dialog).toHaveAccessibleName("Start execution in Cursor");
  await expect(dialog.getByRole("combobox", { name: "Model" })).toHaveValue("");
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Implement the selected slice.");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const entry = page.getByRole("article", {
    name: "Execution session",
    exact: true,
  });
  await expect(entry).toContainText("Execution started in Cursor");
  await expect(entry).toContainText("First input accepted");
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
  expect(record?.firstInput).toMatchObject({
    state: "confirmed",
    instruction: prompt,
  });
  expect(keptDuringPrompt?.firstInput?.instruction).toBe(prompt);
  expect(prompt.split("\n\n")[0]).toBe(`/dough-execute-plan ${queuedIdentity}`);
  const lines = prompt.split("\n");
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  expect(revision).not.toBe(original);
  expect(lines).toEqual(
    expect.arrayContaining([
      "Established start:",
      `- identity: ${queuedIdentity}`,
      `- workspace: ${workspace}`,
      "- branch: cursor/story-a",
      "- mode: story-branch",
      "- remote: origin",
      "- target: main",
      `- publishedSha: ${revision}`,
    ]),
  );
  expect(record?.start).toMatchObject({
    identity: queuedIdentity,
    workspace,
    branch: "cursor/story-a",
    mode: "story-branch",
    remote: "origin",
    target: "main",
    publishedSha: revision,
  });
  const [profile] = await origin.takenProfiles();
  expect(profile).toMatchObject({
    identity: queuedIdentity,
    host: "cursor",
    mode: "story-branch",
    branch: "cursor/story-a",
  });
  expect(profile).not.toHaveProperty("model");
  expect(
    execFileSync("git", ["branch", "--show-current"], {
      cwd: workspace,
      encoding: "utf8",
    }).trim(),
  ).toBe("cursor/story-a");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});
