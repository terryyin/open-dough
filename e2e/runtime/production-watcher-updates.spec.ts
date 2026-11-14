// One serial production chain proves replacement, durable start completion,
// shared machine records, published reads, policy decisions and shutdown.
// Accepted cost: the real npm install, Vite build and preview behind each
// activation, which a prepared or prebuilt deployment would bypass. Detailed
// policy ranges use the real selection owner without staging. Setup
// and waits around the activations stay open to improvement.
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { readFile, readdir, rm } from "node:fs/promises";
import { processRunning } from "../../dashboard/tests/support/processGroup.ts";
import {
  checkedAfterActivation,
  deploymentCheckout,
  productionDeployments,
} from "../../dashboard/tests/support/productionWatcher.ts";
import {
  builtCommitPrefixes,
  holdBuildPath,
} from "../../dashboard/tests/support/productionBuildGate.ts";
import { writeSharedLaunchRecord } from "../../dashboard/tests/support/sharedLaunchRecord.ts";
import {
  productionUpdateJourney,
  productionUpdateShutdown,
  prefixesOf,
} from "./productionUpdateJourney.ts";
import { productionUpdatePolicies } from "./productionUpdatePolicies.ts";
import { launchRequest } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { waitForWatcherOutput } from "../../dashboard/tests/support/watcherEvents.ts";
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

productionUpdatePolicies(journey);

productionUpdateShutdown(journey);
