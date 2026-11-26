// The lost-result continuation reconstructs its candidate from the kept Git
// workspace. The script accepts only the isolated claim this publisher owns.
import { execFile } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
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
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { started, type Started } from "../../server/launchStart.ts";
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
let candidate: string;
let stopped: Started;
let pending: Promise<Started> | undefined;

function start() {
  pending = started(
    source,
    request,
    folder,
    new StartProgress(),
    { store: () => store, env },
    "execution-attempt",
  );
  return pending;
}

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  pending = undefined;
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
  const hook = path.join(origin.origin, "hooks", "pre-receive");
  writeFileSync(hook, "#!/bin/sh\nexit 1\n", { mode: 0o755 });
  try {
    stopped = await start();
    expect(stopped).toMatchObject({ kind: "stopped" });
  } finally {
    rmSync(hook);
  }
  candidate = (
    await exec("git", ["rev-parse", "HEAD"], { cwd: workspace })
  ).stdout.trim();
});

afterEach(async () => {
  await Promise.allSettled([pending]);
  origin.cleanup();
});

async function claimedOnce(result: Started, candidate: string) {
  const [head, profiles] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    origin.takenProfiles(),
  ]);

  expect(result).toMatchObject({
    kind: "established",
    handoff: {
      established: {
        start: { workspace, candidateSha: candidate, publishedSha: candidate },
      },
    },
  });
  expect(head.trim()).toBe(candidate);
  expect(profiles).toEqual([
    expect.objectContaining({
      identity: queuedIdentity,
      branch: `claude/${slug}`,
    }),
  ]);
  expect(readdirSync(path.dirname(workspace))).toEqual([slug]);
}

test("retains the recovery SHAs and Continue publishes that candidate", async () => {
  const kept = await store.kept(source.id, queuedIdentity);
  expect(stopped).toMatchObject({
    kind: "stopped",
    result: { reason: "start-refused" },
  });
  if (stopped.kind === "stopped" && "explanation" in stopped.result)
    expect(stopped.result.explanation).toContain(
      "The start was kept and can be resumed.",
    );
  expect(await origin.takenProfiles()).toEqual([]);
  expect(kept).toMatchObject({
    startingRevision: origin.revision("base"),
    candidateSha: candidate,
  });
  const script = path.join(
    origin.project,
    ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
  );
  const realScript = path.join(
    path.dirname(script),
    "real-execution-start.mjs",
  );
  const argsLog = path.join(origin.machine, "resume-args.json");
  renameSync(script, realScript);
  writeFileSync(
    script,
    `import { writeFileSync } from "node:fs";
writeFileSync(${JSON.stringify(argsLog)}, JSON.stringify(process.argv.slice(2)));
process.argv[1] = ${JSON.stringify(realScript)};
await import("./real-execution-start.mjs");
`,
  );
  await claimedOnce(await start(), candidate);
  const args: unknown = JSON.parse(readFileSync(argsLog, "utf8"));
  expect(args).toEqual(
    expect.arrayContaining([
      "--starting-revision",
      origin.revision("base"),
      "--candidate-sha",
      candidate,
    ]),
  );
});

describe("when the server lost the command result", () => {
  beforeEach(async () => {
    const kept = await store.kept(source.id, queuedIdentity);
    if (kept === undefined)
      throw new Error("Missing the unpublished claim draft");
    // A process that did not receive the installed command's result wrote only
    // the draft. The real candidate and unpublished origin are left in place.
    await store.keep(
      source.id,
      makeMe.aStartRecord
        .with({
          ...kept,
          startingRevision: undefined,
          candidateSha: undefined,
          start: undefined,
        })
        .please(),
    );
  });

  test("Continue reconstructs the Take from the original branch and worktree", async () => {
    await claimedOnce(await start(), candidate);
  });

  test("Continue refuses a worktree head that is not the isolated owned claim", async () => {
    await exec("git", ["commit", "--allow-empty", "-m", "Unrelated work"], {
      cwd: workspace,
      env,
    });
    const result = await start();
    expect(result).toMatchObject({
      kind: "stopped",
      result: { kind: "failed", reason: "start-refused" },
    });
    if (result.kind === "stopped" && "explanation" in result.result)
      expect(result.result.explanation).toContain(
        "The workspace could not be set up: retained candidate or workspace is not the isolated owned claim.",
      );
    expect(await origin.takenProfiles()).toEqual([]);
  });
});
