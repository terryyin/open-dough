// Raw HTTP and the synthetic Claude boundary for an installed story launch.
// The installed workflow publishes and the native launch receives its result.

import { execFileSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  launch,
  openDoughFolder,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { expect } from "../../test-support/support/pageTest.ts";
import { waitUntil } from "../../test-support/support/waitUntil.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import { git } from "../../test-support/support/startOriginObservation.ts";
import {
  expectStoryInput,
  launchClaude,
  queuedExecution,
  roughRefinement,
  test,
} from "../support/installedClaudeLaunch.ts";

const launchWaitMs = 4_000;

test("launches Claude Code in the installed execution workspace and keeps the confirmed record", async ({
  installedClaude,
}) => {
  const server = await installedClaude({ mountBoundary: true });
  const result = await launchClaude(server, queuedExecution);
  const { record } = result;
  const name = `Open Dough · Execution · ${queuedExecution.title}`;
  expect(record.request).toMatchObject(queuedExecution);
  expect(record.session).toMatchObject({ host: "claude", name });
  if (record.session.host !== "claude")
    throw new Error("Missing Claude session");
  const { shortId, sessionId } = record.session;
  expect(shortId).toMatch(/^[0-9a-f]{8}$/);
  expect(sessionId.startsWith(shortId)).toBe(true);

  const project = openDoughFolder(server);
  const workspace = path.join(project, ".worktrees", "story-a");
  const origin = await git(project, "remote", "get-url", "origin");
  expect(record.start).toMatchObject({
    branch: "claude/story-a",
    mode: "story-branch",
    publishedSha: await git(origin, "rev-parse", "main"),
  });
  expect(realpathSync(record.start?.workspace ?? "")).toBe(workspace);
  expectStoryInput(server, result, {
    command: `/dough-execute-plan ${queuedExecution.identity}`,
    identity: queuedExecution.identity,
  });
  // The launch runs in its workspace. The host listing confirms it from the project.
  expect(
    server
      .claudeCalls()
      .filter((call) => [project, workspace].includes(call.cwd)),
  ).toEqual([
    {
      argv: [
        "--bg",
        "--name",
        name,
        "--effort",
        "medium",
        "--disallowedTools",
        "Artifact",
        "--",
        result.started.instruction,
      ],
      cwd: workspace,
    },
    { argv: ["agents", "--json", "--all"], cwd: project },
  ]);
  expect(await recordsOf(server, "open-dough")).toEqual([record]);
  expect(await recordsOf(server, "doughnut")).toEqual([]);
});

test("launches refinement on its own skill and name and hands off the developer's instruction", async ({
  installedClaude,
}) => {
  const server = await installedClaude({ mountBoundary: true });
  const instruction = "Focus on the empty-state wording";
  const result = await launchClaude(server, {
    ...roughRefinement,
    instruction,
  });
  const name = `Open Dough · Refinement · ${roughRefinement.title}`;
  expect(result.record.request).toMatchObject({
    workflow: "refinement",
    instruction,
  });
  expect(result.record.session.name).toBe(name);
  expect(result.started).toMatchObject({ name, effort: "medium" });
  const project = openDoughFolder(server);
  const origin = await git(project, "remote", "get-url", "origin");
  expect(result.record.preparation).toMatchObject({
    branch: "claude/story-c",
    publishedSha: await git(origin, "rev-parse", "main"),
  });
  expect(realpathSync(result.record.preparation?.workspace ?? "")).toBe(
    path.join(project, ".worktrees", "story-c"),
  );
  expectStoryInput(server, result, {
    command: `/dough-story-refinement ${roughRefinement.identity}`,
    identity: roughRefinement.identity,
    instruction,
  });
});

test("names the missing execution checkout and starts no claude", async ({
  installedClaude,
}) => {
  const server = await installedClaude({ mountBoundary: true });
  const callsBefore = server.claudeCalls().length;
  const response = await launch(server, {
    ...queuedExecution,
    source: "doughnut",
  });

  expect(response.status).toBe(200);
  const answer = JSON.parse(response.body) as { explanation: string };
  expect(answer).toMatchObject({
    kind: "failed",
    reason: "folder-not-found",
  });
  expect(answer.explanation).toContain("~/git/doughnut");
  expect(server.claudeCalls()).toHaveLength(callsBefore);
  expect(await recordsOf(server, "doughnut")).toEqual([]);
});

for (const failure of [
  { scenario: "untrusted", reason: "folder-not-trusted" },
  { scenario: "refused", reason: "refused" },
] as const) {
  test(`answers ${failure.reason} without forwarding claude's own words, and keeps no record`, async ({
    installedClaude,
  }) => {
    const server = await installedClaude({ mountBoundary: true });
    server.claudeScenario(failure.scenario);
    const recordsBefore = (await recordsOf(server, "open-dough")).length;
    const response = await launch(server, queuedExecution);

    expect(response.status).toBe(200);
    const answer = JSON.parse(response.body) as { explanation: string };
    expect(answer).toMatchObject({
      kind: "failed",
      reason: failure.reason,
    });
    expect(answer.explanation).toContain("Run `claude` in that folder once");
    expect(answer.explanation).toContain("~/git/open-dough");
    expect(response.body).not.toContain(server.home);
    expect(response.body).not.toContain("secret-marker-from-claude-stderr");
    expect(await recordsOf(server, "open-dough")).toHaveLength(recordsBefore);
  });
}

test("answers uncertain when claude reports a session its listing does not show", async ({
  installedClaude,
}) => {
  const server = await installedClaude({ mountBoundary: true });
  server.claudeScenario("unlisted");
  const recordsBefore = (await recordsOf(server, "open-dough")).length;
  const callsBefore = server.claudeCalls().length;
  const response = await launch(server, queuedExecution);

  const answer = JSON.parse(response.body) as { explanation: string };
  expect(answer).toMatchObject({
    kind: "uncertain",
    reason: "unconfirmed",
  });
  expect(answer.explanation).toContain("claude agents");
  expect(
    server
      .claudeCalls()
      .slice(callsBefore)
      .map((call) => call.argv[0]),
  ).toEqual(["--bg", "agents"]);
  expect(await recordsOf(server, "open-dough")).toHaveLength(recordsBefore);
});

test("answers uncertain once the launch wait expires, and ends the waiting claude", async ({
  installedClaude,
}) => {
  const server = await installedClaude({
    mountBoundary: true,
    launchTimeoutMs: launchWaitMs,
  });
  server.claudeScenario("hang");
  const recordsBefore = (await recordsOf(server, "open-dough")).length;
  const started = Date.now();
  const response = await launch(server, queuedExecution);

  expect(Date.now() - started).toBeGreaterThanOrEqual(launchWaitMs - 100);
  const answer = JSON.parse(response.body) as { explanation: string };
  expect(answer).toMatchObject({ kind: "uncertain", reason: "timed-out" });
  expect(answer.explanation).toContain("claude agents");
  expect(
    await waitUntil(() => !processRunning(server.heldClaudePid()), {
      timeoutMs: 5_000,
    }),
  ).toBe(true);
  expect(server.heldClaudeEndedBy()).toBe("SIGTERM");
  expect(await recordsOf(server, "open-dough")).toHaveLength(recordsBefore);
});

test("refuses before publishing a Take when Claude Code is absent", async ({
  installedClaude,
}) => {
  const bin = mkdtempSync(path.join(tmpdir(), "dough-start-git-only-"));
  try {
    // Give the installed start Git and its local transport without exposing a real Claude.
    const gitPath = execFileSync("sh", ["-c", "command -v git"], {
      encoding: "utf8",
    }).trim();
    const gitHelpers = execFileSync(gitPath, ["--exec-path"], {
      encoding: "utf8",
    }).trim();
    symlinkSync(gitPath, path.join(bin, "git"));
    for (const helper of ["git-upload-pack", "git-receive-pack"])
      symlinkSync(path.join(gitHelpers, helper), path.join(bin, helper));
    const server = await installedClaude({
      claude: "absent",
      pathPrefix: [bin],
    });
    const project = openDoughFolder(server);
    const origin = await git(project, "remote", "get-url", "origin");
    const main = await git(origin, "rev-parse", "refs/heads/main");
    const worktrees = await git(project, "worktree", "list", "--porcelain");
    const response = await launch(server, queuedExecution);

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      kind: "failed",
      reason: "start-refused",
      explanation:
        "Claude Code (`claude`) was not found on this machine. Install it to start a session.",
    });
    expect(await git(origin, "rev-parse", "refs/heads/main")).toBe(main);
    const worktreesAfter = await git(
      project,
      "worktree",
      "list",
      "--porcelain",
    );
    expect(worktreesAfter).toBe(worktrees);
    expect(server.claudeCalls()).toEqual([]);
    expect(await recordsOf(server, "open-dough")).toEqual([]);
  } finally {
    rmSync(bin, { recursive: true, force: true });
  }
});
