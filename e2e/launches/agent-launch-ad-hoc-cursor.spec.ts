import { expectAdHocReportingInput } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
// Cursor opens in the borrowed checkout after the origin accepts its Taken
// story. The synthetic cursor-agent records create-chat and first input.
// A blank launch with a chosen model is refused before either effect. The
// fixture paints a working turn, so the client is still running when
// the page opens the terminal, however long that opening takes; an idle
// screen would be hung up after its settle period and replaced. The server
// starts as a deployment's does, and its Cursor runner, create-chat, and the
// kept client run without its start-up additions
// (../../dashboard/test-support/support/launchEnvironment.ts).

import { realpathSync } from "node:fs";
import path from "node:path";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
import { admittedStory } from "../../dashboard/test-support/support/isolatedSessionAdmissionProof.ts";
import {
  startSessionField,
  startedSession,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import { sessionsSidebarParts } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  deploymentCursorTest as test,
  expect,
  keptRecord,
} from "../../dashboard/test-support/support/cursorStart.ts";
import { runnerEnvironment } from "../../dashboard/test-support/support/cursorRunnerJourney.ts";
import { fakeCursorHost } from "../../dashboard/test-support/support/fakeCursor.ts";
import { expectDeveloperShellEnvironment } from "../../dashboard/test-support/support/launchEnvironment.ts";
import { openTerminalControl } from "../../dashboard/test-support/terminalScreenPage.ts";

const omitted = ["--model", "-w", "--worktree", "--trust", "--force", "--yolo"];

function recordsIn(stored: string | null): LaunchRecord[] {
  if (stored === null) return [];
  const document = JSON.parse(stored) as Record<string, LaunchRecord[]>;
  return document["open-dough"] ?? [];
}

for (const text of ["", "why is the CI slow?"]) {
  test(`Cursor Start session ${JSON.stringify(text)} publishes its Taken story and no invented skill line`, async ({
    page,
    dashboard,
    origin,
    cursor,
  }) => {
    const blank = text.trim() === "";
    const original = (await origin.originGit("rev-parse", "main")).trim();
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

    const recent = await startedSession(page);
    const record = keptRecord(dashboard.home);
    if (record.session.host !== "cursor") {
      throw new Error("The recorded session is not Cursor.");
    }
    const title = record.request.title;
    expect(title).toMatch(
      blank
        ? /^Ad hoc work — \d{1,2} \w{3}, \d\d:\d\d$/
        : /^why is the CI slow\?$/,
    );
    await expect(storyCard(parts(page).taken, title)).toContainText(
      cursor.sessionId,
    );
    await expect(recent).toContainText(cursor.sessionId);
    await expect(openTerminalControl(recent)).toHaveCount(1);
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

    expect(cursor.calls().map((call) => call.args)).toEqual([["create-chat"]]);
    const created = cursor.calls()[0];
    if (created === undefined) {
      throw new Error("Cursor did not record create-chat.");
    }
    expect(created.executable.endsWith(`${path.sep}cursor-agent`)).toBe(true);
    expect(created.cwd).toBe(realpathSync(origin.project));
    expect(created.stored).toBeNull();
    expectDeveloperShellEnvironment(created.env, fakeCursorHost);
    await expect.poll(() => cursor.attaches()).toHaveLength(1);
    const client = cursor.attaches()[0];
    if (client === undefined) {
      throw new Error("Cursor did not start a terminal client.");
    }
    expect(client.args).toEqual([
      "--workspace",
      origin.project,
      "--resume",
      cursor.sessionId,
    ]);
    expect(client.cwd).toBe(realpathSync(origin.project));
    expectDeveloperShellEnvironment(client.env, fakeCursorHost);
    expectDeveloperShellEnvironment(
      runnerEnvironment(dashboard.home),
      fakeCursorHost,
    );
    for (const flag of omitted) expect(client.args).not.toContain(flag);
    if (blank) {
      expect(cursor.input(client.pid)).toBe("");
      expect(record.firstInput).toEqual({
        state: "not-requested",
        intent: "blank",
      });
    } else {
      // The client records the instruction once its return submits it.
      await expect.poll(() => cursor.input(client.pid)).toMatch(/\r$/u);
      const prompt = cursor.input(client.pid).replace(/\r$/u, "");
      expectAdHocReportingInput(prompt, text, record.request, dashboard);
      expect(prompt.split("\n\n")[0]).toBe(text);
      expect(prompt.split("\n\n")[0]).not.toContain("dough-");
      expect(prompt).not.toContain("Established ");
      const [during] = recordsIn(client.stored);
      expect(during?.session).toMatchObject({
        host: "cursor",
        sessionId: cursor.sessionId,
      });
      expect(during?.firstInput).toMatchObject({
        state: "uncertain",
        instruction: prompt,
      });
      expect(during?.request).not.toHaveProperty("identity");
      // Acceptance is saved after the launch returns, so read it again.
      await expect
        .poll(() => keptRecord(dashboard.home).firstInput)
        .toEqual({
          state: "confirmed",
          instruction: prompt,
        });
    }

    const admitted = await admittedStory(origin, title);
    expect(admitted.revision).not.toBe(original);
    expect(record.request).toMatchObject({ storyIdentity: admitted.identity });

    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await expect(sidebar.entries).toHaveCount(1);
    await expect(sidebar.entry(title)).toBeVisible();
    expect(cursor.calls()).toHaveLength(1);
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
  });
}

test("a blank Cursor Start session with a chosen model is refused before create-chat and story admission", async ({
  page,
  origin,
  cursor,
}) => {
  const trunk = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: trunk,
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
  await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(0);
  expect(cursor.calls()).toEqual([]);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(trunk);
});
