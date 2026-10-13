// Refinement starts through real HTTP, installed commands, and a bare origin.
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import {
  attempts,
  launch,
  launchRequest,
  continueAttempt,
  accept,
} from "./agentLaunchBoundary.ts";
import { queuedIdentity, queuedTitle } from "./support/startOrigin.ts";
import { answerOf } from "./keptExecutionStart.ts";
import {
  keptPreparation,
  preparationSlug as slug,
  type KeptPreparation,
} from "./support/keptPreparation.ts";
test.describe("a kept preparation start", () => {
  let preparation: KeptPreparation;
  test.beforeEach(async () => {
    preparation = await keptPreparation();
  });
  test.afterEach(async () => {
    await preparation.close();
  });
  test("a start that outlasts the warning threshold keeps running and launches automatically with one profile", async () => {
    await preparation.serve(3000);
    preparation.server.claudeScenario("launched");
    const push = preparation.origin.holdPushes();
    const request = {
      ...launchRequest,
      workflow: "refinement",
      identity: queuedIdentity,
      title: queuedTitle,
    };
    const launching = launch(preparation.server, request);
    await expect.poll(() => push.isHeld(), { timeout: 20_000 }).toBe(true);
    await expect
      .poll(async () => (await attempts(preparation.server))[0]?.slowSince, {
        timeout: 20_000,
      })
      .toBeDefined();
    const [slow] = await attempts(preparation.server);
    expect(slow).toMatchObject({
      owned: true,
      publication: { kind: "unknown" },
    });
    expect(slow?.outcome).toBeUndefined();
    expect(preparation.server.claudeLaunchCalls()).toEqual([]);
    expect(preparation.keptStart()).toMatchObject({
      identity: queuedIdentity,
      workspace: path.join(preparation.origin.project, ".worktrees", slug),
      branch: `claude/${slug}`,
    });
    expect(push.isHeld()).toBe(true);
    expect(
      await answerOf<unknown>(
        accept(preparation.server, { ...request, workflow: "execution" }),
      ),
    ).toMatchObject({
      kind: "failed",
      reason: "already-starting",
    });
    expect(
      await answerOf<unknown>(
        continueAttempt(preparation.server, slow?.id ?? ""),
      ),
    ).toMatchObject({
      kind: "uncertain",
      explanation: expect.stringContaining("already running"),
    });
    // The owning timer may replace a warning derived from acceptance time.
    expect(await attempts(preparation.server)).toEqual([
      {
        ...slow,
        slowSince: expect.any(String),
        changes: expect.any(Number) as unknown,
      },
    ]);
    push.release();
    await preparation.expectResumed(() =>
      answerOf<Awaited<ReturnType<KeptPreparation["ask"]>>>(launching),
    );
    expect(preparation.server.claudeLaunchCalls()).toHaveLength(1);
    const [settled] = await attempts(preparation.server);
    expect(settled).toMatchObject({
      id: slow?.id,
      outcome: { kind: "launched" },
    });
    expect(settled?.slowSince).toBeUndefined();
  });
  test("an unpublished stop keeps the start and its continuation settles it with one profile", async () => {
    await preparation.serve(60_000);
    preparation.server.claudeScenario("launched");
    preparation.installHook("echo refused >&2\nexit 1\n");
    const first = await preparation.ask();
    expect(first, first.explanation).toMatchObject({
      kind: "failed",
      reason: "start-refused",
    });
    expect(first.explanation).toContain(
      `Workspace ~/git/open-dough/.worktrees/${slug} on branch claude/${slug}. The start was kept and can be resumed. Nothing was launched.`,
    );
    expect(preparation.server.claudeLaunchCalls()).toEqual([]);
    expect(await preparation.preparing()).toEqual([]);
    expect(preparation.keptStart()).toBeDefined();
    rmSync(preparation.hook());
    await preparation.expectResumed();
  });
  test("an interrupted precommit start recovers in its workspace without replacing an occupied agent", async () => {
    await preparation.serve(60_000);
    preparation.server.claudeScenario("launched");
    const hooks = path.join(preparation.origin.machine, "commit-hooks");
    mkdirSync(hooks);
    const precommit = path.join(hooks, "pre-commit");
    writeFileSync(precommit, "#!/bin/sh\nexit 1\n");
    chmodSync(precommit, 0o755);
    execFileSync("git", ["config", "core.hooksPath", hooks], {
      cwd: preparation.origin.project,
    });
    const first = await preparation.ask();
    expect(first.kind).toBe("failed");
    expect(first.explanation).toContain("gave no result");
    expect(preparation.keptStart()?.["preparation"]).toBeUndefined();
    expect(preparation.keptStart()?.["preparationUnannounced"]).toBeUndefined();
    expect(await preparation.preparing()).toEqual([]);
    rmSync(precommit);
    const workspace = path.join(preparation.origin.project, ".worktrees", slug);
    const foreign = path.join(workspace, "foreign-draft.txt");
    writeFileSync(foreign, "Keep this unrelated work.\n");
    execFileSync("git", ["add", "--", "foreign-draft.txt"], { cwd: workspace });
    const staged = execFileSync("git", ["diff", "--cached"], {
      cwd: workspace,
    }).toString();
    const refused = await preparation.resume();
    expect(refused.kind).toBe("failed");
    expect(refused.explanation).toContain(
      "assignment ownership remains unverified",
    );
    expect(
      execFileSync("git", ["diff", "--cached"], { cwd: workspace }).toString(),
    ).toBe(staged);
    expect(readFileSync(foreign, "utf8")).toBe("Keep this unrelated work.\n");
    expect(await preparation.preparing()).toEqual([]);
    execFileSync("git", ["rm", "--cached", "--", "foreign-draft.txt"], {
      cwd: workspace,
    });
    rmSync(foreign);
    const occupied = await preparation.origin.takenByAnotherAgent("SEED-B#b");
    expect(occupied).toBe("Yui-chan");
    const before = (await preparation.origin.takenProfiles()).find(
      (profile) => profile["agent"] === occupied,
    );
    const occupiedAllocation = await preparation.origin.originGit(
      "log",
      "-1",
      "--diff-filter=A",
      "--format=%H",
      "main",
      "--",
      ".planning/agents/yui-chan.json",
    );
    await preparation.expectResumed(preparation.ask);
    expect(
      (await preparation.origin.takenProfiles()).find(
        (profile) => profile["agent"] === occupied,
      ),
    ).toEqual(before);
    expect(
      await preparation.origin.originGit(
        "log",
        "-1",
        "--diff-filter=A",
        "--format=%H",
        "main",
        "--",
        ".planning/agents/yui-chan.json",
      ),
    ).toBe(occupiedAllocation);
    expect((await preparation.preparing())[0]?.["agent"]).toBe("Akiho-chan");
  });
  test("a claude refusal after the announcement keeps the start and Start again resumes with one assignment", async () => {
    await preparation.serve(60_000);
    preparation.server.claudeScenario("refused");
    const first = await preparation.ask();
    expect(first, first.explanation).toMatchObject({ kind: "failed" });
    expect(first.explanation).toMatch(
      new RegExp(
        `Preparing as [A-Za-z]+-chan; no session started\\. Workspace ~/git/open-dough/\\.worktrees/${slug}\\.$`,
      ),
    );
    expect(await preparation.preparing()).toHaveLength(1);
    expect(preparation.keptStart()).toMatchObject({ identity: queuedIdentity });
    preparation.server.claudeScenario("launched");
    await preparation.expectResumed(preparation.ask);
  });
  test("an unannounced retry clears its old disposition before a newly published result is lost", async () => {
    await preparation.serve(60_000);
    preparation.server.claudeScenario("launched");
    preparation.installHook("echo refused >&2\nexit 1\n");
    expect((await preparation.ask()).kind).toBe("failed");
    expect(preparation.keptStart()).toMatchObject({
      preparationUnannounced: true,
    });
    expect(await preparation.preparing()).toEqual([]);
    rmSync(preparation.hook());
    // Run the actual installed command, losing only its start stdout. This
    // transport fault supplies neither an assignment nor a worktree effect.
    const script = path.join(
      preparation.origin.project,
      ".claude/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
    );
    const original = path.join(
      path.dirname(script),
      "preparation-assignment-command.mjs",
    );
    copyFileSync(script, original);
    writeFileSync(
      script,
      `import { spawnSync } from "node:child_process";\nconst result = spawnSync(process.execPath, [${JSON.stringify(original)}, ...process.argv.slice(2)], { stdio: ["ignore", process.argv[2] === "start" ? "ignore" : "inherit", "inherit"] });\nprocess.exitCode = result.status ?? 1;\n`,
    );
    const uncertain = await preparation.resume();
    expect(uncertain.kind).toBe("failed");
    expect(uncertain.explanation).toContain("gave no result");
    expect(preparation.keptStart()).toMatchObject({
      preparationUnannounced: false,
    });
    expect(preparation.keptStart()?.["preparation"]).toBeUndefined();
    expect(preparation.server.claudeLaunchCalls()).toEqual([]);
    const profiles = await preparation.preparing();
    expect(profiles).toHaveLength(1);
    const publication = (
      await preparation.origin.originGit("rev-parse", "main")
    ).trim();
    await preparation.expectResumed();
    expect(await preparation.preparing()).toEqual(profiles);
    expect(
      (await preparation.origin.originGit("rev-parse", "main")).trim(),
    ).toBe(publication);
  });
});
