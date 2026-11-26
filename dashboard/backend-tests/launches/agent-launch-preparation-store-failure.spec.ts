// The installed command's accepted publication survives a local result write failure.
import { readdirSync } from "node:fs";
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
  .refining({ identity: queuedIdentity, title: queuedTitle, host: "codex" })
  .please();
const slug = "prepare-the-queued-start";
const branch = `codex/${slug}`;
let origin: StartOrigin;
let folder: LocalFolder;
let store: StartStore;
let env: NodeJS.ProcessEnv;
let workspace: string;
let running: Promise<Started> | undefined;

beforeAll(async () => {
  const initial = await startOrigin(repository, { host: "codex" });
  try {
    keepStartedOrigin("codex", repository, initial);
  } finally {
    initial.cleanup();
  }
});

beforeEach(async () => {
  running = undefined;
  origin = await startOrigin(repository, { host: "codex" });
  const home = path.join(origin.machine, "home");
  folder = localFolder("~/git/open-dough", home);
  env = { ...process.env, HOME: home };
  store = startStore("refinement", home);
  workspace = path.join(origin.project, ".worktrees", slug);
});

afterEach(async () => {
  try {
    await Promise.allSettled([running]);
  } finally {
    origin.cleanup();
  }
});

for (const slow of [false, true]) {
  const timing = slow ? "slow start" : "ordinary wait";
  describe(timing, () => {
    let outcome: Started;
    let warning: string | undefined;
    let publishedAtWrite: string;

    beforeEach(async () => {
      warning = undefined;
      publishedAtWrite = "";
      const unwritable: StartStore = {
        ...store,
        update: async () => {
          publishedAtWrite = (
            await origin.originGit("rev-parse", "main")
          ).trim();
          throw new Error("The preparation result could not be written");
        },
      };
      running = started(
        source,
        request,
        folder,
        new StartProgress(),
        { store: () => unwritable, env, warningMs: slow ? 1 : 60_000 },
        "initial-refinement",
        (time) => {
          warning = time;
          return Promise.resolve();
        },
      );
      outcome = await running;
    });

    test("post-publication recording failure preserves preparation", async () => {
      if (slow) expect(warning).toMatch(/^\d{4}-/);
      else expect(warning).toBeUndefined();
      const [retained, head, profiles] = await Promise.all([
        store.kept(source.id, queuedIdentity),
        origin.originGit("rev-parse", "main"),
        origin.takenProfiles(),
      ]);
      const published = head.trim();
      expect(published).not.toBe(origin.revision("base"));
      expect(publishedAtWrite).toBe(published);
      expect(retained).toMatchObject({
        identity: queuedIdentity,
        host: "codex",
        workspace,
        branch,
      });
      expect(retained?.preparation).toBeUndefined();
      expect(profiles).toMatchObject([
        { activity: "preparation", host: "codex", identity: queuedIdentity },
      ]);
      expect(outcome).toMatchObject({
        kind: "established",
        handoff: {
          established: {
            preparation: {
              identity: queuedIdentity,
              workspace,
              publishedSha: published,
            },
          },
        },
      });
      if (outcome.kind !== "established")
        throw new Error("Published handoff missing");
      expect(outcome.handoff.formatted).toContain("Established preparation:");
      expect(outcome.handoff.formatted).toContain(
        `- publishedSha: ${published}`,
      );
      expect(publicationOf(outcome, undefined)).toEqual({
        kind: "published",
        revision: published,
      });

      running = started(
        source,
        request,
        folder,
        new StartProgress(),
        { store: () => store, env },
        "continued-refinement",
      );
      const resumed = await running;
      expect(resumed).toMatchObject({
        kind: "established",
        workspace: { path: workspace },
        handoff: {
          established: {
            preparation: { identity: queuedIdentity, workspace, branch },
          },
        },
      });
      const [nextHead, nextProfiles] = await Promise.all([
        origin.originGit("rev-parse", "main"),
        origin.takenProfiles(),
      ]);
      expect(nextHead).toBe(head);
      expect(nextProfiles).toEqual(profiles);
      expect(readdirSync(path.dirname(workspace))).toEqual([slug]);
    });
  });
}
