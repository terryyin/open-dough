// A default ad hoc Start borrows the project's execution checkout: the real
// start publishes its Taken story from an owned claim checkout to the bare
// origin and answers the session start before any native launch, leaving the
// borrowed checkout's HEAD, index and changes as they were. The launch keeps
// that checkout and its common repository (../../server/nativeSessionRun.ts).
import { realpathSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { queuedReadyRepository } from "../../../Distribution/tests/support/queued-repository.mjs";
import { defaultLaunchStartFacts } from "../../server/defaultLaunchStart.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { started, type Started } from "../../server/launchStart.ts";
import { localFolder, type LocalFolder } from "../../server/localFolder.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { startStore } from "../../server/startStore.ts";
import { checkoutState } from "../../test-support/support/executionCheckoutChanges.ts";
import {
  startOrigin,
  type StartOrigin,
} from "../../test-support/support/startOrigin.ts";
import { keepStartedOrigin } from "../../test-support/support/startOriginPreparation.ts";

const source = makeMe.aPublishedSource.openDough.please();
const repository = queuedReadyRepository().please();
const began = new Date(2026, 8, 30, 14, 32);

let origin: StartOrigin;
let home: string;
let folder: LocalFolder;
let attempt: Promise<Started> | undefined;

beforeAll(async () => {
  for (const host of ["claude", "codex"] as const) {
    const initial = await startOrigin(repository, { host });
    try {
      keepStartedOrigin(host, repository, initial);
    } finally {
      initial.cleanup();
    }
  }
});

async function begin(host: "claude" | "codex") {
  origin = await startOrigin(repository, { host });
  home = path.join(origin.machine, "home");
  folder = localFolder("~/git/open-dough", home);
  // Kept starts live in this test's own machine store.
  vi.stubEnv("HOME", home);
}

beforeEach(() => {
  attempt = undefined;
});

afterEach(async () => {
  await Promise.allSettled([attempt]);
  vi.unstubAllEnvs();
  origin.cleanup();
});

for (const [asked, choices] of [
  ["with an instruction", { host: "claude", instruction: "Investigate." }],
  ["with no instruction", { host: "claude" }],
  ["for Codex", { host: "codex", instruction: "Investigate." }],
] as const) {
  test(`a default Start ${asked} publishes its Taken story and keeps the borrowed checkout`, async () => {
    await begin(choices.host);
    const request = makeMe.aLaunchRequest.adHoc(choices).please();
    const before = checkoutState(origin.project);
    const trunk = (await origin.originGit("rev-parse", "main")).trim();

    attempt = started(
      source,
      request,
      folder,
      new StartProgress(),
      {
        store: (workflow) => startStore(workflow, home),
        env: { ...process.env, HOME: home },
      },
      "ad-hoc-attempt",
      undefined,
      undefined,
      began,
    );
    const start = await attempt;

    if (start.kind !== "session" || start.publication.kind !== "published")
      throw new Error(`Expected a published session: ${JSON.stringify(start)}`);
    const published = (await origin.originGit("rev-parse", "main")).trim();
    expect(published).not.toBe(trunk);
    expect(start.publication.revision).toBe(published);
    expect(await origin.takenProfiles()).toEqual([
      expect.objectContaining({ identity: start.publication.identity }),
    ]);
    expect(start.workspace.path).toBe(origin.project);
    expect(checkoutState(origin.project)).toBe(before);
    const facts = await defaultLaunchStartFacts(
      recordedRequest(request, began),
      folder,
    );
    expect(facts.defaultStart).toEqual({
      workspace: origin.project,
      repository: realpathSync(path.join(origin.project, ".git")),
    });
  });
}
