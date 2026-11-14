// One serial production chain proves replacement, durable start completion,
// shared machine records, published reads, policy decisions and shutdown.
// Accepted cost: the real npm install, Vite build and preview behind each
// activation, which a prepared or prebuilt deployment would bypass. Detailed
// policy ranges use the real selection owner without staging. Setup
// and waits around the activations stay open to improvement.
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";
import {
  checkedAfterActivation,
  deploymentCheckout,
  expectProductionEnded,
  expectStillServing,
  productionDeployments,
  productionInspections,
  settledSkip,
} from "../../dashboard/tests/support/productionWatcher.ts";
import {
  builtCommitPrefixes,
  holdBuildPath,
  waitForBuild,
} from "../../dashboard/tests/support/productionBuildGate.ts";
import { writeSharedLaunchRecord } from "../../dashboard/tests/support/sharedLaunchRecord.ts";
import {
  productionUpdateJourney,
  prefixesOf,
} from "./productionUpdateJourney.ts";
import { launchRequest } from "../../dashboard/tests/agentLaunchBoundary.ts";
import {
  observeWatcherOutput,
  waitForWatcherOutput,
} from "../../dashboard/tests/support/watcherEvents.ts";
import { launchStoreFile } from "../../dashboard/tests/support/launchStore.ts";
import { publishedPolicy } from "../../dashboard/tests/support/productionQualificationFixture.ts";
import { ciWorkflowPath } from "../../dashboard/server/productionQualification.mjs";
import { replaceWhileStartDrains } from "./productionHeldUpdate.ts";

test.describe.configure({ mode: "serial" });
const journey = productionUpdateJourney();

test("repeated checks of unchanged main stay quiet and keep the same preview and build, which reads the shared launch record beside development", async ({
  request,
}) => {
  const state = await journey.activated();
  const { fixture, watcher } = state;
  expect(await journey.builds()).toEqual([
    { pid: expect.any(Number), checkout: deploymentCheckout(state.a) },
  ]);
  // Supply an existing durable record after startup. Real server reads must
  // discover the same HOME file; the fixture does not answer record HTTP.
  state.shared = writeSharedLaunchRecord(fixture.home);
  await journey.expectSharedRecord(request, state.developmentUrl);
  await journey.expectSharedRecord(request, state.served.url);
  const checksBefore = watcher.checks();
  await watcher.waitForChecks(checksBefore + 2);
  expect(watcher.output()).not.toContain("Checked published main:");
  expect(processRunning(state.served.pid)).toBe(true);
  expect(watcher.output().match(/preview PID \d+/g)).toEqual([
    `preview PID ${state.served.pid}`,
  ]);
  expect(journey.count(/Preparing production dashboard/g)).toBe(1);
  expect(await journey.builds()).toHaveLength(1);
});

// B is held in its build while C reaches main; the next test observes C.
let c: string;
test("a commit held in its build is served exactly at the same URL while the next commit reaches main, completing an accepted start and keeping shared records", async ({
  request,
}) => {
  c = await replaceWhileStartDrains(journey, request);
});

// The watcher first retires the checkout B replaced, then a later check
// prepares C, whose build stays held; the next test releases it.
test("a later check prepares the next commit while the held commit stays served", async () => {
  const state = journey.started();
  const { page, watcher } = state;
  await waitForWatcherOutput(
    watcher,
    new RegExp(`Preparing production dashboard ${c}\\.`),
  );
  expect(watcher.output()).not.toMatch(
    new RegExp(`Production dashboard ${c} at`),
  );
  await page.reload();
  await expect(page).toHaveTitle("MAIN B");
});

test("the next commit, released from its build, replaces the held commit at the same URL, keeping shared records and configuration", async ({
  request,
}) => {
  const state = journey.started();
  const { fixture, page } = state;
  const switched = state.served;
  await rm(holdBuildPath(fixture.home, 3));
  await journey.replacedBy(c);
  expect(processRunning(switched.pid)).toBe(false);
  await page.reload();
  await expect(page).toHaveTitle("MAIN C");
  expect(await builtCommitPrefixes(fixture.home)).toEqual(
    prefixesOf(state.built),
  );
  await journey.expectSharedRecord(request, state.served.url);
  await journey.expectSharedRecord(request, state.developmentUrl);
  expect(await readFile(journey.shared().store, "utf8")).toBe(
    journey.shared().stored,
  );
  expect(await readFile(state.configuration, "utf8")).toBe(state.configured);
});

test("the replacement serves the production read and launch boundaries", async ({
  request,
}) => {
  const { served } = journey.started();
  const read = await request.get(
    `${served.url}/__authenticated-read?source=not-a-real-project`,
    {
      headers: { Origin: served.url },
    },
  );
  expect(read.status()).toBe(404);
  expect(await read.json()).toHaveProperty("error");
  const refused = await request.post(`${served.url}/__agent-launch/accept`, {
    headers: { Origin: served.url },
    data: { ...launchRequest, source: "not-a-real-project" },
  });
  expect(refused.status()).toBe(404);
  expect(await refused.json()).toHaveProperty("error");
});

test("superseded checkouts are retired after the replacement serves, not before", async () => {
  const state = journey.started();
  const { fixture, watcher } = state;
  const c = state.built.at(-1) ?? "";
  await checkedAfterActivation(watcher, c);
  expect(await readdir(productionDeployments(fixture.home))).toEqual([
    deploymentCheckout(c),
  ]);
  expect(watcher.output()).not.toContain("Could not remove retired");
});

// These real watcher observations protect no-work and repeated rejection.
// Detailed range/baseline variants use the same production selection owner in
// backend-tests/runtime/production-update-selection.spec.ts without deployment staging.
test("npm watcher skips an excluded-only main range without install, build or restart", async () => {
  const state = journey.started();
  const { fixture, page, watcher } = state;
  const baseline = state.built.at(-1) ?? "";
  const before = await journey.work();
  const d = await fixture.publish(
    { "docs/d.md": "# D\n", ".planning/d.md": "# D\n" },
    "Document D",
  );
  await settledSkip(watcher, d);
  expect(watcher.output()).toContain(
    `Skipping production update ${d}: every change since ${baseline} is excluded by its CI push policy.`,
  );
  expect(await journey.work()).toEqual(before);
  await expectStillServing(state.served, page, "MAIN C");
});

test("npm watcher follows the published CI policy over a different local workflow", async () => {
  const state = journey.started();
  const { fixture, page, watcher } = state;
  const baseline = state.built.at(-1) ?? "";
  await writeFile(
    path.join(fixture.development, ciWorkflowPath),
    state.workflow,
  );
  const before = await journey.work();
  const g = await fixture.publish({ "extra/g.md": "# G\n" }, "Extra G");
  await settledSkip(watcher, g);
  expect(watcher.output()).toContain(
    `Skipping production update ${g}: every change since ${baseline} is excluded by its CI push policy.`,
  );
  expect(await journey.work()).toEqual(before);
  await expectStillServing(state.served, page, "MAIN C");
});

test("npm watcher keeps its baseline through an unsupported published policy, reported on each check before any install", async () => {
  const state = journey.started();
  const { fixture, page, watcher } = state;
  const baseline = state.built.at(-1) ?? "";
  const before = await journey.work();
  const p = await fixture.publish(
    {
      [ciWorkflowPath]: publishedPolicy(state.workflow).replace(
        "  push:\n",
        "  push:\n    # P\n",
      ),
      ...fixture.markerChanges("MAIN P"),
    },
    "Unsupported policy P",
  );
  const policyError = `Production update failed for ${p}: ${ciWorkflowPath} at ${p} has an unsupported CI push path policy.\nKeeping ${baseline} at ${state.served.url}; retrying on a later check.`;
  await observeWatcherOutput(watcher, (output) =>
    output.split(policyError).length > 3 ? true : undefined,
  );
  expect(await journey.work()).toEqual(before);
  await expectStillServing(state.served, page, "MAIN C");
});

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
