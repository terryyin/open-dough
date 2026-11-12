import { expectPreparationInput } from "../support/codexPreparationAssertions.ts";
import { readFileSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { keptStarts, launch, launchRequest } from "../agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { expectCodexRetryProgress } from "../support/codexRetryPage.ts";
import { expectSettledPage, parts } from "../dashboardPage.ts";
import { pausePageClockAt } from "../dashboardTest.ts";
import { expectStartNote } from "../storyCardControls.ts";
import {
  expect,
  queuedCodexPreviewTest as test,
} from "../support/preparationPage.ts";
import { stored } from "../support/codexLaunch.ts";
import { launchWaitMs } from "../support/launchWait.ts";
import { showOptions } from "../launchStoryCardPage.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
} from "../support/dashboardServer.ts";
import { queuedIdentity } from "../support/startOrigin.ts";
import type { EstablishedPreparation } from "../../src/agentLaunch.ts";
import {
  reloadUntilRead,
  untilPageRequestsAnswered,
} from "../pageRequestNotes.ts";
import { nextAcceptedAttemptId } from "../acceptedAttemptPage.ts";
import { settledOutcome } from "../acceptedAttempts.ts";

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
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  await pausePageClockAt(page, new Date());
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
  await dialog.getByLabel("Model", { exact: true }).selectOption("native-luna");
  await dialog
    .getByLabel("Reasoning effort", { exact: true })
    .selectOption("low");
  await showOptions(dialog);
  await dialog.getByRole("checkbox", { name: /Explore/ }).check();
  native.refuseCreation = true;
  const acceptance = nextAcceptedAttemptId(page);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const attemptId = await acceptance;
  await settledOutcome(dashboard, attemptId);
  await untilPageRequestsAnswered(page);
  await expect(card.locator(".launch-problem")).toContainText(
    "Codex refused to create a conversation",
  );
  await expect(card.locator(".launch-problem")).toContainText("Preparing as");
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
  const assignmentRef = "refs/worktree/dough/preparation-assignment";
  const allocation = () =>
    execFileSync("git", ["-C", workspace, "rev-parse", assignmentRef], {
      encoding: "utf8",
    }).trim();
  expect(allocation()).toBe(publishedSha);
  const profiles = await origin.takenProfiles();
  expect(profiles).toHaveLength(1);
  expect(profiles[0]).toMatchObject({
    identity: queuedIdentity,
    activity: "preparation",
    host: "codex",
  });
  expect(profiles[0]?.["model"]).toBe("native-luna");
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
  expect(kept()).toMatchObject({
    host: "codex",
    model: "native-luna",
    effort: "low",
    preparation,
  });
  expect(native.calls.filter(({ method }) => method === "turn/start")).toEqual(
    [],
  );
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  published.advanceTo(publishedSha);
  const port = Number(new URL(dashboard.baseURL).port);
  await dashboard.close();
  const restarted = await startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    github,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: launchWaitMs,
    port,
    codexProtocol: native,
  });
  try {
    await reloadUntilRead(page);
    await expectSettledPage(page);
    await expectStartNote(
      card,
      "Start refinement",
      "Started here, no session yet",
    );
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
    await expect(dialog.getByLabel("Host", { exact: true })).toHaveValue(
      "codex",
    );
    await expect(dialog.getByLabel("Host", { exact: true })).toBeDisabled();
    await expect(dialog).toContainText(
      "This start requested Codex with native-luna model.",
    );
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
      expect(kept()).toMatchObject({ model: "native-luna", effort: "low" });
      expect(stored(restarted.home)[0]).toMatchObject({
        preparation,
        firstInput: { state: "uncertain" },
      });
    };
    const creating = new Promise<void>((resolve) => {
      native.afterCreation = resolve;
    });
    const retryAcceptance = nextAcceptedAttemptId(page);
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    const retryAttemptId = await retryAcceptance;
    const observer = await expectCodexRetryProgress(
      page,
      card,
      restarted,
      "refinement",
      creating,
    );
    delete native.afterCreation;
    native.holdCreation = false;
    native.release();
    await observer.close();
    await settledOutcome(restarted, retryAttemptId);
    await untilPageRequestsAnswered(page);
    await expect(card.getByRole("list", { name: "Sessions" })).toContainText(
      "Refinement started in Codex",
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
    ).toEqual([
      {
        cwd: workspace,
        model: "native-luna",
        config: { model_reasoning_effort: "low" },
      },
      { cwd: workspace },
    ]);
    expectPreparationInput(native, preparation, restarted, origin);
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
