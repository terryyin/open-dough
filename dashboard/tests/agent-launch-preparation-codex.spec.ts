import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
// Candidate installed .agents scripts own publication/workspaces. The page
// chooses Codex; the native substitute supplies only RPC outcomes and IDs.
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { keptStarts, launch, launchRequest } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectCodexRetryProgress } from "./support/codexRetryPage.ts";
import { parts } from "./dashboardPage.ts";
import { expectStartNote } from "./cardControls.ts";
import { expect, test } from "./support/preparationPage.ts";
import { stored } from "./support/codexLaunch.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { showOptions } from "./launchCardPage.ts";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import type { EstablishedPreparation } from "../src/agentLaunch.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

test.use({ preparationHost: "codex" });

test("Codex refusal retains its published preparation; the page resumes the same assignment after server restart", async ({
  page,
  dashboard,
  origin,
  github,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("Native fixture missing.");
  const native = codexProtocol;
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await card.getByRole("button", { name: "Start refinement" }).click();
  await page.getByLabel("Host", { exact: true }).selectOption("codex");
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Codex",
  });
  await expect(dialog).toContainText("Start also publishes");
  await showOptions(dialog);
  await dialog.getByRole("checkbox", { name: /Explore/ }).check();
  native.refuseCreation = true;
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(card.locator(".launch-problem")).toContainText(
    "Codex refused to create a conversation",
    { timeout: launchWaitMs },
  );
  await expect(card.locator(".launch-problem")).toContainText("Preparing as");
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
  const allocation = () =>
    execFileSync(
      "git",
      [
        "-C",
        workspace,
        "rev-parse",
        "refs/worktree/dough/preparation-assignment",
      ],
      { encoding: "utf8" },
    ).trim();
  expect(allocation()).toBe(publishedSha);
  const profiles = await origin.takenProfiles();
  expect(profiles).toHaveLength(1);
  expect(profiles[0]).toMatchObject({
    identity: queuedIdentity,
    activity: "preparation",
    host: "codex",
  });
  expect(profiles[0]?.["model"]).toBeUndefined();
  const preparation: EstablishedPreparation = {
    identity: queuedIdentity,
    workspace,
    branch: "codex/story-a",
    remote: "origin",
    target: "main",
    agent: String(profiles[0]?.["agent"]),
    publishedSha,
  };
  const startsFile = path.join(
    dashboard.home,
    ".open-dough/dashboard/refinement-starts.json",
  );
  const kept = () =>
    (
      JSON.parse(readFileSync(startsFile, "utf8")) as Record<
        string,
        Record<string, unknown>
      >
    )["open-dough"]?.[queuedIdentity];
  expect(kept()).toMatchObject({ host: "codex", preparation });
  expect(native.calls.filter(({ method }) => method === "turn/start")).toEqual(
    [],
  );
  expect(dashboard.claudeLaunchCalls()).toEqual([]);

  // New machine reads must override the component's original Claude choice,
  // including an already-mounted card after reload and a new server process.
  await card.getByRole("button", { name: "Start refinement" }).click();
  await expect(dialog.getByLabel("Host", { exact: true })).toBeDisabled();
  await page.keyboard.press("Escape");
  await reloadUntilRead(page);
  await expectStartNote(
    card,
    "Start refinement",
    "Started here, no session yet",
  );
  await card.getByRole("button", { name: "Start refinement" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByLabel("Host", { exact: true })).toHaveValue("codex");
  await expect(dialog.getByLabel("Host", { exact: true })).toBeDisabled();
  await expect(dialog).toContainText(
    "This start requested Codex with Default model.",
  );
  await page.keyboard.press("Escape");
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    github,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: launchWaitMs,
    port,
    codexProtocol: native,
  });
  try {
    await reloadUntilRead(page);
    await expectStartNote(
      card,
      "Start refinement",
      "Started here, no session yet",
    );
    // Even a forged host change cannot replace the retained start.
    const wrongHost = await launch(restarted, {
      ...launchRequest,
      workflow: "refinement",
      identity: queuedIdentity,
      title: "Story A",
      host: "claude",
    });
    expect(wrongHost.status).toBe(400);
    expect(wrongHost.body).toContain("belongs to codex");
    expect(restarted.claudeLaunchCalls()).toEqual([]);
    await card.getByRole("button", { name: "Start refinement" }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("already published on origin");
    await expect(dialog).toContainText(
      "in workspace ~/git/open-dough/.worktrees/story-a",
    );
    await expect(
      dialog.getByLabel("Model", { exact: true }).locator("option"),
    ).toHaveCount(native.models.length + 1);
    await showOptions(dialog);
    await dialog.getByRole("checkbox", { name: /Explore/ }).check();
    await dialog
      .getByLabel("Instruction (optional)", { exact: true })
      .fill("Focus on the examples.");
    native.refuseCreation = false;
    native.holdCreation = true;
    native.beforeInput = () => {
      expect(kept()).toBeDefined();
      expect(stored(restarted.home)[0]).toMatchObject({
        preparation,
        firstInput: { state: "uncertain" },
      });
    };
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    const observer = await expectCodexRetryProgress(
      page,
      card,
      restarted,
      "refinement",
    );
    native.holdCreation = false;
    native.release();
    await observer.close();
    await expect(card.getByRole("list", { name: "Sessions" })).toContainText(
      "Refinement started in Codex",
      { timeout: launchWaitMs },
    );
    await expect(card).not.toContainText("Started here, no session yet");
    expect(await keptStarts(restarted)).toEqual([]);
    expect(stored(restarted.home)).toHaveLength(1);
    expect(stored(restarted.home)[0]).toMatchObject({
      request: { host: "codex", options: ["--explore"] },
      preparation,
      firstInput: { state: "confirmed" },
    });
    expect(stored(restarted.home)[0]?.request.model).toBeUndefined();
    expect(
      native.calls
        .filter(({ method }) => method === "thread/start")
        .map(({ params }) => params),
    ).toEqual([{ cwd: workspace }, { cwd: workspace }]);
    const inputs = native.calls.filter(({ method }) => method === "turn/start");
    expect(inputs).toHaveLength(1);
    const input = inputs[0]?.params["input"] as Array<{
      type: string;
      text?: string;
      path?: string;
    }>;
    const text = input[0]?.text ?? "";
    const [command, block, reporting, instruction, ...extra] =
      text.split("\n\n");
    expect(extra).toEqual([]);
    expectReportingBlock(
      reporting,
      stored(restarted.home)[0]?.request,
      restarted,
    );
    expect(command).toBe(`$dough-story-refinement ${queuedIdentity} --explore`);
    expect(instruction).toBe("Focus on the examples.");
    expect(text.match(/Established preparation:/g)).toHaveLength(1);
    for (const line of [
      `- workspace: ${workspace}`,
      "- branch: codex/story-a",
      `- agent: ${String(preparation.agent)}`,
      `- publishedSha: ${publishedSha}`,
      `- integration checkout: ${origin.project}`,
    ])
      expect(block).toContain(line);
    expect(input[1]).toMatchObject({
      type: "skill",
      path: path.join(
        workspace,
        ".agents/skills/dough-story-refinement/SKILL.md",
      ),
    });
    expect(allocation()).toBe(publishedSha);
    expect(await origin.takenProfiles()).toEqual(profiles);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
      publishedSha,
    );
    expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
      "story-a",
    ]);
    expect(
      execFileSync("git", ["-C", workspace, "branch", "--show-current"], {
        encoding: "utf8",
      }).trim(),
    ).toBe("codex/story-a");
  } finally {
    await restarted.close();
  }
});
