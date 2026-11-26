// A continuation resolves a kept workspace using its actual local Git state.
import { execFile } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
import {
  queuedReadyRepository,
  storyB,
} from "../../../Distribution/tests/support/queued-repository.mjs";
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

function expectSafetyRefusal(result: Started, detail: string) {
  const explanation = refusal(result);
  expect(explanation).toContain(detail);
  expect(explanation).toContain("assignment ownership remains unverified");
  expect(explanation).toContain("The start was kept");
  expect(explanation).not.toContain(
    "The installed command could not verify continuation.",
  );
  expect(publicationOf(result, undefined)).toEqual({ kind: "none" });
}

async function resumedAssignment(result: Started) {
  expect(result).toMatchObject({
    kind: "established",
    workspace: { path: workspace },
    handoff: {
      established: {
        preparation: { identity: queuedIdentity, workspace, branch },
      },
    },
  });
  expect(readdirSync(path.dirname(workspace))).toEqual([slug]);
  const [record, profiles] = await Promise.all([
    store.kept(source.id, queuedIdentity),
    origin.takenProfiles(),
  ]);
  const preparation = profiles.filter(
    (profile) => profile["activity"] === "preparation",
  );
  expect(preparation).toHaveLength(1);
  expect(record?.preparation).toMatchObject({
    workspace,
    branch,
    agent: preparation[0]?.["agent"],
  });
  return preparation[0];
}

describe("a preparation interrupted before its commit", () => {
  beforeEach(async () => {
    const hooks = path.join(origin.machine, "commit-hooks");
    mkdirSync(hooks);
    const precommit = path.join(hooks, "pre-commit");
    writeFileSync(precommit, "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    await exec("git", ["config", "core.hooksPath", hooks], {
      cwd: origin.project,
    });
    try {
      expect(refusal(await start())).toContain("gave no result");
    } finally {
      rmSync(precommit);
    }
    const kept = await store.kept(source.id, queuedIdentity);
    expect(kept).toMatchObject({ workspace, branch });
    expect(kept?.preparation).toBeUndefined();
    expect(kept?.preparationUnannounced).toBeUndefined();
    expect(await origin.takenProfiles()).toEqual([]);
  });

  test("preserves staged foreign work and later recovers without replacing an occupied agent", async () => {
    const file = "foreign-draft.txt";
    const foreign = path.join(workspace, file);
    writeFileSync(foreign, "Keep this unrelated work.\n");
    await exec("git", ["add", "--", file], { cwd: workspace });
    const diff = () => exec("git", ["diff", "--cached"], { cwd: workspace });
    const { stdout: staged } = await diff();
    const denied = await start();
    expectSafetyRefusal(
      denied,
      "the retained preparation's exact local allocation and published ownership could not be verified; no announcement was made",
    );
    expect((await diff()).stdout).toBe(staged);
    expect(readFileSync(foreign, "utf8")).toBe("Keep this unrelated work.\n");
    expect(await origin.takenProfiles()).toEqual([]);
    await exec("git", ["rm", "--cached", "--", file], { cwd: workspace });
    rmSync(foreign);
    const occupied = await origin.takenByAnotherAgent(storyB.identity);
    expect(occupied).toBe("Yui-chan");
    const occupant = async () =>
      (await origin.takenProfiles()).find(
        (profile) => profile["agent"] === occupied,
      );
    const allocation = () =>
      origin.originGit(
        "log",
        "-1",
        "--diff-filter=A",
        "--format=%H",
        "main",
        "--",
        ".planning/agents/yui-chan.json",
      );
    const [before, occupiedAllocation] = await Promise.all([
      occupant(),
      allocation(),
    ]);
    expect((await resumedAssignment(await start()))?.["agent"]).toBe(
      "Akiho-chan",
    );
    expect(await occupant()).toEqual(before);
    expect(await allocation()).toBe(occupiedAllocation);
  });

  test("names the failure printed by a continuation without a readable result", async () => {
    const script = path.join(
      origin.project,
      ".claude/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
    );
    const original = readFileSync(script);
    const printedFailure = "ownership probe exploded";
    writeFileSync(
      script,
      `if (process.argv[2] !== "continue") throw new Error("Expected continue");\nprocess.stderr.write(${JSON.stringify(printedFailure)});\nprocess.exitCode = 2;\n`,
    );
    const before = await store.kept(source.id, queuedIdentity);
    try {
      expectSafetyRefusal(await start(), printedFailure);
      expect(await store.kept(source.id, queuedIdentity)).toEqual(before);
      expect(await origin.takenProfiles()).toEqual([]);
    } finally {
      writeFileSync(script, original);
    }
    await resumedAssignment(await start());
  });
});
