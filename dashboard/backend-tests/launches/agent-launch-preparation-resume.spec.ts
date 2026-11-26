// A retained preparation follows its original installed workspace and assignment.
import { chmodSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
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
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .refining({ identity: queuedIdentity, title: queuedTitle })
  .please();
const slug = "prepare-the-queued-start";
const branch = `claude/${slug}`;
let origin: StartOrigin;
let folder: LocalFolder;
let store: StartStore;
let env: NodeJS.ProcessEnv;
let workspace: string;
let running: Promise<Started> | undefined;
let hold: ReturnType<StartOrigin["holdPushes"]> | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  running = undefined;
  hold = undefined;
  origin = await startOrigin(repository);
  const home = path.join(origin.machine, "home");
  folder = localFolder("~/git/open-dough", home);
  store = startStore("refinement", home);
  env = { ...process.env, HOME: home };
  workspace = path.join(origin.project, ".worktrees", slug);
});

afterEach(async () => {
  hold?.release();
  try {
    await Promise.allSettled([running]);
  } finally {
    origin.cleanup();
  }
});

function start(
  progress = new StartProgress(),
  warning?: (time: string) => Promise<void>,
) {
  running = started(
    source,
    request,
    folder,
    progress,
    {
      store: () => store,
      env,
      ...(warning && { warningMs: 1 }),
    },
    "refinement-attempt",
    warning,
  );
  return running;
}

async function preparationOf(result: Started) {
  if (
    result.kind !== "established" ||
    !("preparation" in result.handoff.established)
  )
    throw new Error(
      `Expected the preparing handoff: ${JSON.stringify(result)}`,
    );
  const { preparation } = result.handoff.established;
  expect(result.workspace.path).toBe(workspace);
  expect(preparation).toMatchObject({
    identity: queuedIdentity,
    workspace,
    branch,
  });
  expect(result.handoff.formatted).toContain("Established preparation:");
  expect(result.handoff.formatted).toContain(`- workspace: ${workspace}`);
  expect(result.handoff.formatted).toContain(`- branch: ${branch}`);
  expect((await store.kept(source.id, queuedIdentity))?.preparation).toEqual(
    preparation,
  );
  expect(readdirSync(path.dirname(workspace))).toEqual([slug]);
  return { result, preparation };
}

function refusePushes() {
  const hook = path.join(origin.origin, "hooks", "pre-receive");
  writeFileSync(hook, "#!/bin/sh\necho refused >&2\nexit 1\n");
  chmodSync(hook, 0o755);
  return hook;
}

describe("a preparing announcement held on origin", () => {
  let progress: StartProgress;
  let pending: Promise<Started>;
  let warned: string | undefined;

  beforeEach(async () => {
    const push = origin.holdPushes();
    hold = push;
    warned = undefined;
    progress = new StartProgress();
    pending = start(progress, (time) => {
      warned = time;
      return Promise.resolve();
    });
    await expect.poll(() => push.isHeld(), { timeout: 5_000 }).toBe(true);
  });

  test("warns and establishes the original assignment when origin accepts", async () => {
    try {
      await expect.poll(() => warned).toMatch(/^\d{4}-/);
      const [head, kept] = await Promise.all([
        origin.originGit("rev-parse", "main"),
        store.kept(source.id, queuedIdentity),
      ]);
      expect(head.trim()).toBe(origin.revision("base"));
      expect(kept).toMatchObject({ workspace, branch });
      expect(kept?.preparation).toBeUndefined();
      expect(progress.all()).toMatchObject([{ phase: "preparing" }]);
    } finally {
      hold?.release();
      hold = undefined;
    }
    const { preparation } = await preparationOf(await pending);
    const [head, profiles] = await Promise.all([
      origin.originGit("rev-parse", "main"),
      origin.takenProfiles(),
    ]);
    expect(preparation).toHaveProperty("publishedSha", head.trim());
    expect(profiles).toMatchObject([
      { activity: "preparation", identity: queuedIdentity },
    ]);
    expect(progress.all()).toMatchObject([{ phase: "launching" }]);
  });
});

describe("an unpublished preparation", () => {
  let first: Started;

  beforeEach(async () => {
    const hook = refusePushes();
    try {
      first = await start();
    } finally {
      rmSync(hook);
    }
  });

  test("keeps the unannounced workspace and retries with one assignment", async () => {
    expect(first).toMatchObject({
      kind: "stopped",
      result: { kind: "failed", reason: "start-refused" },
    });
    if (first.kind !== "stopped" || first.result.kind !== "failed")
      throw new Error("Expected a refused start");
    expect(first.result.explanation).toContain(
      `Workspace ~/git/open-dough/.worktrees/${slug} on branch ${branch}. The start was kept and can be resumed. Nothing was launched.`,
    );
    const [kept, initialProfiles] = await Promise.all([
      store.kept(source.id, queuedIdentity),
      origin.takenProfiles(),
    ]);
    expect(kept).toMatchObject({
      workspace,
      branch,
      preparationUnannounced: true,
    });
    expect(kept?.preparation).toBeUndefined();
    expect(initialProfiles).toEqual([]);
    await preparationOf(await start());
    expect(await origin.takenProfiles()).toMatchObject([
      { activity: "preparation", identity: queuedIdentity },
    ]);
  });
});

describe("a kept published preparation", () => {
  let first: Started;

  beforeEach(async () => {
    first = await start();
  });

  test("names the agent after a refused session and reuses the assignment on Start again", async () => {
    const { result, preparation } = await preparationOf(first);
    const [head, profiles] = await Promise.all([
      origin.originGit("rev-parse", "main"),
      origin.takenProfiles(),
    ]);
    expect(profiles).toMatchObject([
      { activity: "preparation", identity: queuedIdentity },
    ]);
    const agent = String(profiles[0]?.["agent"]);
    expect(result.workflow.publishedWithoutSession(result)).toBe(
      `Preparing as ${agent}; no session started. Workspace ~/git/open-dough/.worktrees/${slug}.`,
    );
    const resumed = await preparationOf(await start());
    expect(resumed.preparation).toEqual(preparation);
    const [nextHead, nextProfiles] = await Promise.all([
      origin.originGit("rev-parse", "main"),
      origin.takenProfiles(),
    ]);
    expect(nextHead).toBe(head);
    expect(nextProfiles).toEqual(profiles);
    expect(publicationOf(resumed.result, undefined)).toEqual({
      kind: "published",
      revision: head.trim(),
    });
  });
});
