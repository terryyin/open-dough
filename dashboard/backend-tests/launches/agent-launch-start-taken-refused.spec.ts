import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { started, type Started } from "../../server/launchStart.ts";
import { localFolder, type LocalFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore, type StartStore } from "../../server/startStore.ts";
import {
  queuedIdentity,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";

const source = makeMe.aPublishedSource.openDough.please();
const request = makeMe.aLaunchRequest
  .executing({ identity: queuedIdentity, title: "Story A" })
  .please();

let origin: StartOrigin;
let folder: LocalFolder;
let store: StartStore;
let env: NodeJS.ProcessEnv;
let attempt: Promise<Started> | undefined;

beforeEach(async () => {
  attempt = undefined;
  origin = await startOrigin(queuedReadyRepository().please());
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

test("a published Take without a session names the Agent and workspace and retains the start", async () => {
  attempt = started(
    source,
    request,
    folder,
    new StartProgress(),
    { store: () => store, env },
    "start-attempt",
  );
  const result = await attempt;
  if (result.kind !== "established") {
    throw new Error(`Expected a published Take: ${JSON.stringify(result)}`);
  }
  const [[profile], head, kept] = await Promise.all([
    origin.takenProfiles(),
    origin.originGit("rev-parse", "main"),
    store.kept(source.id, queuedIdentity),
  ]);
  expect(profile?.["identity"]).toBe(queuedIdentity);
  const workspace = "~/git/open-dough/.worktrees/story-a";
  expect(result.workflow.publishedWithoutSession(result)).toBe(
    `Taken by ${String(profile?.["agent"])}; no session started. Workspace ${workspace}.`,
  );
  expect(kept).toMatchObject({
    host: "claude",
    workspace: path.join(origin.project, ".worktrees", "story-a"),
    branch: "claude/story-a",
    start: {
      agent: profile?.["agent"],
      publishedSha: head.trim(),
    },
  });
});
