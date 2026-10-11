// A bare origin and project checkout with source skills installed for real
// execution-start journeys. Git insteadOf routes catalog URLs to this local
// origin; machine holds the fake HOME. No fixture operation reaches a network.

import { execFile } from "node:child_process";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { repoRoot } from "./repositoryRoot.ts";
import { installedSkillPath } from "../../server/launchHosts.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  queuedTitle,
  writeQueuedStories,
} from "./queuedStories.ts";

const exec = promisify(execFile);

export { otherQueuedIdentity, queuedIdentity, queuedTitle };

const installedSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
  "dough-land",
  "dough-story-wrap-up",
] as const;

export type StartOrigin = {
  readonly machine: string;
  readonly origin: string;
  readonly project: string;
  originGit(...args: string[]): Promise<string>;
  takenProfiles(): Promise<Record<string, unknown>[]>;
  // Runs the real start for another publisher and returns the claimed agent.
  takenByAnotherAgent(identity?: string): Promise<string>;
  // Runs the real Trunk Mode start as a terminal `--trunk` start leaves it:
  // a linked worktree `.worktrees/<slug>` of the project on `exec/<slug>`,
  // with the agent's author config and the claim at its head.
  takenInTrunkMode(slug: string, identity?: string): Promise<TrunkStart>;
  // Holds every push to origin on its `pre-receive` hook until released.
  holdPushes(): PushHold;
  // Publishes edited content while preserving its reviewed assessment bytes.
  publishChangedReview(): Promise<string>;
  cleanup(): void;
};

export type TrunkStart = {
  readonly agent: string;
  readonly workspace: string;
  readonly branch: string;
};

export type PushHold = {
  isHeld(): boolean;
  release(): void;
};

async function git(cwd: string, ...args: string[]): Promise<string> {
  return (await exec("git", args, { cwd })).stdout;
}

export async function startOrigin(
  repository = "terryyin/open-dough",
  projectId = "open-dough",
  host: "claude" | "codex" | "cursor" = "claude",
): Promise<StartOrigin> {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-start-"));
  const origin = path.join(machine, "origin.git");
  const project = path.join(machine, "home", "git", projectId);
  mkdirSync(project, { recursive: true });
  await exec("git", ["init", "--bare", "-b", "main", origin]);
  await git(origin, "config", "maintenance.auto", "false");
  await exec("git", ["init", "-b", "main", project]);
  await git(project, "config", "user.name", "Dashboard Developer");
  await git(project, "config", "user.email", "developer@example.test");
  await git(project, "config", "maintenance.auto", "false");
  const spelled = `https://github.com/${repository}.git`;
  await git(project, "remote", "add", "origin", spelled);
  await git(project, "config", `url.${origin}.insteadOf`, spelled);
  writeFileSync(path.join(project, ".gitignore"), ".worktrees/\n");
  writeQueuedStories(project);
  const folder = { path: project, shown: project };
  for (const skill of installedSkills) {
    cpSync(
      path.join(repoRoot, "src", "skills", skill),
      installedSkillPath(host, folder, skill),
      { recursive: true },
    );
  }
  await git(project, "add", ".");
  await git(project, "commit", "-m", "queued story and installed skills");
  await git(project, "push", "origin", "main");
  const originGit = async (...args: string[]) => git(origin, ...args);
  const takenProfiles = async () => {
    const listed = await originGit(
      "ls-tree",
      "--name-only",
      "main",
      ".planning/agents/",
    );
    return Promise.all(
      listed
        .split("\n")
        .filter((file) => file !== "")
        .map(
          async (file) =>
            JSON.parse(await originGit("show", `main:${file}`)) as Record<
              string,
              unknown
            >,
        ),
    );
  };
  // Runs the real start for another publisher and returns the claimed agent.
  const realStart = async ({
    identity,
    workspace,
    branch,
    mode,
  }: {
    readonly identity: string;
    readonly workspace: string;
    readonly branch: string;
    readonly mode: "story-branch" | "trunk";
  }) => {
    const scripts = installedSkillPath(
      host,
      folder,
      "dough-execute-plan",
      "scripts",
    );
    await exec(
      process.execPath,
      [
        path.join(scripts, "execution-start.mjs"),
        "start",
        "--integration",
        project,
        "--workspace",
        workspace,
        "--branch",
        branch,
        "--identity",
        identity,
        "--publisher-id",
        "another-publisher",
        "--mode",
        mode,
        "--remote",
        "origin",
        "--target",
        "main",
        "--push-authorized",
        "--workspace-authorized",
        "--host",
        "claude",
      ],
      { cwd: project },
    );
    const taken = (await takenProfiles()).find(
      (profile) => profile["identity"] === identity,
    );
    return String(taken?.["agent"]);
  };
  return {
    machine,
    origin,
    project,
    originGit,
    takenProfiles,
    holdPushes() {
      const held = path.join(machine, "push-held");
      const released = path.join(machine, "push-released");
      const hook = path.join(origin, "hooks", "pre-receive");
      writeFileSync(
        hook,
        `#!/bin/sh\ntouch ${held}\nwhile [ ! -e ${released} ]; do sleep 0.2; done\n`,
      );
      chmodSync(hook, 0o755);
      return {
        isHeld: () => existsSync(held),
        release: () => {
          writeFileSync(released, "");
        },
      };
    },
    async takenByAnotherAgent(identity = queuedIdentity) {
      return realStart({
        identity,
        workspace: path.join(machine, "another-agent-workspace"),
        branch: "claude/another-agent",
        mode: "story-branch",
      });
    },
    async takenInTrunkMode(slug, identity = queuedIdentity) {
      const workspace = path.join(project, ".worktrees", slug);
      const branch = `exec/${slug}`;
      const agent = await realStart({
        identity,
        workspace,
        branch,
        mode: "trunk",
      });
      return { agent, workspace, branch };
    },
    async publishChangedReview() {
      const seed = path.join(project, ".planning/seeds/A.md");
      writeFileSync(
        seed,
        readFileSync(seed, "utf8").replace(
          "Execute A.",
          "Execute A with changed scope after readiness review.",
        ),
      );
      await git(project, "commit", "-am", "Change reviewed content");
      await git(project, "push", "origin", "main");
      return (await originGit("rev-parse", "main")).trim();
    },
    cleanup() {
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
