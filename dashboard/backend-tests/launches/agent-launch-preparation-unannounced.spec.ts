// A verified unannounced retry clears its disposition before publishing.
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test } from "vitest";
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
  folder = localFolder("~/git/open-dough", home);
  store = startStore("refinement", home);
  env = { ...process.env, HOME: home };
  workspace = path.join(origin.project, ".worktrees", slug);
});

afterEach(async () => {
  try {
    await Promise.allSettled([running]);
  } finally {
    origin.cleanup();
  }
});

function start() {
  running = started(
    source,
    request,
    folder,
    new StartProgress(),
    { store: () => store, env },
    "refinement-attempt",
  );
  return running;
}

function refusal(result: Started) {
  if (result.kind !== "stopped" || result.result.kind !== "failed")
    throw new Error(
      `Expected a stopped preparation: ${JSON.stringify(result)}`,
    );
  return result.result.explanation;
}

beforeEach(async () => {
  const hook = path.join(origin.origin, "hooks", "pre-receive");
  writeFileSync(hook, "#!/bin/sh\necho refused >&2\nexit 1\n", { mode: 0o755 });
  try {
    expect(refusal(await start())).toContain("The start was kept");
  } finally {
    rmSync(hook);
  }
  expect(
    (await store.kept(source.id, queuedIdentity))?.preparationUnannounced,
  ).toBe(true);
  expect(await origin.takenProfiles()).toEqual([]);
});

let uncertain: Started;

beforeEach(async () => {
  const script = path.join(
    origin.project,
    ".claude/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
  );
  const original = readFileSync(script);
  const intact = path.join(
    path.dirname(script),
    "preparation-assignment-command.mjs",
  );
  writeFileSync(intact, original);
  writeFileSync(
    script,
    `import { spawnSync } from "node:child_process";\nconst result = spawnSync(process.execPath, [${JSON.stringify(intact)}, ...process.argv.slice(2)], { stdio: ["ignore", process.argv[2] === "start" ? "ignore" : "inherit", "inherit"] });\nprocess.exitCode = result.status ?? 1;\n`,
  );
  try {
    uncertain = await start();
  } finally {
    writeFileSync(script, original);
  }
});

test("clears the old disposition even if an accepted retry loses its response", async () => {
  expect(refusal(uncertain)).toContain("gave no result");
  expect(publicationOf(uncertain, undefined)).toEqual({ kind: "unknown" });
  const kept = await store.kept(source.id, queuedIdentity);
  expect(kept?.preparationUnannounced).toBe(false);
  expect(kept?.preparation).toBeUndefined();
  const [head, profiles] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    origin.takenProfiles(),
  ]);
  expect(profiles).toMatchObject([
    { activity: "preparation", identity: queuedIdentity },
  ]);
  expect(await start()).toMatchObject({
    kind: "established",
    workspace: { path: workspace },
    handoff: {
      established: {
        preparation: { identity: queuedIdentity, workspace, branch },
      },
    },
  });
  expect(readdirSync(path.dirname(workspace))).toEqual([slug]);
  expect(await origin.takenProfiles()).toEqual(profiles);
  expect(await origin.originGit("rev-parse", "main")).toBe(head);
});
