// A damaged retained preparation blocks its own retry and preserves the
// evidence needed to reconcile it. The Codex retry E2E owns native dispatch.
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
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
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

type PublishedPreparation = Exclude<
  NonNullable<StartRecord["preparation"]>,
  { tracking: "one-shot" }
>;

const exec = promisify(execFile);
const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .refining({ identity: queuedIdentity, title: "Story A", host: "codex" })
  .please();
const allocationRef = "refs/worktree/dough/preparation-assignment";

let origin: StartOrigin;
let home: string;
let store: StartStore;
let kept: StartRecord;
let preparation: PublishedPreparation;
let pending: Promise<Started> | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, initial);
  } finally {
    initial.cleanup();
  }
});

function start(progress = new StartProgress()) {
  pending = started(
    source,
    request,
    { path: origin.project, shown: "~/git/open-dough" },
    progress,
    { store: () => store, env: { ...process.env, HOME: home } },
    "refinement-attempt",
  );
  return pending;
}

beforeEach(async () => {
  pending = undefined;
  origin = await startOrigin(repository, { host: "codex" });
  home = path.join(origin.machine, "home");
  store = startStore("refinement", home);
  expect(await start()).toMatchObject({ kind: "established" });
  const record = await store.kept(source.id, queuedIdentity);
  if (record?.preparation === undefined || "tracking" in record.preparation)
    throw new Error("Expected a published preparation.");
  kept = record;
  preparation = record.preparation;
});

afterEach(async () => {
  await Promise.allSettled([pending]);
  origin.cleanup();
});

async function git(cwd: string, ...args: string[]) {
  return (await exec("git", args, { cwd })).stdout;
}

function removeWorkspace() {
  return git(origin.project, "worktree", "remove", preparation.workspace);
}

function removeOwnership() {
  return git(preparation.workspace, "update-ref", "-d", allocationRef);
}

function retainPreparation(preparation: StartRecord["preparation"]) {
  return store.keep(
    source.id,
    makeMe.aStartRecord.with({ ...kept, preparation }).please(),
  );
}

async function evidence() {
  const [head, profiles, retained, branches, worktrees, allocation] =
    await Promise.all([
      origin.originGit("rev-parse", "main"),
      origin.takenProfiles(),
      store.kept(source.id, queuedIdentity),
      git(
        origin.project,
        "for-each-ref",
        "--format=%(refname) %(objectname)",
        "refs/heads/",
      ),
      git(origin.project, "worktree", "list", "--porcelain"),
      existsSync(preparation.workspace)
        ? git(
            preparation.workspace,
            "for-each-ref",
            "--format=%(objectname)",
            allocationRef,
          )
        : undefined,
    ]);
  return { head, profiles, retained, branches, worktrees, allocation };
}

async function expectRefused(before: Awaited<ReturnType<typeof evidence>>) {
  const progress = new StartProgress();
  const outcome = await start(progress);
  expect(outcome).toMatchObject({
    kind: "stopped",
    result: { kind: "failed", reason: "start-refused" },
  });
  if (outcome.kind !== "stopped" || outcome.result.kind !== "failed")
    throw new Error("Expected continuation refusal.");
  expect(outcome.result.explanation).toContain("must be reconciled");
  expect(outcome.result.explanation).toContain("story-a");
  expect(outcome.result.explanation).toContain("Nothing was launched.");
  const retained = before.retained?.preparation;
  if (retained !== undefined && !("tracking" in retained))
    expect(outcome.result.explanation).toContain(String(retained.agent));
  expect(publicationOf(outcome, undefined)).toEqual({ kind: "none" });
  expect(progress.all()).toEqual([]);
  expect(await evidence()).toEqual(before);
  expect(existsSync(preparation.workspace)).toBe(
    before.allocation !== undefined,
  );
}

const damageCases = [
  {
    name: "workspace and branch",
    async damage() {
      await removeWorkspace();
      await git(origin.project, "branch", "-d", preparation.branch);
    },
  },
  { name: "ownership", damage: removeOwnership },
  {
    name: "allocation",
    damage: () =>
      git(
        preparation.workspace,
        "update-ref",
        allocationRef,
        `${preparation.publishedSha}^`,
      ),
  },
  {
    name: "legacy ownership",
    async damage() {
      await removeOwnership();
      await retainPreparation({ ...preparation, publishedSha: undefined });
    },
  },
  {
    name: "uncertain result",
    async damage() {
      await removeOwnership();
      await retainPreparation(undefined);
    },
  },
  {
    name: "saved allocation",
    async damage() {
      const parent = await git(
        preparation.workspace,
        "rev-parse",
        `${preparation.publishedSha}^`,
      );
      await retainPreparation({ ...preparation, publishedSha: parent.trim() });
    },
  },
  {
    name: "retained facts",
    damage: () =>
      retainPreparation({ ...preparation, workspace: origin.project }),
  },
  {
    name: "missing script",
    damage: () =>
      rm(
        path.join(
          origin.project,
          ".agents/skills/dough-story-refinement/scripts/preparation-assignment.mjs",
        ),
      ),
  },
];

for (const variant of damageCases) {
  describe(variant.name, () => {
    let before: Awaited<ReturnType<typeof evidence>>;

    beforeEach(async () => {
      await variant.damage();
      before = await evidence();
    });

    test("refuses to replace the retained preparation", async () => {
      await expectRefused(before);
    });
  });
}
