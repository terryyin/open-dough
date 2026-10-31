// One serial production chain proves replacement, durable start completion,
// shared machine records, published reads, policy decisions and shutdown.
import { expect, test } from "./support/pageTest.ts";
import { readFile, readdir, rm, writeFile } from "node:fs/promises";
import { processRunning } from "./support/processGroup.ts";
import {
  checkedAfterActivation,
  deploymentCheckout,
  productionDeployments,
} from "./support/productionWatcher.ts";
import {
  builtCommitPrefixes,
  holdBuildPath,
} from "./support/productionBuildGate.ts";
import { writeSharedLaunchRecord } from "./support/sharedLaunchRecord.ts";
import {
  productionUpdateJourney,
  productionUpdateShutdown,
  prefixesOf,
  revision,
  backlog,
} from "./support/productionUpdateJourney.ts";
import { productionUpdatePolicies } from "./support/productionUpdatePolicies.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import type { Acceptance, MachineAnswer } from "../src/agentLaunch.ts";

test.describe.configure({ mode: "serial" });
const journey = productionUpdateJourney();

test("repeated checks of unchanged main stay quiet and keep the same preview and build, which reads the shared launch record beside development", async ({
  request,
}) => {
  test.setTimeout(60_000);
  const state = journey.started();
  const { fixture, watcher } = state;
  expect(await journey.builds()).toEqual([
    { pid: expect.any(Number), checkout: deploymentCheckout(state.a) },
  ]);
  // Supply an existing durable record after startup. Real server reads must
  // discover the same HOME file; the fixture does not answer record HTTP.
  state.shared = await writeSharedLaunchRecord(fixture.home);
  await journey.expectSharedRecord(request, state.developmentUrl);
  await journey.expectSharedRecord(request, state.served.url);
  const checksBefore = watcher.checks();
  await expect.poll(() => watcher.checks()).toBeGreaterThan(checksBefore + 2);
  expect(watcher.output()).not.toContain("Checked published main:");
  expect(processRunning(state.served.pid)).toBe(true);
  expect(watcher.output().match(/preview PID \d+/g)).toEqual([
    `preview PID ${state.served.pid}`,
  ]);
  expect(journey.count(/Preparing production dashboard/g)).toBe(1);
  expect(await journey.builds()).toHaveLength(1);
});

test("a commit held in its build is served exactly at the same URL, and a later check replaces it with the next commit, keeping shared records and configuration", async ({
  request,
}) => {
  test.setTimeout(150_000);
  const state = journey.started();
  const { fixture, page, watcher, hosts } = state;
  hosts.claude.controls.claudeScenario("held");
  const launchesBefore = hosts.claude.controls.claudeLaunchCalls().length;
  const launch = {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "claude",
    instruction: "Keep this accepted start through the dashboard update.",
  };
  const start = () =>
    request.post(`${state.served.url}/__agent-launch/accept`, {
      headers: { Origin: state.served.url },
      data: launch,
    });
  const accepted = (await (await start()).json()) as Extract<
    Acceptance,
    { kind: "accepted" }
  >;
  expect(accepted.kind).toBe("accepted");
  await expect
    .poll(() => hosts.claude.controls.claudeLaunchCalls().length)
    .toBe(launchesBefore + 1);
  // B is selected and held in its real build while C reaches main. B is
  // served exactly; a later check then selects C.
  await writeFile(holdBuildPath(fixture.home, 2), "");
  await writeFile(holdBuildPath(fixture.home, 3), "");
  const b = await fixture.publish(fixture.markerChanges("MAIN B"), "Main B");
  await expect
    .poll(async () => (await journey.builds()).length, { timeout: 120_000 })
    .toBe(2);
  expect((await journey.builds())[1]?.checkout).toEqual(deploymentCheckout(b));
  const c = await fixture.publish(fixture.markerChanges("MAIN C"), "Main C");
  await rm(holdBuildPath(fixture.home, 2));
  await expect
    .poll(() => watcher.output(), { timeout: 120_000 })
    .toContain("Waiting for accepted dashboard starts before updating.");
  // The watcher's log precedes its request reaching the server. Polling the
  // held request observes closed admission without admitting another start.
  await expect.poll(async () => (await start()).status()).toBe(503);
  expect(processRunning(state.served.pid)).toBe(true);
  expect(watcher.output()).not.toContain(`Production dashboard ${b} at`);
  const blocked = await request.post(
    `${state.served.url}/__agent-launch/accept`,
    {
      headers: { Origin: state.served.url },
      data: {
        source: "open-dough",
        workflow: "ad-hoc",
        host: "claude",
        instruction: "Wait for the dashboard update.",
      },
    },
  );
  expect(blocked.status()).toBe(503);
  hosts.claude.controls.releaseHeldClaude();
  const switched = await journey.replacedBy(b);
  const sessions = await request.get(`${state.served.url}/__agent-launch`, {
    headers: { Origin: state.served.url },
  });
  const established = (await sessions.json()) as MachineAnswer;
  const attempt = established.attempts.find(
    (entry) => entry.id === accepted.attempt.id,
  );
  expect(attempt).toMatchObject({
    id: accepted.attempt.id,
    request: launch,
    outcome: { kind: "launched" },
    settledAt: expect.any(String),
  });
  if (attempt?.outcome?.kind !== "launched")
    throw new Error("The accepted attempt has no launched native session.");
  expect(established.records).toContainEqual(
    expect.objectContaining({
      request: expect.objectContaining(launch),
      session: expect.objectContaining(attempt.outcome.session),
    }),
  );
  expect(hosts.claude.controls.claudeLaunchCalls()).toHaveLength(
    launchesBefore + 1,
  );
  // Later steps compare the pre-existing shared record's bytes.
  await writeFile(journey.shared().store, journey.shared().stored);
  expect(watcher.output()).toContain(`Preparing production dashboard ${b}.`);
  await page.reload();
  await expect(page).toHaveTitle("MAIN B");
  await journey.expectSharedRecord(request, state.served.url);
  await expect
    .poll(() => watcher.output(), { timeout: 60_000 })
    .toContain(`Preparing production dashboard ${c}.`);
  expect(watcher.output()).not.toMatch(
    new RegExp(`Production dashboard ${c} at`),
  );
  await page.reload();
  await expect(page).toHaveTitle("MAIN B");
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

test("the served commit's page and boundaries read the backlog at the revision main names and refuse an unknown project", async ({
  request,
}) => {
  test.setTimeout(60_000);
  const state = journey.started();
  const { hosts, page } = state;
  const { github, claude } = hosts;
  // C's own page has read the backlog at the revision main names.
  await expect(
    page.getByRole("region", { name: "Published Git state" }),
  ).toContainText(revision);
  const callsBefore = github.calls.length;
  const read = await request.get(
    `${state.served.url}/__authenticated-read?source=open-dough`,
    { headers: { Origin: state.served.url } },
  );
  expect(read.status()).toBe(200);
  expect(await read.json()).toMatchObject({ revision, backlog });
  expect(
    github.calls.slice(callsBefore).map((call) => call.argv),
  ).toContainEqual([
    "api",
    "--include",
    "repos/terryyin/open-dough/commits/main",
    "--jq",
    ".sha",
  ]);
  // C's boundary keeps the backlog its page read at this revision.
  expect(
    github.calls
      .slice(callsBefore)
      .some(
        (call) =>
          call.request.kind === "content" &&
          call.request.revision === revision &&
          call.request.path === ".planning/PRODUCT-BACKLOG.md",
      ),
  ).toBe(false);
  const launchesBefore = claude.controls.claudeLaunchCalls().length;
  const refused = await request.post(
    `${state.served.url}/__agent-launch/accept`,
    {
      headers: { Origin: state.served.url },
      data: { ...launchRequest, source: "not-a-real-project" },
    },
  );
  expect(refused.status()).toBe(404);
  expect(await refused.json()).toHaveProperty("error");
  expect(claude.controls.claudeLaunchCalls()).toHaveLength(launchesBefore);
});

test("superseded checkouts are retired after the replacement serves, not before", async () => {
  test.setTimeout(90_000);
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
