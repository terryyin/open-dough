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
import { installedSkillPath } from "../../server/launchHosts.ts";
import { backlogOf } from "../../../tests/support/product-backlog-fixture.mjs";
import {
  computeBasis,
  recordStoryState,
} from "../../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";

const exec = promisify(execFile);

export const queuedIdentity = "SEED-A#a";
export const queuedTitle = "Prepare the queued start";
export const otherQueuedIdentity = "SEED-B#b";

const installedSkills = [
  "dough-execute-plan",
  "dough-product-backlog",
  "dough-story-refinement",
] as const;

export type StartOrigin = {
  readonly machine: string;
  readonly origin: string;
  readonly project: string;
  originGit(...args: string[]): Promise<string>;
  takenProfiles(): Promise<Record<string, unknown>[]>;
  // Runs the real start for another publisher and returns the claimed agent.
  takenByAnotherAgent(identity?: string): Promise<string>;
  // Holds every push to origin on its `pre-receive` hook until released.
  holdPushes(): PushHold;
  // Publishes edited content while preserving its reviewed assessment bytes.
  publishChangedReview(): Promise<string>;
  cleanup(): void;
};

export type PushHold = {
  isHeld(): boolean;
  release(): void;
};

async function git(cwd: string, ...args: string[]): Promise<string> {
  return (await exec("git", args, { cwd })).stdout;
}

function writeStory(
  project: string,
  key: string,
  identity: string,
  name: string,
): void {
  const plan = `# ${name} plan\n\nExecute the selected startup story.\n`;
  const seed = `---\nid: SEED-${key}\n---\n\n# Seed ${key}\n\n<a id="${key.toLowerCase()}"></a>\n\n### ${name}\n\n**Identity:** ${identity}\n\nExecute ${key}.\n`;
  const recorded = recordStoryState(
    seed,
    {
      href: `seeds/${key}.md#${key.toLowerCase()}`,
      identity,
      refinement: "refined",
      approach: "planned",
      plan: `../slice-plans/${key}/PLAN.md`,
      assessment: "ready",
      reasons: [],
      expectedBasis: computeBasis(seed, plan),
    },
    { planSource: plan },
  ) as { source: string };
  mkdirSync(path.join(project, ".planning/seeds"), { recursive: true });
  mkdirSync(path.join(project, `.planning/slice-plans/${key}`), {
    recursive: true,
  });
  writeFileSync(
    path.join(project, `.planning/seeds/${key}.md`),
    recorded.source,
  );
  writeFileSync(
    path.join(project, `.planning/slice-plans/${key}/PLAN.md`),
    plan,
  );
}

function writeQueuedStories(project: string): void {
  writeStory(project, "A", queuedIdentity, "Story A");
  writeStory(project, "B", otherQueuedIdentity, "Story B");
  writeFileSync(
    path.join(project, ".planning/PRODUCT-BACKLOG.md"),
    backlogOf(
      [],
      [
        `- [Story A](seeds/A.md#a) — ${queuedIdentity}`,
        `- [Story B](seeds/B.md#b) — ${otherQueuedIdentity}`,
      ],
    ),
  );
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
      path.join("src", "skills", skill),
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
          path.join(machine, "another-agent-workspace"),
          "--branch",
          "claude/another-agent",
          "--identity",
          identity,
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
      const taken = (await takenProfiles()).find(
        (profile) => profile["identity"] === identity,
      );
      return String(taken?.["agent"]);
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
