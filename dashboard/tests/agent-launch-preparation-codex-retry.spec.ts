// Candidate installed .agents scripts own publication/workspaces. The page
// chooses Codex; the native substitute supplies only RPC outcomes and IDs.
import { readFileSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { launch, launchRequest } from "./agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { stored } from "./support/codexLaunch.ts";
import { queuedIdentity, otherQueuedIdentity } from "./support/startOrigin.ts";
import { agentLaunchEndpoint } from "../src/agentLaunch.ts";
import type { StartRecord } from "../server/startStore.ts";

test.use({ preparationHost: "codex" });

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
    const local = (...args: string[]) =>
      execFileSync("git", ["-C", workspace, ...args], { encoding: "utf8" });
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
      // The previous released-shape command must reject the new operation,
      // rather than ignore an unknown flag and announce a replacement.
      writeFileSync(
        path.join(
          origin.project,
          ".agents/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
        ),
        execFileSync(
          "git",
          [
            "show",
            "HEAD:src/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
          ],
          { encoding: "utf8" },
        ),
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
    const response = page.waitForResponse(
      (response) =>
        response.url().endsWith(agentLaunchEndpoint) &&
        response.request().method() === "POST",
    );
    await dialog.getByRole("button", { name: "Start", exact: true }).click();
    await (await response).finished();
    expect(await origin.takenProfiles()).toEqual(profiles);
    await expect(card.locator(".launch-problem")).toContainText("reconcile");
    if (damage !== "uncertain-result")
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
    expect(existsSync(workspace)).toBe(allocation !== undefined);
    if (allocation !== undefined)
      expect(
        local(
          "for-each-ref",
          "--format=%(objectname)",
          "refs/worktree/dough/preparation-assignment",
        ),
      ).toBe(allocation);
    expect(native.calls).toEqual(calls);
    expect(stored(dashboard.home)).toEqual([]);
    if (damage === "missing-script") writeFileSync(script, installedBytes);
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
}
