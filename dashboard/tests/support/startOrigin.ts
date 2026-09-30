// A real bare origin holding one queued, ready story, and the project folder
// a dashboard server launches in, checked out from it under a fake HOME: the
// fixture for the specs that run the project's installed
// `execution-start.mjs` for real (../agent-launch-start.spec.ts). The
// project folder's `.claude/skills` are copies of this repository's own
// source skills, committed like a project that installed them, so the real
// script runs from the folder. The folder's `origin` is spelled as the
// catalog repository and rewritten to the bare origin by Git's own
// `insteadOf`, so the dashboard reads the catalog spelling while Git talks to
// the local bare repository. Nothing here reaches a network.

import { execFile } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { backlogOf } from "../../../tests/support/product-backlog-fixture.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";

const exec = promisify(execFile);

// The story the origin queues: what a launch request for it names.
export const queuedIdentity = "SEED-A#a";
export const queuedTitle = "Prepare the queued start";

const installedSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
] as const;

export type StartOrigin = {
  // The machine directory to hand `startDashboardServer` (it holds HOME).
  readonly machine: string;
  // The bare origin's path.
  readonly origin: string;
  // The project folder, `<machine>/home/git/<project id>`.
  readonly project: string;
  // What Git reports in the origin, run there.
  originGit(...args: string[]): Promise<string>;
  // The agent profiles origin's trunk holds, parsed.
  takenProfiles(): Promise<Record<string, unknown>[]>;
  // Has another publisher Take the queued story through the real start
  // command, in a workspace of its own; the Agent it names.
  takenByAnotherAgent(): Promise<string>;
  // Removes the fixture.
  cleanup(): void;
};

async function git(cwd: string, ...args: string[]): Promise<string> {
  return (await exec("git", args, { cwd })).stdout;
}

function writeQueuedStory(project: string): void {
  const plan = "# Story A plan\n\nExecute the selected startup story.\n";
  const seed = `---\nid: SEED-A\n---\n\n# Seed A\n\n<a id="a"></a>\n\n### Story A\n\n**Identity:** ${queuedIdentity}\n\nExecute A.\n`;
  const recorded = recordStoryState(
    seed,
    {
      href: "seeds/A.md#a",
      identity: queuedIdentity,
      refinement: "refined",
      approach: "planned",
      plan: "../slice-plans/A/PLAN.md",
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  ) as { source: string };
  mkdirSync(path.join(project, ".planning/seeds"), { recursive: true });
  mkdirSync(path.join(project, ".planning/slice-plans/A"), {
    recursive: true,
  });
  writeFileSync(path.join(project, ".planning/seeds/A.md"), recorded.source);
  writeFileSync(path.join(project, ".planning/slice-plans/A/PLAN.md"), plan);
  writeFileSync(
    path.join(project, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf([], [`- [Story A](seeds/A.md#a) — ${queuedIdentity}`]),
  );
}

// The catalog repository the project folder's `origin` is spelled as.
export async function startOrigin(
  repository = "terryyin/open-dough",
  projectId = "open-dough",
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
  writeQueuedStory(project);
  for (const skill of installedSkills) {
    cpSync(
      path.join("src", "skills", skill),
      path.join(project, ".claude", "skills", skill),
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
  return {
    machine,
    origin,
    project,
    originGit,
    takenProfiles,
    async takenByAnotherAgent() {
      const scripts = path.join(
        project,
        ".claude/skills/dough-execute-plan/scripts",
      );
      await exec(
        process.execPath,
        [
          path.join(scripts, "execution-start.mjs"),
          "start",
          "--integration",
          project,
          "--workspace",
          path.join(machine, "another-agent-workspace"),
          "--branch",
          "claude/another-agent",
          "--identity",
          queuedIdentity,
          "--publisher-id",
          "another-publisher",
          "--mode",
          "story-branch",
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
      return String((await takenProfiles())[0]?.["agent"]);
    },
    cleanup() {
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
