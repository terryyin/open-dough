// Retained local evidence can be incomplete. Git verifies its allocation.
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeAll, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { started, type Started } from "../../server/launchStart.ts";
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

const exec = promisify(execFile);
const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const request = makeMe.aLaunchRequest
  .refining({ identity: queuedIdentity, title: "Story A", host: "codex" })
  .please();

let origin: StartOrigin;
let store: StartStore;
let home: string;
let retained: StartRecord;
let preparation: Exclude<
  NonNullable<StartRecord["preparation"]>,
  { tracking: "one-shot" }
>;
let profiles: Record<string, unknown>[];
let publication: string;
let pending: Promise<Started> | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, initial);
  } finally {
    initial.cleanup();
  }
});

function start() {
  pending = started(
    source,
    request,
    { path: origin.project, shown: "~/git/open-dough" },
    new StartProgress(),
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
  const [kept, head, assignments] = await Promise.all([
    store.kept(source.id, queuedIdentity),
    origin.originGit("rev-parse", "main"),
    origin.takenProfiles(),
  ]);
  if (kept?.preparation === undefined || "tracking" in kept.preparation)
    throw new Error("Expected a published preparation.");
  retained = kept;
  preparation = kept.preparation;
  publication = head.trim();
  profiles = assignments;
  expect(preparation.publishedSha).toBe(publication);
});

afterEach(async () => {
  await Promise.allSettled([pending]);
  origin.cleanup();
});

for (const evidence of ["legacy-sha", "lost-result"] as const) {
  test(`Codex retained ${evidence} continues only the workspace's verified allocation`, async () => {
    await store.keep(
      source.id,
      makeMe.aStartRecord
        .with({
          ...retained,
          preparation:
            evidence === "legacy-sha"
              ? { ...preparation, publishedSha: undefined }
              : undefined,
        })
        .please(),
    );

    const outcome = await start();
    const [head, assignments, kept, ref] = await Promise.all([
      origin.originGit("rev-parse", "main"),
      origin.takenProfiles(),
      store.kept(source.id, queuedIdentity),
      exec("git", ["rev-parse", "refs/worktree/dough/preparation-assignment"], {
        cwd: preparation.workspace,
      }),
    ]);

    const assignment = {
      agent: preparation.agent,
      workspace: preparation.workspace,
      branch: preparation.branch,
    };
    expect(outcome).toMatchObject({
      kind: "established",
      workspace: { path: preparation.workspace },
      handoff: { established: { preparation: assignment } },
    });
    expect(kept?.preparation).toMatchObject(assignment);
    expect(head.trim()).toBe(publication);
    expect(assignments).toEqual(profiles);
    expect(ref.stdout.trim()).toBe(publication);
  });
}
