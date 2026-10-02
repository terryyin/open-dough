// An unattached Cursor session has no story and no start. The fixture
// `cursor-agent` on PATH prints the create-chat id and records argv. An
// empty instruction is recorded with no prompt and no skill line. A present
// instruction is the only prompt text. An empty instruction with a chosen
// model is refused before create-chat. The project still carries the real
// installed start script, and this launch does not run it. Claude's ad hoc
// specs and Codex's ad hoc spec stay the proofs of those hosts.

import { readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { startSessionField } from "./launchCardPage.ts";
import { sidebarParts } from "./sessionSidebarPage.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { expect, test } from "./support/cursorStart.ts";
import type { CursorInvocation } from "./support/fakeCursor.ts";

const omitted = ["--model", "-w", "--worktree", "--trust", "--force", "--yolo"];

function recordsIn(call: CursorInvocation): LaunchRecord[] {
  if (call.stored === null) return [];
  const document = JSON.parse(call.stored) as Record<string, LaunchRecord[]>;
  return document["open-dough"] ?? [];
}

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

for (const text of ["", "why is the CI slow?"]) {
  test(`Cursor Start session ${JSON.stringify(text)} records no story and no invented skill line`, async ({
    page,
    dashboard,
    origin,
    cursor,
  }) => {
    test.setTimeout(120_000);
    const blank = text.trim() === "";
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
    await page
      .getByRole("button", { name: "Start session in Open Dough" })
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
    await expect(dialog).toHaveAccessibleName(
      "Start a session in Open Dough in Cursor",
    );
    await expect(dialog.getByRole("combobox", { name: "Model" })).toHaveValue(
      "",
    );
    if (!blank) await startSessionField(dialog).fill(text);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();

    const recent = parts(page).recentSessions.getByRole("article");
    await expect(recent).toHaveCount(1);
    const record = keptRecord(dashboard.home);
    if (record.session.host !== "cursor") {
      throw new Error("The recorded session is not Cursor.");
    }
    const title = record.request.title;
    expect(title).toMatch(
      blank ? /^\d{1,2} \w{3}, \d\d:\d\d$/ : /^why is the CI slow\?$/,
    );
    await expect(recent.getByRole("heading")).toHaveText(title);
    await expect(recent).toContainText(cursor.sessionId);
    await expect(
      recent.getByRole("button", { name: "Open terminal" }),
    ).toHaveCount(1);
    if (blank) {
      await expect(recent).toContainText("Opened without an instruction");
      await expect(recent).toContainText("Conversation created in Cursor");
      await expect(recent).not.toContainText("First input accepted");
    } else {
      await expect(recent).toContainText("First input accepted");
      await expect(recent).toContainText("Ad hoc session started in Cursor");
    }
    await expect(
      parts(page).backlog.getByRole("article", {
        name: "Story A",
        exact: true,
      }),
    ).not.toContainText(cursor.sessionId);

    expect(record.request).toMatchObject({
      workflow: "ad-hoc",
      host: "cursor",
      title,
    });
    expect(record.request).not.toHaveProperty("identity");
    expect(record.request).not.toHaveProperty("model");
    expect(record).not.toHaveProperty("start");
    expect(record).not.toHaveProperty("preparation");
    expect(record.session).toMatchObject({
      host: "cursor",
      sessionId: cursor.sessionId,
      continuation: {
        workspace: origin.project,
        args: [
          "cursor-agent",
          "--workspace",
          origin.project,
          "--resume",
          cursor.sessionId,
        ],
      },
    });
    for (const flag of omitted) {
      expect(record.session.continuation.args).not.toContain(flag);
    }

    const calls = cursor.calls();
    const [created, prompted, ...rest] = calls;
    expect(rest).toEqual([]);
    if (created === undefined) {
      throw new Error("Cursor did not record create-chat.");
    }
    expect(created.args).toEqual(["create-chat"]);
    expect(created.executable.endsWith(`${path.sep}cursor-agent`)).toBe(true);
    expect(created.cwd).toBe(realpathSync(origin.project));
    expect(created.stored).toBeNull();
    if (blank) {
      expect(prompted).toBeUndefined();
      expect(record.firstInput).toEqual({
        state: "not-requested",
        intent: "blank",
      });
    } else {
      if (prompted === undefined) {
        throw new Error("Cursor did not record the instruction.");
      }
      const prompt = prompted.args.at(-1) ?? "";
      expect(prompt).toBe(text);
      expect(prompt).not.toContain("dough-");
      expect(prompt).not.toContain("Established ");
      expect(prompted.args).toEqual([
        "--workspace",
        origin.project,
        "--resume",
        cursor.sessionId,
        text,
      ]);
      expect(prompted.cwd).toBe(realpathSync(origin.project));
      for (const flag of omitted) expect(prompted.args).not.toContain(flag);
      const [during] = recordsIn(prompted);
      expect(during?.session).toMatchObject({
        host: "cursor",
        sessionId: cursor.sessionId,
      });
      expect(during?.firstInput).toMatchObject({
        state: "uncertain",
        instruction: text,
      });
      expect(during?.request).not.toHaveProperty("identity");
      expect(record.firstInput).toEqual({
        state: "confirmed",
        instruction: text,
      });
    }

    expect(await origin.takenProfiles()).toEqual([]);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(original);
    expect(
      Number((await origin.originGit("rev-list", "--count", "main")).trim()),
    ).toBe(commitsBefore);

    const sidebar = sidebarParts(page);
    await sidebar.button.click();
    await expect(sidebar.entries).toHaveCount(1);
    await expect(sidebar.entry(title)).toBeVisible();
    expect(cursor.calls()).toHaveLength(blank ? 1 : 2);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  });
}

test("a blank Cursor Start session with a chosen model is refused before create-chat", async ({
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
  const button = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await button.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("cursor");
  await dialog.getByRole("combobox", { name: "Model" }).selectOption("gpt-5.2");
  await expect(startSessionField(dialog)).toHaveValue("");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(page.locator(".project-actions .launch-problem")).toHaveText(
    "Launch failed: Cursor applies a chosen model with the first instruction. Add an instruction, or use your Cursor setting. Nothing was launched.",
  );
  await expect(button).toBeEnabled();
  await expect(parts(page).recentSessions.getByRole("article")).toHaveCount(0);
  expect(cursor.calls()).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});
