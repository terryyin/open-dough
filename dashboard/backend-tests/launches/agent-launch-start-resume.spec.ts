// Installed execution recovery follows a held or interrupted Git publication.
import { execFile } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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

const exec = promisify(execFile);
const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .executing({ identity: queuedIdentity, title: queuedTitle })
  .please();
const slug = "prepare-the-queued-start";

let origin: StartOrigin;
let folder: LocalFolder;
let store: StartStore;
let env: NodeJS.ProcessEnv;
let workspace: string;
let running: Promise<Started> | undefined;

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
  origin = await startOrigin(repository);
  const home = path.join(origin.machine, "home");
  const bin = path.join(home, "bin");
  mkdirSync(bin);
  writeFileSync(path.join(bin, "claude"), "", { mode: 0o755 });
  folder = localFolder("~/git/open-dough", home);
  store = startStore("execution", home);
  env = {
    ...process.env,
    HOME: home,
    PATH: `${bin}${path.delimiter}${process.env["PATH"] ?? ""}`,
  };
  workspace = path.join(origin.project, ".worktrees", slug);
});

afterEach(async () => {
  await Promise.allSettled([running]);
  origin.cleanup();
});

function start(
  progress = new StartProgress(),
  warning?: (time: string) => void,
) {
  running = started(
    source,
    request,
    folder,
    progress,
    { store: () => store, env, ...(warning && { warningMs: 1 }) },
    "execution-attempt",
    (time) => {
      warning?.(time);
      return Promise.resolve();
    },
  );
  return running;
}

async function claimedOnce(result: Started, candidate: string) {
  expect(result).toMatchObject({
    kind: "established",
    handoff: {
      established: {
        start: { workspace, candidateSha: candidate, publishedSha: candidate },
      },
    },
  });
  const [head, profiles] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    origin.takenProfiles(),
  ]);
  expect(head.trim()).toBe(candidate);
  expect(profiles).toEqual([
    expect.objectContaining({
      identity: queuedIdentity,
      branch: `claude/${slug}`,
    }),
  ]);
  expect(readdirSync(path.dirname(workspace))).toEqual([slug]);
}

describe("a held push", () => {
  let push: ReturnType<StartOrigin["holdPushes"]>;
  let warned: string | undefined;
  let progress: StartProgress;
  let pending: Promise<Started>;

  beforeEach(async () => {
    push = origin.holdPushes();
    warned = undefined;
    progress = new StartProgress();
    pending = start(progress, (time) => {
      warned = time;
    });
    try {
      await expect.poll(() => push.isHeld(), { timeout: 5_000 }).toBe(true);
    } catch (error) {
      push.release();
      await pending;
      throw error;
    }
  });

  test("warns and keeps running until the original Take establishes", async () => {
    try {
      await expect.poll(() => warned, { timeout: 2_500 }).toMatch(/^\d{4}-/);
      expect(progress.all()).toMatchObject([{ phase: "preparing" }]);
      const [head, kept] = await Promise.all([
        origin.originGit("rev-parse", "main"),
        store.kept(source.id, queuedIdentity),
      ]);
      expect(head.trim()).toBe(origin.revision("base"));
      expect(kept).toMatchObject({ workspace, branch: `claude/${slug}` });
      expect(kept?.start).toBeUndefined();
    } finally {
      push.release();
      await pending;
    }
    const candidate = (
      await exec("git", ["rev-parse", "HEAD"], { cwd: workspace })
    ).stdout.trim();
    await claimedOnce(await pending, candidate);
  });
});

test("a command refusal after the warning settles without publication", async () => {
  const gate = path.join(origin.machine, "refusal-held");
  writeFileSync(gate, "");
  writeFileSync(
    path.join(
      origin.project,
      ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
    ),
    `import { existsSync } from "node:fs";
const gate = ${JSON.stringify(gate)};
while (existsSync(gate)) await new Promise(resolve => setTimeout(resolve, 20));
console.log(JSON.stringify({ ok: false, status: "story-left-queue" }));
`,
  );
  let warned: string | undefined;
  const pending = start(new StartProgress(), (time) => {
    warned = time;
  });
  try {
    await expect.poll(() => warned, { timeout: 2_500 }).toMatch(/^\d{4}-/);
  } finally {
    rmSync(gate, { force: true });
    await pending;
  }
  const stopped = await pending;
  expect(stopped).toMatchObject({
    kind: "stopped",
    result: { kind: "failed", reason: "start-refused" },
  });
  if (stopped.kind === "stopped" && "explanation" in stopped.result)
    expect(stopped.result.explanation).toContain(
      "The start stopped (story-left-queue).",
    );
  expect(publicationOf(stopped, undefined)).toEqual({ kind: "none" });
  expect(await store.kept(source.id, queuedIdentity)).toBeUndefined();
  expect((await origin.originGit("rev-parse", "main")).trim()).toBe(
    origin.revision("base"),
  );
});
