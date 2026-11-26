// The refinement start publishes and keeps its preparation before dispatch.
import { existsSync, rmSync } from "node:fs";
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
import { startOf } from "../../server/startWorkflows.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  queuedIdentity,
  queuedTitle,
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const story = { identity: queuedIdentity, title: queuedTitle };
const defaultRequest = makeMe.aLaunchRequest.refining(story).please();
const opusRequest = makeMe.aLaunchRequest
  .refining(story)
  .requestingModel("opus")
  .please();
const slug = "prepare-the-queued-start";
const branch = `claude/${slug}`;

let origin: StartOrigin;
let home: string;
let folder: LocalFolder;
let store: StartStore;
let progress: StartProgress;
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
  home = path.join(origin.machine, "home");
  folder = localFolder("~/git/open-dough", home);
  store = startStore("refinement", home);
  progress = new StartProgress();
});

afterEach(async () => {
  await Promise.allSettled([attempt]);
  origin.cleanup();
});

function start(request: AgentLaunchRequest): Promise<Started> {
  attempt = started(
    source,
    request,
    folder,
    progress,
    { store: () => store, env: { ...process.env, HOME: home } },
    "refinement-attempt",
  );
  return attempt;
}

for (const [model, request] of [
  ["Opus", opusRequest],
  ["Default", defaultRequest],
] as const) {
  test(`publishes Preparing and keeps the handoff (${model} model)`, async () => {
    const result = await start(request);
    if (
      result.kind !== "established" ||
      !("preparation" in result.handoff.established)
    )
      throw new Error(
        `Expected an established preparation: ${JSON.stringify(result)}`,
      );

    const preparation = result.handoff.established.preparation;
    const workspace = path.join(origin.project, ".worktrees", slug);
    const [head, profiles, kept] = await Promise.all([
      origin.originGit("rev-parse", "main"),
      origin.takenProfiles(),
      store.kept(source.id, queuedIdentity),
    ]);
    const publishedSha = head.trim();
    expect(publishedSha).not.toBe(origin.revision("base"));
    expect(profiles).toHaveLength(1);
    const [profile] = profiles;
    expect(profile).toMatchObject({
      identity: queuedIdentity,
      activity: "preparation",
      host: "claude",
    });
    expect(profile?.["model"]).toBe(request.model);
    const agent = profile?.["agent"];
    expect(typeof agent).toBe("string");
    expect(preparation).toEqual({
      identity: queuedIdentity,
      workspace,
      branch,
      remote: "origin",
      target: "main",
      publishedSha,
      agent,
    });
    expect(publicationOf(result, undefined)).toEqual({
      kind: "published",
      revision: publishedSha,
    });
    expect(result.workspace.path).toBe(workspace);
    expect(existsSync(workspace)).toBe(true);
    const lines = result.handoff.formatted?.split("\n") ?? [];
    expect(lines.slice(0, 2)).toEqual([
      "Established preparation:",
      `- identity: ${queuedIdentity}`,
    ]);
    for (const line of [
      `- workspace: ${workspace}`,
      `- branch: ${branch}`,
      `- agent: ${String(agent)}`,
      "- remote: origin",
      "- target: main",
      `- publishedSha: ${publishedSha}`,
      `- integration checkout: ${origin.project}`,
    ]) {
      expect(lines).toContain(line);
    }
    expect(kept).toMatchObject({
      host: "claude",
      workspace,
      branch,
      preparation,
    });
    expect(kept?.publisherId).toBeUndefined();
    expect(kept?.start).toBeUndefined();
    expect(kept?.model).toBe(request.model);
  });
}

test("the missing preparation formatter leaves the native launch without a start", async () => {
  const workflow = startOf("refinement");
  expect(await workflow?.establishes(folder, "claude")).toBe(true);
  rmSync(
    path.join(
      origin.project,
      ".claude/skills/dough-story-refinement/scripts/established-preparation.mjs",
    ),
  );
  expect(await workflow?.establishes(folder, "claude")).toBe(false);

  const result = await start(defaultRequest);

  expect(result).toEqual({ kind: "none" });
  expect(progress.all()).toEqual([]);
  const [head, kept] = await Promise.all([
    origin.originGit("rev-parse", "main"),
    store.kept(source.id, queuedIdentity),
  ]);
  expect(head.trim()).toBe(origin.revision("base"));
  expect(kept).toBeUndefined();
  expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
});
