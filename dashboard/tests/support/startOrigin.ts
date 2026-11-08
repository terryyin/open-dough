// A bare origin and project checkout with source skills installed for real
// execution-start journeys. The caller names the repository description the
// origin starts with; with none, it holds an empty valid backlog. Git
// insteadOf routes catalog URLs to this local origin; machine holds the fake
// HOME. No fixture operation reaches a network.

import { execFile } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { installedSkillPath } from "../../server/launchHosts.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  reviewedStorySeed,
  storyA,
} from "../../../tests/support/queued-repository.mjs";
import { commitDeclaredRevision } from "../../../tests/support/repository-fixture.mjs";
import type { RevisionFacts } from "../../../tests/support/repositoryTestData.mjs";
import { initializeStartOrigin } from "./startOriginInitialization.ts";
import {
  dashboardDeveloper,
  type StartRepository,
} from "./startOriginPreparation.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  queuedTitle,
} from "./queuedStories.ts";

const exec = promisify(execFile);

export { otherQueuedIdentity, queuedIdentity, queuedTitle };

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
  // Publishes a declared revision from the project checkout onto trunk and
  // returns the published revision.
  publishRevision(revision: RevisionFacts): Promise<string>;
  cleanup(): void;
};

// What every origin fixture provides: the origin, and the description it
// starts with as an option a spec overrides with `test.use`.
export type StartOriginFixtures = {
  origin: StartOrigin;
  originRepository: StartRepository;
};

// The origin fixtures' default description: Stories A and B queued, refined,
// planned and Ready.
export const queuedOriginRepository: [StartRepository, { option: true }] = [
  queuedReadyRepository().please(),
  { option: true },
];

// Story A's seed edited after its readiness review, keeping the recorded
// assessment bytes.
export const changedReviewRevision: RevisionFacts = {
  message: "Change reviewed content",
  files: {
    ".planning/seeds/A.md": reviewedStorySeed(storyA).replace(
      "Execute A.",
      "Execute A with changed scope after readiness review.",
    ),
  },
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
  description: StartRepository = makeMe.aRepository.please(),
  {
    repository = "terryyin/open-dough",
    projectId = "open-dough",
    host = "claude",
  }: {
    readonly repository?: string;
    readonly projectId?: string;
    readonly host?: "claude" | "codex" | "cursor";
  } = {},
): Promise<StartOrigin> {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-start-"));
  const origin = path.join(machine, "origin.git");
  const project = path.join(machine, "home", "git", projectId);
  try {
    await initializeStartOrigin(origin, project, repository, host, description);
  } catch (error) {
    rmSync(machine, { recursive: true, force: true });
    throw error;
  }
  const folder = { path: project, shown: project };
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
    async publishRevision(revision) {
      await commitDeclaredRevision(project, revision, dashboardDeveloper);
      await git(project, "push", "--quiet", "origin", "main");
      return (await originGit("rev-parse", "main")).trim();
    },
    cleanup() {
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
