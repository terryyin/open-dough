// The installed Codex execution start reuses a published Take whose session
// has yet to settle. The restart journey proves native first-input recovery.
import { readdirSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
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

const source = makeMe.aPublishedSource.openDough.please();
const request = makeMe.aLaunchRequest
  .executing({ identity: queuedIdentity, title: "Story A", host: "codex" })
  .please();

let origin: StartOrigin;
let store: StartStore;
let kept: StartRecord;
let published: string;
let pending: Promise<Started> | undefined;

function start() {
  const home = path.join(origin.machine, "home");
  pending = started(
    source,
    request,
    { path: origin.project, shown: "~/git/open-dough" },
    new StartProgress(),
    { store: () => store, env: { ...process.env, HOME: home } },
    "execution-attempt",
  );
  return pending;
}

beforeEach(async () => {
  pending = undefined;
  origin = await startOrigin(queuedReadyRepository().please(), {
    host: "codex",
  });
  store = startStore("execution", path.join(origin.machine, "home"));
  expect(await start()).toMatchObject({ kind: "established" });
  const record = await store.kept(source.id, queuedIdentity);
  if (record?.start === undefined)
    throw new Error("Missing published Codex start");
  kept = record;
  published = (await origin.originGit("rev-parse", "main")).trim();
});

afterEach(async () => {
  await Promise.allSettled([pending]);
  origin.cleanup();
});

test("the kept Codex execution reuses its published Take and workspace", async () => {
  const outcome = await start();
  const [head, profiles, record] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    origin.takenProfiles(),
    store.kept(source.id, queuedIdentity),
  ]);

  expect(outcome).toMatchObject({
    kind: "established",
    handoff: { established: { start: kept.start } },
    workspace: { path: path.join(origin.project, ".worktrees", "story-a") },
  });
  expect(head.trim()).toBe(published);
  expect(record?.start).toEqual(kept.start);
  expect(profiles).toEqual([
    expect.objectContaining({
      host: "codex",
      identity: queuedIdentity,
      branch: "codex/story-a",
    }),
  ]);
  expect(readdirSync(path.join(origin.project, ".worktrees"))).toEqual([
    "story-a",
  ]);
});
