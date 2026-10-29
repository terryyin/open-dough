// Candidate installed .agents scripts own publication/workspaces. The page
// chooses Codex; the native substitute supplies only RPC outcomes and IDs.
// Damage variants of retained-retry refusal live at
// ./boundary/agent-launch-preparation-codex-retry.spec.ts; this journey proves
// the kept-start dialog surfaces that refusal once.
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { stored } from "./support/codexLaunch.ts";
import { queuedIdentity, otherQueuedIdentity } from "./support/startOrigin.ts";
import { nextAcceptedAttemptId } from "./acceptedAttemptPage.ts";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";
import { settledOutcome } from "./acceptedAttempts.ts";

test.setTimeout(120_000);
test.use({ preparationHost: "codex" });

test("Codex retained retry refuses lost workspace without replacing its preparation", async ({
  page,
  dashboard,
  origin,
  codexProtocol,
}) => {
  if (codexProtocol === undefined) throw new Error("Native fixture missing.");
  const native = codexProtocol;
  const request = {
    ...launchRequest,
    workflow: "refinement",
    host: "codex",
    identity: queuedIdentity,
    title: "Story A",
  };
  native.refuseCreation = true;
  const first = await launch(dashboard, request);
  expect(first.body).toContain("Codex refused to create a conversation");
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  const startsFile = path.join(
    dashboard.home,
    ".open-dough/dashboard/refinement-starts.json",
  );
  const profiles = await origin.takenProfiles();
  expect(profiles).toHaveLength(1);
  const agent = String(profiles[0]?.["agent"]);
  const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", origin.project, ...args], {
      encoding: "utf8",
    });
  git("worktree", "remove", workspace);
  const startBytes = readFileSync(startsFile, "utf8");
  const branches = git(
    "for-each-ref",
    "--format=%(refname) %(objectname)",
    "refs/heads/",
  );
  const worktrees = git("worktree", "list", "--porcelain");
  const calls = [...native.calls];
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: publishedSha,
    repository: "terryyin/open-dough",
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  native.refuseCreation = false;
  // Exercise both the kept-start dialog and the HTTP retry of its retained facts.
  await card.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Codex",
  });
  const acceptance = nextAcceptedAttemptId(page);
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const attemptId = await acceptance;
  await settledOutcome(dashboard, attemptId);
  await untilPageRequestsAnswered(page);
  expect(await origin.takenProfiles()).toEqual(profiles);
  await expect(card.locator(".launch-problem")).toContainText("reconcile");
  await expect(card.locator(".launch-problem")).toContainText(agent);
  await expect(card.locator(".launch-problem")).toContainText("story-a");
  const second = await launch(dashboard, request);
  expect(second.body).toContain('"kind":"failed"');
  expect(second.body).toContain("reconcile");
  expect(readFileSync(startsFile, "utf8")).toBe(startBytes);
  expect(await origin.takenProfiles()).toEqual(profiles);
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    publishedSha,
  );
  expect(
    git("for-each-ref", "--format=%(refname) %(objectname)", "refs/heads/"),
  ).toBe(branches);
  expect(git("worktree", "list", "--porcelain")).toBe(worktrees);
  expect(existsSync(workspace)).toBe(false);
  expect(native.calls.slice(0, calls.length)).toEqual(calls);
  // Opening the dialog may discover models, but cannot retry native creation/input.
  const added = native.calls.slice(calls.length);
  const discovery = new Set(["initialize", "initialized", "model/list"]);
  expect(added.filter(({ method }) => !discovery.has(method))).toEqual([]);
  expect(stored(dashboard.home)).toEqual([]);
  // Refusing this retained identity does not impose global preparation uniqueness.
  const independent = await launch(dashboard, {
    ...request,
    identity: otherQueuedIdentity,
    title: "Story B",
  });
  expect(independent.body).toContain('"kind":"launched"');
  expect(await origin.takenProfiles()).toHaveLength(2);
  expect(
    native.calls.filter(({ method }) => method === "turn/start"),
  ).toHaveLength(1);
  expect(JSON.parse(readFileSync(startsFile, "utf8"))).toEqual(
    JSON.parse(startBytes),
  );
});
