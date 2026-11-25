// The typed start decides what will be handed to native launch after the real
// installed command publishes its Take on a private origin.
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, expect, test as base } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { started } from "../../server/launchStart.ts";
import { localFolder, type LocalFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore, type StartStore } from "../../server/startStore.ts";
import { startOf, type StoryStartInputs } from "../../server/startWorkflows.ts";
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
const defaultRequest = makeMe.aLaunchRequest.executing(story).please();
const namedRequest = makeMe.aLaunchRequest
  .executing(story)
  .requestingModel("opus")
  .please();

beforeAll(async () => {
  const initial = await startOrigin(repository);
  try {
    keepStartedOrigin("claude", repository, initial);
  } finally {
    initial.cleanup();
  }
});

const test = base.extend<{
  origin: StartOrigin;
  home: string;
  folder: LocalFolder;
  store: StartStore;
  inputs: StoryStartInputs;
}>({
  // Vitest requires a destructured fixture argument even with no dependencies.
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const origin = await startOrigin(repository);
    try {
      await use(origin);
    } finally {
      origin.cleanup();
    }
  },
  home: async ({ origin }, use) => use(path.join(origin.machine, "home")),
  folder: async ({ home }, use) => use(localFolder("~/git/open-dough", home)),
  store: async ({ home }, use) => use(startStore("execution", home)),
  inputs: async ({ home, store }, use) => {
    const bin = path.join(home, "bin");
    mkdirSync(bin);
    // The preflight checks for an executable; the start does not run the host.
    writeFileSync(path.join(bin, "claude"), "", { mode: 0o755 });
    await use({
      store: () => store,
      env: {
        ...process.env,
        HOME: home,
        PATH: `${bin}${path.delimiter}${process.env["PATH"] ?? ""}`,
      },
    });
  },
});

test.for([
  { model: "opus", request: namedRequest },
  { model: "Default", request: defaultRequest },
])(
  "publishes the Take and keeps the handoff ($model model)",
  async ({ request }, { origin, folder, store, inputs }) => {
    const result = await started(
      source,
      request,
      folder,
      new StartProgress(),
      inputs,
      "start-attempt",
    );

    if (
      result.kind !== "established" ||
      !("start" in result.handoff.established)
    )
      throw new Error(
        `Expected an established execution start: ${JSON.stringify(result)}`,
      );
    const start = result.handoff.established.start;
    const branch = "claude/prepare-the-queued-start";
    const workspace = path.join(
      origin.project,
      ".worktrees",
      "prepare-the-queued-start",
    );
    const publishedSha = (await origin.originGit("rev-parse", "main")).trim();
    const profiles = await origin.takenProfiles();
    expect(profiles).toEqual([
      expect.objectContaining({
        identity: queuedIdentity,
        host: "claude",
        mode: "story-branch",
        branch,
      }),
    ]);
    expect(profiles[0]?.["model"]).toBe(request.model);
    expect((await origin.originGit("rev-parse", branch)).trim()).toBe(
      publishedSha,
    );
    expect("publisherId" in start && start.publisherId).toMatch(
      /^dashboard-.+-open-dough$/,
    );
    expect(start).toMatchObject({
      identity: queuedIdentity,
      workspace,
      branch,
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha,
    });
    expect(result.workspace.path).toBe(workspace);
    expect(existsSync(workspace)).toBe(true);
    expect(result.handoff.formatted.split("\n")).toEqual(
      expect.arrayContaining([
        "Established start:",
        `- identity: ${queuedIdentity}`,
        `- workspace: ${workspace}`,
        `- branch: ${branch}`,
        `- publishedSha: ${publishedSha}`,
      ]),
    );
    expect((await store.kept(source.id, queuedIdentity))?.start).toEqual(start);
  },
);

test("refuses to publish to an origin outside the catalog project", async ({
  origin,
  folder,
  store,
  inputs,
}) => {
  const catalog = makeMe.aPublishedSource
    .with({ ...source, repository: "someone/else" })
    .please();
  const before = await origin.originGit("rev-parse", "main");

  const result = await started(
    catalog,
    defaultRequest,
    folder,
    new StartProgress(),
    inputs,
    "start-attempt",
  );

  expect(result).toMatchObject({
    kind: "stopped",
    result: {
      kind: "failed",
      reason: "start-refused",
      explanation:
        "The origin of ~/git/open-dough is not someone/else, where the Take would be published. Nothing was started or launched.",
    },
    publication: { kind: "none" },
  });
  expect(await origin.originGit("rev-parse", "main")).toBe(before);
  expect(await store.kept(source.id, queuedIdentity)).toBeUndefined();
});

test("falls back to a launch without a start when the installed formatter is missing", async ({
  origin,
  folder,
  store,
  inputs,
}) => {
  const workflow = startOf("execution");
  expect(await workflow?.establishes(folder, "claude")).toBe(true);
  rmSync(
    path.join(
      origin.project,
      ".claude/skills/dough-execute-plan/scripts/established-start.mjs",
    ),
  );
  const before = await origin.originGit("rev-parse", "main");

  const result = await started(
    source,
    defaultRequest,
    folder,
    new StartProgress(),
    inputs,
    "start-attempt",
  );

  expect(result).toEqual({ kind: "none" });
  expect(await origin.originGit("rev-parse", "main")).toBe(before);
  expect(existsSync(path.join(origin.project, ".worktrees"))).toBe(false);
  expect(await store.kept(source.id, queuedIdentity)).toBeUndefined();
});
