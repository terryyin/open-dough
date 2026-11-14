// One published-main origin, native daemon and serial watcher chain. The tests
// advance it explicitly; setup never supplies a replacement or launch outcome.
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { observeLaunchAdmission } from "../../dashboard/tests/support/launchAdmissionObservation.ts";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { APIRequestContext, Browser, Page } from "@playwright/test";
import { developmentDashboard } from "../../dashboard/tests/support/dashboardCommand.ts";
import { localPublishedMainFixture } from "../../dashboard/tests/support/publishedMainFixture.ts";
import { startWatcherNativeCodex } from "../../dashboard/tests/support/watcherNativeCodex.ts";
import { configureWatcherApplication } from "../../dashboard/tests/support/productionWatcherFixture.ts";
import { serialFileResources } from "../../dashboard/tests/support/serialFileResources.ts";
import {
  deploymentWork,
  outputCount,
  productionReplacement,
  shownActivation,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "../../dashboard/tests/support/productionWatcher.ts";
import {
  buildGateChanges,
  recordedBuilds,
} from "../../dashboard/tests/support/productionBuildGate.ts";
import { faultGateChanges } from "../../dashboard/tests/support/productionFault.ts";
import {
  publishedPolicy,
  pushExclusions,
} from "../../dashboard/tests/support/productionQualificationFixture.ts";
import {
  expectSharedLaunchRecord,
  writeSharedLaunchRecord,
} from "../../dashboard/tests/support/sharedLaunchRecord.ts";
import { ciWorkflowPath } from "../../dashboard/server/productionQualification.mjs";

type PublishedMainFixture = Awaited<
  ReturnType<typeof localPublishedMainFixture>
>;
type Shared = Awaited<ReturnType<typeof writeSharedLaunchRecord>>;
type Started = {
  fixture: PublishedMainFixture;
  drainEvents: string;
  page: Page;
  watcher: ProductionWatcher;
  developmentUrl: string;
  workflow: string;
  configuration: string;
  configured: string;
  configurationIdentity: number;
  a: string;
  served: ProductionActivation;
  built: string[];
  shared?: Shared;
};

export const prefixesOf = (commits: string[]) =>
  commits.map((commit) => commit.slice(0, 12));
export type ProductionUpdateJourney = ReturnType<
  typeof productionUpdateJourney
>;

export function productionUpdateJourney() {
  // Each resource is released even when a later setup operation fails.
  const resources = serialFileResources();
  let watcher: ProductionWatcher | undefined;
  let prepared: Omit<Started, "served" | "built"> | undefined;
  let state: Started | undefined;
  let preparation: Promise<void> | undefined;
  function started(): Started {
    if (state === undefined)
      throw new Error("The watcher's first activation was not observed");
    return state;
  }
  function shared(): Shared {
    const record = started().shared;
    if (record === undefined)
      throw new Error("The shared record has not been supplied");
    return record;
  }
  // Setup publishes A and starts the watcher; the first test observes A's
  // activation through `activated()`, so the shared hook holds only the
  // preparation. The worker has already prepared the application source and
  // the pinned Codex executable (./publishedMainWorkerFixtures.ts).
  async function prepare(browser: Browser, pinnedWatcherCodex: string) {
    const fixture = await resources.acquire(
      () => localPublishedMainFixture(true, "application"),
      (owned) => owned.cleanup(),
    );
    const workflow = await readFile(
      path.join(fixture.development, ciWorkflowPath),
      "utf8",
    );
    expect(workflow).toContain(`  push:\n${pushExclusions}`);
    // A passes the fault gate, then the counting build gate.
    await fixture.commit(
      {
        ...fixture.markerChanges("MAIN A"),
        ...(await buildGateChanges(fixture.development, fixture.home)),
      },
      "Main A",
    );
    const a = await fixture.publish(
      {
        ...(await faultGateChanges(fixture.development)),
        [ciWorkflowPath]: publishedPolicy(workflow),
      },
      "Fault-gated A",
    );
    resources.ensureOpen();
    const {
      configuration,
      configured,
      env: applicationEnv,
    } = await configureWatcherApplication(fixture);
    const [host, dependencies] = await Promise.allSettled([
      resources.acquire(
        () => startWatcherNativeCodex(applicationEnv, pinnedWatcherCodex),
        (native) => native.close(),
      ),
      fixture.installDevelopment(),
    ]);
    if (host.status === "rejected") throw host.reason;
    if (dependencies.status === "rejected") throw dependencies.reason;
    const { env, drainEvents } = await observeLaunchAdmission(
      fixture.home,
      host.value.env,
    );
    const configurationIdentity = (await stat(configuration)).ino;
    const dev = await resources.acquire(
      () => developmentDashboard(fixture.development, env),
      (development) => development.command.stop(),
    );
    watcher = await resources.acquire(
      () => startProductionWatcher(fixture.development, env),
      (running) => running.stop(),
    );
    prepared = {
      fixture,
      drainEvents,
      page: await resources.acquire(
        () => browser.newPage(),
        (page) => page.close(),
      ),
      watcher,
      developmentUrl: dev.url,
      workflow,
      configuration,
      configured,
      configurationIdentity,
      a,
    };
  }
  test.beforeAll(
    async ({
      browser,
      publishedApplicationSourceReady,
      pinnedWatcherCodex,
    }) => {
      await Promise.resolve(publishedApplicationSourceReady);
      preparation = prepare(browser, pinnedWatcherCodex);
      await preparation;
    },
  );
  test.afterAll(async () => {
    try {
      await preparation;
    } finally {
      await resources.release();
    }
  });
  return {
    // Waits for the watcher to serve A and shows A's page.
    activated: async () => {
      if (prepared === undefined)
        throw new Error("The file's setup did not complete");
      const served = await shownActivation(
        prepared.watcher,
        prepared.a,
        prepared.page,
        "MAIN A",
      );
      state = { ...prepared, served, built: [prepared.a] };
      return state;
    },
    started,
    shared,
    stopped: () => {
      watcher = undefined;
    },
    builds: () => recordedBuilds(started().fixture.home),
    work: () => deploymentWork(watcher, started().fixture.home),
    count: (expression: RegExp) => outputCount(watcher, expression),
    expectSharedRecord: (request: APIRequestContext, url: string) =>
      expectSharedLaunchRecord(request, url, shared().record),
    replacedBy: async (commit: string) => {
      const current = started();
      current.served = await productionReplacement(
        watcher,
        current.served,
        commit,
      );
      current.built.push(commit);
      return current.served;
    },
  };
}
