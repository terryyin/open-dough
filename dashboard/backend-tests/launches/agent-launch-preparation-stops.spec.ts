// A definite preparation refusal clears its progress and keeps no start.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { agentNames } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  publicationOf,
  started,
  type Started,
} from "../../server/launchStart.ts";
import { localFolder, type LocalFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore, type StartStore } from "../../server/startStore.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const exec = promisify(execFile);
const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .refining({ identity: queuedIdentity, title: queuedTitle })
  .please();
const slug = "prepare-the-queued-start";

let origin: StartOrigin;
let home: string;
let folder: LocalFolder;
let store: StartStore;
let attempt: Promise<Started> | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  attempt = undefined;
  origin = await startOrigin(repository);
  home = path.join(origin.machine, "home");
  folder = localFolder("~/git/open-dough", home);
  store = startStore("refinement", home);
});

afterEach(async () => {
  await Promise.allSettled([attempt]);
  origin.cleanup();
});

async function refused(
  request: AgentLaunchRequest,
  originalHead: string,
): Promise<string> {
  assert(request.workflow === "refinement");
  const progress = new StartProgress();
  attempt = started(
    source,
    request,
    folder,
    progress,
    { store: () => store, env: { ...process.env, HOME: home } },
    "refinement-attempt",
  );
  const result = await attempt;
  if (result.kind !== "stopped" || result.result.kind !== "failed")
    throw new Error(
      `Expected a refused preparation: ${JSON.stringify(result)}`,
    );
  expect(result.result.reason).toBe("start-refused");
  expect(publicationOf(result, undefined)).toEqual({ kind: "none" });
  expect(progress.all()).toEqual([]);

  const git = (...args: string[]) => exec("git", args, { cwd: origin.project });
  const [head, kept, branches, worktrees] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    store.kept(source.id, request.identity),
    git("branch", "--list", "claude/*"),
    git("worktree", "list", "--porcelain"),
  ]);
  expect(head.trim()).toBe(originalHead);
  expect(kept).toBeUndefined();
  expect(branches.stdout.trim()).toBe("");
  expect(worktrees.stdout).not.toContain(slug);
  expect(existsSync(path.join(origin.project, ".worktrees", slug))).toBe(false);
  return result.result.explanation;
}

test("refuses an unqueued story without creating a workspace", async () => {
  const unqueued = makeMe.aLaunchRequest
    .refining({ identity: "SEED-A#not-queued", title: queuedTitle })
    .please();

  expect(await refused(unqueued, origin.revision("base"))).toBe(
    "The story is not queued in Backlog on origin, so it cannot be started. Nothing was launched.",
  );
  expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
});

describe("when every agent name is held", () => {
  let heldHead: string;
  let heldProfiles: Awaited<ReturnType<StartOrigin["takenProfiles"]>>;

  beforeEach(async () => {
    heldHead = await origin.publishRevision({
      message: "Hold every agent name",
      agentProfiles: agentNames.map((name) =>
        makeMe.anAgentProfile
          .preparing({ name, identity: "SEED-B#b" })
          .please(),
      ),
    });
    heldProfiles = await origin.takenProfiles();
  });

  test("refuses preparation and lists the holders", async () => {
    const holders = agentNames
      .map((name) => `${name}-chan`)
      .sort()
      .join(", ");

    expect(await refused(request, heldHead)).toBe(
      `Every agent name is held on origin (${holders}), so no agent is free to prepare the story. Nothing was launched.`,
    );
    expect(await origin.takenProfiles()).toEqual(heldProfiles);
  });
});

test("refuses preparation when Git cannot create the worktree", async () => {
  writeFileSync(path.join(origin.project, ".worktrees"), "in the way\n");

  expect(await refused(request, origin.revision("base"))).toMatch(
    /^The workspace could not be set up: .+\. Nothing was launched\.$/s,
  );
});
