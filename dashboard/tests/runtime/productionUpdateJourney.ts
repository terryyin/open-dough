// One published-main origin, native daemon and serial watcher chain. The tests
// advance it explicitly; setup never supplies a replacement or launch outcome.
import { expect, test } from "../support/pageTest.ts";
import { observeLaunchAdmission } from "../support/launchAdmissionObservation.ts";
import { launchStoreFile } from "../support/launchStore.ts";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { APIRequestContext, Page } from "@playwright/test";
import {
  dashboardCommand,
  developmentDashboard,
} from "../support/dashboardCommand.ts";
import { localPublishedMainFixture } from "../support/publishedMainFixture.ts";
import { startWatcherNativeCodex } from "../support/watcherNativeCodex.ts";
import {
  configureWatcherApplication,
  watcherApplicationSource,
} from "../support/productionWatcherFixture.ts";
import { processRunning } from "../support/processGroup.ts";
import {
  deploymentWork,
  expectProductionEnded,
  outputCount,
  productionReplacement,
  shownActivation,
  startProductionWatcher,
  productionInspections,
  type ProductionActivation,
  type ProductionWatcher,
} from "../support/productionWatcher.ts";
import {
  buildGateChanges,
  holdBuildPath,
  recordedBuilds,
  waitForBuild,
} from "../support/productionBuildGate.ts";
import { faultGateChanges } from "../support/productionFault.ts";
import {
  publishedPolicy,
  pushExclusions,
} from "../support/productionQualificationFixture.ts";
import {
  expectSharedLaunchRecord,
  writeSharedLaunchRecord,
} from "../support/sharedLaunchRecord.ts";
import { ciWorkflowPath } from "../../server/productionQualification.mjs";

type Native = Awaited<ReturnType<typeof startWatcherNativeCodex>>;
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
  // Each resource is cleaned even when a later setup operation fails.
  let fixture: PublishedMainFixture | undefined;
  let native: Native | undefined;
  let development: ReturnType<typeof dashboardCommand> | undefined;
  let watcher: ProductionWatcher | undefined;
  let page: Page | undefined;
  let prepared: Omit<Started, "served" | "built"> | undefined;
  let state: Started | undefined;
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
  // preparation.
  test.beforeAll(async ({ browser }) => {
    fixture = await localPublishedMainFixture(watcherApplicationSource);
    const workflow = await readFile(
      path.join(fixture.development, ciWorkflowPath),
      "utf8",
    );
    expect(workflow).toContain(`  push:\n${pushExclusions}`);
    // A passes the fault gate, then the counting build gate.
    await fixture.commit(
      {
        ...fixture.markerChanges("MAIN A"),
        ...(await buildGateChanges(fixture.development)),
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
    const {
      configuration,
      configured,
      env: applicationEnv,
    } = await configureWatcherApplication(fixture);
    const [host, dependencies] = await Promise.allSettled([
      startWatcherNativeCodex(applicationEnv),
      fixture.installDevelopment(),
    ]);
    if (host.status === "rejected") throw host.reason;
    native = host.value;
    if (dependencies.status === "rejected") throw dependencies.reason;
    const { env, drainEvents } = await observeLaunchAdmission(
      fixture.home,
      native.env,
    );
    const configurationIdentity = (await stat(configuration)).ino;
    const dev = await developmentDashboard(fixture.development, env);
    development = dev.command;
    watcher = startProductionWatcher(fixture.development, env);
    page = await browser.newPage();
    prepared = {
      fixture,
      drainEvents,
      page,
      watcher,
      developmentUrl: dev.url,
      workflow,
      configuration,
      configured,
      configurationIdentity,
      a,
    };
  });
  test.afterAll(async () => {
    try {
      await page?.close();
      await watcher?.stop();
      await development?.stop();
    } finally {
      try {
        await native?.close();
      } finally {
        await fixture?.cleanup();
      }
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

export function productionUpdateShutdown(journey: ProductionUpdateJourney) {
  test("SIGTERM while a commit is in its real build ends that build, the served preview and every deployment checkout, and leaves shared records and configuration untouched", async ({
    request,
  }) => {
    const state = journey.started();
    const { fixture, watcher: running } = state;
    const store = launchStoreFile(fixture.home);
    const stored = await readFile(store, "utf8");
    const storeIdentity = (await stat(store)).ino;
    const ordinal = (await journey.builds()).length + 1;
    await writeFile(holdBuildPath(fixture.home, ordinal), "");
    await fixture.publish(
      {
        ...fixture.markerChanges("MAIN X"),
        [ciWorkflowPath]: state.workflow,
      },
      "Main X with a valid policy",
    );
    const heldBuild = (await waitForBuild(running, fixture.home, ordinal)).pid;
    expect(await journey.builds()).toHaveLength(ordinal);
    expect(processRunning(heldBuild)).toBe(true);
    await running.stop();
    expect(running.output()).not.toContain("could not run");
    journey.stopped();
    expect(processRunning(heldBuild)).toBe(false);
    await expectProductionEnded(request, state.served, fixture.home);
    expect(await readdir(productionInspections(fixture.home))).toEqual([]);
    expect(await readFile(store, "utf8")).toBe(stored);
    expect((await stat(store)).ino).toBe(storeIdentity);
    expect(await readFile(state.configuration, "utf8")).toBe(state.configured);
    expect((await stat(state.configuration)).ino).toBe(
      state.configurationIdentity,
    );
    expect((await request.get(state.developmentUrl)).status()).toBe(200);
  });
}
