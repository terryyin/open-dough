import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
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
import {
  queuedReadyRepository,
  storyA,
  storyB,
  storySeed,
} from "../../../Distribution/tests/support/queued-repository.mjs";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
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
  .executing({ identity: queuedIdentity, title: queuedTitle })
  .please();

let origin: StartOrigin;
let folder: LocalFolder;
let store: StartStore;
let env: NodeJS.ProcessEnv;
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
});

afterEach(async () => {
  await Promise.allSettled([attempt]);
  origin.cleanup();
});

async function refuse(
  request: AgentLaunchRequest,
  explanation: string,
  before: string,
  publication: "none" | "unknown" = "none",
) {
  assert(request.workflow === "execution");
  const progress = new StartProgress();

  attempt = started(
    source,
    request,
    folder,
    progress,
    { store: () => store, env },
    "start-attempt",
  );
  const result = await attempt;
  expect(result).toMatchObject({
    kind: "stopped",
    result: { kind: "failed", reason: "start-refused", explanation },
  });
  expect(publicationOf(result, undefined)).toEqual({ kind: publication });
  expect(progress.all()).toEqual([]);
  const [head, kept] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    store.kept(source.id, request.identity),
  ]);
  expect(head.trim()).toBe(before);
  return kept;
}

describe("a story Taken by another agent", () => {
  let taken: Awaited<ReturnType<StartOrigin["publishTake"]>>;

  beforeEach(async () => {
    taken = await origin.publishTake({
      agent: "Yui",
      story: storyA,
      queued: [storyB],
      mode: "story-branch",
    });
  });

  test("names its owner without replacing the Take", async () => {
    const kept = await refuse(
      request,
      `Taken by ${taken.agent}, so this dashboard did not start it. Nothing was launched.`,
      taken.claim,
    );

    expect(kept).toBeUndefined();
  });
});

test("a story outside the backlog is refused without keeping a start", async () => {
  const unqueued = makeMe.aLaunchRequest
    .executing({ identity: "SEED-A#not-queued", title: queuedTitle })
    .please();
  const kept = await refuse(
    unqueued,
    "The story is not queued in Backlog on origin, so it cannot be started. Nothing was launched.",
    origin.revision("base"),
  );

  expect(kept).toBeUndefined();
});

describe("an unrefined story", () => {
  let revision: string;

  beforeEach(async () => {
    revision = await origin.publishRevision({
      message: "Publish a story needing refinement",
      files: {
        ".planning/seeds/A.md": storySeed(storyA, "A rough idea."),
      },
      storyStates: [
        {
          identity: storyA.identity,
          href: storyA.href,
          ...makeMe.aStoryPreparation
            .with({ refinement: "not-refined", approach: "unselected" })
            .please(),
        },
      ],
    });
  });

  test("directs the developer to refinement without keeping a start", async () => {
    const kept = await refuse(
      request,
      "This story still needs refinement. Choose Start refinement before starting execution. Nothing was launched.",
      revision,
    );

    expect(kept).toBeUndefined();
  });
});

test("unreadable command output stops dispatch and keeps only the start draft", async () => {
  writeFileSync(
    path.join(
      origin.project,
      ".claude/skills/dough-execute-plan/scripts/execution-start.mjs",
    ),
    'process.stdout.write("not json\\n");\n',
  );

  const kept = await refuse(
    request,
    "The start command gave no result this dashboard could read, so the story may or may not be Taken. Workspace ~/git/open-dough/.worktrees/prepare-the-queued-start on branch claude/prepare-the-queued-start. The start was kept and can be resumed. Nothing was launched.",
    origin.revision("base"),
    "unknown",
  );

  expect(kept).toMatchObject({
    identity: queuedIdentity,
    branch: "claude/prepare-the-queued-start",
    workspace: path.join(
      origin.project,
      ".worktrees",
      "prepare-the-queued-start",
    ),
  });
  expect(kept?.start).toBeUndefined();
});
