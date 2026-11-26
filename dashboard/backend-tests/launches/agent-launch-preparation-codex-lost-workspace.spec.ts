// Losing a Codex workspace preserves its published preparation and leaves other stories independent.
import { execFile, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import {
  publicationOf,
  started,
  type Started,
} from "../../server/launchStart.ts";
import { StartProgress } from "../../server/startProgress.ts";
import {
  startStore,
  type StartRecord,
  type StartStore,
} from "../../server/startStore.ts";
import {
  otherQueuedIdentity,
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const exec = promisify(execFile);
const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .refining({ identity: queuedIdentity, title: "Story A", host: "codex" })
  .please();

let origin: StartOrigin;
let store: StartStore;
let env: NodeJS.ProcessEnv;
let pending: Promise<Started> | undefined;
let retained: StartRecord;

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, initial);
  } finally {
    initial.cleanup();
  }
});

function start(candidate = request, progress = new StartProgress()) {
  pending = started(
    source,
    candidate,
    { path: origin.project, shown: "~/git/open-dough" },
    progress,
    { store: () => store, env },
    "refinement-attempt",
  );
  return pending;
}

async function git(...args: string[]) {
  return (await exec("git", args, { cwd: origin.project })).stdout;
}

async function evidence() {
  const [head, profiles, kept, branches, worktrees] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    origin.takenProfiles(),
    store.kept(source.id, queuedIdentity),
    git("for-each-ref", "--format=%(refname) %(objectname)", "refs/heads/"),
    git("worktree", "list", "--porcelain"),
  ]);
  return { head, profiles, kept, branches, worktrees };
}

beforeEach(async () => {
  pending = undefined;
  origin = await startOrigin(repository, { host: "codex" });
  const home = path.join(origin.machine, "home");
  env = { ...process.env, HOME: home };
  store = startStore("refinement", home);
  expect(await start()).toMatchObject({ kind: "established" });
  const record = await store.kept(source.id, queuedIdentity);
  if (record?.preparation === undefined)
    throw new Error("Expected a published preparation.");
  retained = record;
});

afterEach(async () => {
  await Promise.allSettled([pending]);
  origin.cleanup();
});

function installOlderSkill() {
  const preparation = retained.preparation;
  if (
    preparation === undefined ||
    "tracking" in preparation ||
    preparation.agent === undefined ||
    preparation.publishedSha === undefined
  )
    throw new Error("Expected a published preparation.");
  const script = path.join(
    origin.project,
    ".agents/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
  );
  writeFileSync(
    script,
    readFileSync(
      new URL(
        "../../test-support/fixtures/preparation-assignment-v0.3.51.mjs.txt",
        import.meta.url,
      ),
    ),
  );
  const continuation = spawnSync(
    process.execPath,
    [
      script,
      "continue",
      "--integration",
      origin.project,
      "--workspace",
      preparation.workspace,
      "--branch",
      preparation.branch,
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
      preparation.agent,
      "--expected-allocation",
      preparation.publishedSha,
    ],
    { cwd: origin.project, env, encoding: "utf8" },
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
}

async function expectRefused(before: Awaited<ReturnType<typeof evidence>>) {
  const progress = new StartProgress();
  const outcome = await start(request, progress);

  expect(outcome).toMatchObject({
    kind: "stopped",
    result: { kind: "failed", reason: "start-refused" },
  });
  if (outcome.kind !== "stopped" || outcome.result.kind !== "failed")
    throw new Error("Expected continuation refusal.");
  expect(outcome.result.explanation).toContain("must be reconciled");
  expect(outcome.result.explanation).toContain(
    String(before.profiles[0]?.["agent"]),
  );
  expect(outcome.result.explanation).toContain("story-a");
  expect(outcome.result.explanation).toContain("Nothing was launched.");
  expect(publicationOf(outcome, undefined)).toEqual({ kind: "none" });
  expect(progress.all()).toEqual([]);
  expect(await evidence()).toEqual(before);
  expect(existsSync(retained.workspace)).toBe(false);
}

describe("a released skill without Continue", () => {
  let before: Awaited<ReturnType<typeof evidence>>;

  beforeEach(async () => {
    installOlderSkill();
    await git("worktree", "remove", retained.workspace);
    await git("branch", "-d", retained.branch);
    before = await evidence();
  });

  test("refuses a retry without replacing the retained preparation", async () => {
    await expectRefused(before);
  });
});

describe("a missing workspace", () => {
  let before: Awaited<ReturnType<typeof evidence>>;

  beforeEach(async () => {
    await git("worktree", "remove", retained.workspace);
    before = await evidence();
    await expectRefused(before);
  });

  test("keeps the refusal local to the damaged story when another starts", async () => {
    const independent = makeMe.aLaunchRequest
      .refining({
        identity: otherQueuedIdentity,
        title: "Story B",
        host: "codex",
      })
      .please();

    const outcome = await start(independent);
    const [profiles, original] = await Promise.all([
      origin.takenProfiles(),
      store.kept(source.id, queuedIdentity),
    ]);
    expect(outcome).toMatchObject({
      kind: "established",
      workspace: { path: path.join(origin.project, ".worktrees", "story-b") },
      handoff: {
        established: { preparation: { identity: otherQueuedIdentity } },
      },
    });
    expect(profiles).toHaveLength(2);
    expect(
      profiles.filter(({ identity }) => identity === queuedIdentity),
    ).toEqual(before.profiles);
    expect(original).toEqual(before.kept);
    expect(existsSync(retained.workspace)).toBe(false);
  });
});
