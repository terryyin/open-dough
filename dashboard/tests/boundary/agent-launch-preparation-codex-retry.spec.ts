// Retained Codex preparation damage variants refuse retry at the launch
// boundary without replacing preparation. The page path is one journey:
// ../agent-launch-preparation-codex-retry.spec.ts.
import { readFileSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { launch, launchRequest } from "../agentLaunchBoundary.ts";
import { expect, test } from "../support/preparationPage.ts";
import { stored } from "../support/codexLaunch.ts";
import { queuedIdentity, otherQueuedIdentity } from "../support/startOrigin.ts";
import type { StartRecord } from "../../server/startStore.ts";

test.setTimeout(120_000);
test.use({ serverMode: "boundary", preparationHost: "codex" });

for (const damage of [
  "workspace",
  "workspace-and-branch",
  "ownership",
  "allocation",
  "legacy-ownership",
  "uncertain-result",
  "older-script",
  "saved-allocation",
  "retained-facts",
  "missing-script",
] as const) {
  test(`Codex retained retry refuses lost ${damage} without replacing its preparation`, async ({
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
    const local = (...args: string[]) =>
      execFileSync("git", ["-C", workspace, ...args], {
        encoding: "utf8",
      });
    const script = path.join(
      origin.project,
      ".agents/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
    );
    const installedBytes = readFileSync(script, "utf8");
    if (damage === "workspace" || damage === "workspace-and-branch") {
      git("worktree", "remove", workspace);
      if (damage === "workspace-and-branch")
        git("branch", "-d", "codex/story-a");
    } else if (damage === "older-script") {
      // Exact released v0.3.51 entry; provenance is beside the offline fixture.
      writeFileSync(
        script,
        readFileSync(
          new URL(
            "../fixtures/preparation-assignment-v0.3.51.mjs.txt",
            import.meta.url,
          ),
        ),
      );
      // Prove unsupported continuation while the established ownership is intact.
      const continuation = spawnSync(
        process.execPath,
        [
          script,
          "continue",
          "--integration",
          origin.project,
          "--workspace",
          workspace,
          "--branch",
          "codex/story-a",
          "--identity",
          queuedIdentity,
          "--remote",
          "origin",
          "--target",
          "main",
          "--push-authorized",
          "--host",
          "codex",
          "--expected-agent",
          agent,
          "--expected-allocation",
          publishedSha,
        ],
        {
          cwd: origin.project,
          env: { ...process.env, HOME: dashboard.home },
          encoding: "utf8",
        },
      );
      expect(continuation.error).toBeUndefined();
      expect(continuation.status, continuation.stdout).toBe(2);
      expect(continuation.stdout).toBe("");
      expect(continuation.stderr).toContain(
        "usage: preparation-assignment.mjs start",
      );
      expect(continuation.stderr).not.toContain(
        "preparation-assignment.mjs continue",
      );
      git("worktree", "remove", workspace);
      git("branch", "-d", "codex/story-a");
    } else if (
      damage === "ownership" ||
      damage === "legacy-ownership" ||
      damage === "uncertain-result"
    ) {
      local("update-ref", "-d", "refs/worktree/dough/preparation-assignment");
    } else if (damage === "allocation") {
      local(
        "update-ref",
        "refs/worktree/dough/preparation-assignment",
        `${publishedSha}^`,
      );
    } else if (damage === "missing-script") {
      rmSync(script);
    }
    if (
      damage === "legacy-ownership" ||
      damage === "uncertain-result" ||
      damage === "saved-allocation" ||
      damage === "retained-facts"
    ) {
      const starts = JSON.parse(readFileSync(startsFile, "utf8")) as Record<
        string,
        Record<string, StartRecord>
      >;
      const retained = starts["open-dough"]?.[queuedIdentity];
      if (retained?.preparation === undefined)
        throw new Error("Published preparation missing from fixture start.");
      if ("tracking" in retained.preparation)
        throw new Error("Fixture start unexpectedly established one-shot.");
      const preparation = retained.preparation;
      if (damage === "legacy-ownership") delete preparation.publishedSha;
      if (damage === "uncertain-result") delete retained.preparation;
      if (damage === "saved-allocation")
        preparation.publishedSha = local(
          "rev-parse",
          `${publishedSha}^`,
        ).trim();
      if (damage === "retained-facts") preparation.workspace = origin.project;
      writeFileSync(startsFile, JSON.stringify(starts));
    }
    const startBytes = readFileSync(startsFile, "utf8");
    const branches = git(
      "for-each-ref",
      "--format=%(refname) %(objectname)",
      "refs/heads/",
    );
    const worktrees = git("worktree", "list", "--porcelain");
    const allocation = existsSync(workspace)
      ? local(
          "for-each-ref",
          "--format=%(objectname)",
          "refs/worktree/dough/preparation-assignment",
        )
      : undefined;
    const calls = [...native.calls];
    native.refuseCreation = false;
    const second = await launch(dashboard, request);
    expect(second.body).toContain('"kind":"failed"');
    expect(second.body).toContain("reconcile");
    if (damage !== "uncertain-result") expect(second.body).toContain(agent);
    expect(second.body).toContain("story-a");
    expect(readFileSync(startsFile, "utf8")).toBe(startBytes);
    expect(await origin.takenProfiles()).toEqual(profiles);
    expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
      publishedSha,
    );
    expect(
      git("for-each-ref", "--format=%(refname) %(objectname)", "refs/heads/"),
    ).toBe(branches);
    expect(git("worktree", "list", "--porcelain")).toBe(worktrees);
    expect(existsSync(workspace)).toBe(allocation !== undefined);
    if (allocation !== undefined)
      expect(
        local(
          "for-each-ref",
          "--format=%(objectname)",
          "refs/worktree/dough/preparation-assignment",
        ),
      ).toBe(allocation);
    expect(native.calls.slice(0, calls.length)).toEqual(calls);
    const added = native.calls.slice(calls.length);
    const discovery = new Set(["initialize", "initialized", "model/list"]);
    expect(added.filter(({ method }) => !discovery.has(method))).toEqual([]);
    expect(stored(dashboard.home)).toEqual([]);
    if (damage === "missing-script") writeFileSync(script, installedBytes);
    // One representative damage case proves an unrelated queued story still
    // launches without replacing the retained damaged preparation; the other
    // damage cases stop after their refusal and preservation assertions.
    if (damage !== "workspace") return;
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
}
