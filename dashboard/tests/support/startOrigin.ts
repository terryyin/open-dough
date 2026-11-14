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
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  reviewedStorySeed,
  storyA,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import { commitDeclaredRevision } from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { RevisionFacts } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { initializeStartOrigin } from "./startOriginInitialization.ts";
import {
  anotherAgentTakes,
  type DeclaredTake,
  type TakenStart,
} from "./startOriginTakes.ts";
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
export type { TakenStart };

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
  takenInTrunkMode(slug: string, identity?: string): Promise<TakenStart>;
  // Publishes another agent's declared Take onto trunk from the project
  // checkout, as that agent's start publishes it (`takeRevision`: authored
  // by the agent, committed by the developer), then checks the claim out in
  // the agent's linked worktree with its author config, where a start leaves
  // it (./startOriginTakes.ts).
  publishTake(take: DeclaredTake): Promise<TakenStart>;
  // Holds every push to origin on its `pre-receive` hook until released;
  // cleanup refuses a push still held.
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
  const publishRevision = async (revision: RevisionFacts) => {
    await commitDeclaredRevision(project, revision, dashboardDeveloper);
    await git(project, "push", "--quiet", "origin", "main");
    return (await originGit("rev-parse", "main")).trim();
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
      // The hold also ends once cleanup removes the machine: a cleanup right
      // after release can delete the marker before the hook polls it, and the
      // push would otherwise outlive the run.
      writeFileSync(
        hook,
        `#!/bin/sh\ntouch '${held}'\nwhile [ ! -e '${released}' ] && [ -d '${machine}' ]; do sleep 0.2; done\n[ -e '${released}' ]\n`,
      );
      chmodSync(hook, 0o755);
      return {
        isHeld: () => existsSync(held),
        release: () => {
          writeFileSync(released, "");
        },
      };
    },
    publishRevision,
    ...anotherAgentTakes({
      machine,
      project,
      host,
      takenProfiles,
      publishRevision,
    }),
    cleanup() {
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
