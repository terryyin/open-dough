// One published-main origin, host pair and serial watcher chain. The tests
// advance it explicitly; setup never supplies a replacement or launch outcome.
import { expect, test } from "./pageTest.ts";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { APIRequestContext, Page } from "@playwright/test";
import { dashboardCommand, developmentDashboard } from "./dashboardCommand.ts";
import { publishedMainFixture } from "./publishedMainFixture.ts";
import { publishedMainHosts } from "./publishedMainHosts.ts";
import { processRunning } from "./processGroup.ts";
import { configureDevelopmentProjects } from "./projectConfiguration.ts";
import { publishes } from "./fakeGitHub.ts";
import {
  deploymentWork,
  outputCount,
  productionActivation,
  productionReplacement,
  startProductionWatcher,
  productionDeployments,
  productionInspections,
  type ProductionActivation,
  type ProductionWatcher,
} from "./productionWatcher.ts";
import {
  buildGateChanges,
  holdBuildPath,
  recordedBuilds,
} from "./productionBuildGate.ts";
import { faultGatedPackage, productionFault } from "./productionFault.ts";
import {
  expectSharedLaunchRecord,
  writeSharedLaunchRecord,
} from "./sharedLaunchRecord.ts";
import { ciWorkflowPath } from "../../server/productionQualification.mjs";
import { productionSeedProjects } from "../../server/projectConfigurationSeed.ts";

type Fixture = Awaited<ReturnType<typeof publishedMainFixture>>;
type Hosts = Awaited<ReturnType<typeof publishedMainHosts>>;
type Shared = Awaited<ReturnType<typeof writeSharedLaunchRecord>>;
type Started = {
  fixture: Fixture;
  hosts: Hosts;
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

export const pushExclusions =
  '    paths-ignore:\n      - ".planning/**"\n      - "docs/**"\n';
export const revision = "a5".repeat(20);
export const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
export const prefixesOf = (commits: string[]) =>
  commits.map((commit) => commit.slice(0, 12));
export type ProductionUpdateJourney = ReturnType<
  typeof productionUpdateJourney
>;

export function productionUpdateJourney() {
  // Each resource is cleaned even when a later setup operation fails.
  let fixture: Fixture | undefined;
  let hosts: Hosts | undefined;
  let development: ReturnType<typeof dashboardCommand> | undefined;
  let watcher: ProductionWatcher | undefined;
  let page: Page | undefined;
  let state: Started | undefined;
  function started(): Started {
    if (state === undefined)
      throw new Error("The file's setup did not complete");
    return state;
  }
  function shared(): Shared {
    const record = started().shared;
    if (record === undefined)
      throw new Error("The shared record has not been supplied");
    return record;
  }
  test.beforeAll(async ({ browser }) => {
    test.setTimeout(180_000);
    fixture = await publishedMainFixture(true);
    hosts = await publishedMainHosts(fixture);
    const { env } = hosts;
    hosts.github.serve("terryyin/open-dough", publishes({ revision, backlog }));
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
        "package.json": await faultGatedPackage(fixture.development),
        "production-fault.mjs": productionFault,
      },
      "Fault-gated A",
    );
    await fixture.installDevelopment();
    configureDevelopmentProjects(fixture.home);
    const configuration = path.join(
      fixture.home,
      ".open-dough/dashboard/projects-production.json",
    );
    const configured = `${JSON.stringify(productionSeedProjects, null, 4)}\n`;
    await writeFile(configuration, configured);
    const configurationIdentity = (await stat(configuration)).ino;
    const dev = await developmentDashboard(fixture.development, env);
    development = dev.command;
    watcher = startProductionWatcher(fixture.development, env);
    const served = await productionActivation(watcher, a);
    page = await browser.newPage();
    await page.goto(served.url);
    await expect(page).toHaveTitle("MAIN A");
    state = {
      fixture,
      hosts,
      page,
      watcher,
      developmentUrl: dev.url,
      workflow,
      configuration,
      configured,
      configurationIdentity,
      a,
      served,
      built: [a],
    };
  });
  test.afterAll(async () => {
    await page?.close();
    await watcher?.stop();
    await development?.stop();
    await fixture?.cleanup();
    await hosts?.close();
  });
  return {
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
    test.setTimeout(90_000);
    const state = journey.started();
    const { fixture, watcher: running } = state;
    const store = path.join(
      fixture.home,
      ".open-dough/dashboard/agent-launches.json",
    );
    const stored = await readFile(store, "utf8");
    const storeIdentity = (await stat(store)).ino;
    const ordinal = (await journey.builds()).length + 1;
    await writeFile(holdBuildPath(fixture.home, ordinal), "");
    await fixture.publish(fixture.markerChanges("MAIN X"), "Main X");
    await expect
      .poll(async () => (await journey.builds()).length, { timeout: 120_000 })
      .toBe(ordinal);
    const heldBuild = (await journey.builds())[ordinal - 1]?.pid;
    expect(processRunning(heldBuild)).toBe(true);
    await running.stop();
    expect(running.output()).not.toContain("could not run");
    journey.stopped();
    await expect.poll(() => processRunning(heldBuild)).toBe(false);
    await expect.poll(() => processRunning(state.served.pid)).toBe(false);
    await expect(
      request.get(state.served.url, { timeout: 2_000 }),
    ).rejects.toThrow();
    expect(await readdir(productionDeployments(fixture.home))).toEqual([]);
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
