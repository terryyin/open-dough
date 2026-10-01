// Actual card/Taken retry, installed execution-start and formatter, and bare Git
// origin. Native refusal/acceptance answers prove our boundary, not skill use.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { keptStarts } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { test, expect, stored } from "./support/codexStart.ts";
import { expectExecutionInput } from "./support/codexStartAssertions.ts";
import { queuedIdentity } from "./support/startOrigin.ts";

test("Codex card start publishes one claim and retries its retained workspace before creating one conversation", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const original = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: original,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const { backlog, taken, source } = parts(page);
  const queued = backlog.getByRole("article", { name: "Story A" });
  const claimed = taken.getByRole("article", { name: "Story A" });
  await queued.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("combobox", { name: "Host" }).selectOption("codex");
  await expect(dialog).toHaveAccessibleName("Start execution in Codex");
  await expect(dialog.getByRole("combobox", { name: "Model" })).toHaveValue("");
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Implement the selected slice.");
  native.refuseCreation = true;
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(queued.locator(".launch-problem")).toContainText(
    "Codex refused to create a conversation.",
  );
  const [profile] = await origin.takenProfiles();
  expect(profile).toMatchObject({
    identity: queuedIdentity,
    host: "codex",
    mode: "story-branch",
    branch: "codex/story-a",
  });
  expect(profile).not.toHaveProperty("model");
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  await expect(queued.locator(".launch-problem")).toContainText(
    `Taken by ${String(profile?.["agent"])}; no session started. Workspace ~/git/open-dough/.worktrees/story-a.`,
  );
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  expect(revision).not.toBe(original);
  expect(
    await origin.originGit("show", "main:.planning/PRODUCT-BACKLOG.md"),
  ).toMatch(/## Taken\s+\n- \[Story A\]/);
  expect(
    existsSync(
      path.join(workspace, ".agents/skills/dough-execute-plan/SKILL.md"),
    ),
  ).toBe(true);
  expect(
    existsSync(path.join(workspace, ".claude/skills/dough-execute-plan")),
  ).toBe(false);
  expect(
    execFileSync("git", ["branch", "--show-current"], {
      cwd: workspace,
      encoding: "utf8",
    }).trim(),
  ).toBe("codex/story-a");
  expect(stored(dashboard.home)).toEqual([]);
  expect(native.history).toEqual([]);
  expect(native.calls.filter((call) => call.method === "turn/start")).toEqual(
    [],
  );
  expect(await keptStarts(dashboard)).toEqual([
    {
      host: "codex",
      workflow: "execution",
      source: "open-dough",
      identity: queuedIdentity,
      workspace: "~/git/open-dough/.worktrees/story-a",
      agent: profile?.["agent"],
    },
  ]);

  published.advanceTo(revision);
  await page.reload();
  await expect(source).toContainText(revision);
  await expect(claimed).toContainText("Started here, no session yet");
  await claimed.getByRole("button", { name: "Start execution" }).click();
  await expect(dialog).toHaveAccessibleName("Start execution in Codex");
  await expect(dialog).toContainText("Start publishes no second Take");
  await expect(dialog).toContainText(
    "in workspace ~/git/open-dough/.worktrees/story-a",
  );
  await dialog
    .getByRole("textbox", { name: "Instruction (optional)" })
    .fill("Implement the selected slice.");
  native.refuseCreation = false;
  native.beforeInput = () => {
    expect(stored(dashboard.home)[0]).toMatchObject({
      start: { workspace, publishedSha: revision },
      firstInput: { state: "uncertain" },
      session: { sessionId: native.threadId, continuation: { workspace } },
    });
  };
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const sessions = claimed.getByRole("list", { name: "Sessions" });
  await expect(sessions).toContainText("Execution started in Codex");
  await expect(sessions).toContainText("First input accepted");
  const [record] = stored(dashboard.home);
  expectExecutionInput(
    record,
    native,
    workspace,
    original,
    revision,
    profile?.["agent"],
  );
  expect(native.calls.filter((call) => call.method === "thread/start")).toEqual(
    [
      { method: "thread/start", params: { cwd: workspace } },
      { method: "thread/start", params: { cwd: workspace } },
    ],
  );
  expect(await origin.takenProfiles()).toEqual([profile]);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(revision);
  expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
    "story-a",
  ]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  await expect(
    claimed.getByRole("button", { name: "Start execution" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(sessions).toContainText("Execution started in Codex");
  await expect(
    claimed.getByRole("button", { name: "Start execution" }),
  ).toHaveCount(0);
  expect(stored(dashboard.home)).toHaveLength(1);
});
