// The real npm watcher follows published main on one build chain: it replaces
// production with each newly published commit at the same URL, qualifies each
// range against the last served commit with the selected commit's own CI
// push exclusions, keeps its baseline through unsupported policies and failed
// builds, and preserves the shared machine records throughout. Shared machine
// evidence and external gh/Claude answers come only from disposable
// origin/host fixtures. Each test steps the shared watcher to its next state
// from the watcher's own output and asserts that delta.
import { expect, test } from "./support/pageTest.ts";
import { readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { APIRequestContext, Page } from "@playwright/test";
import {
  dashboardCommand,
  developmentDashboard,
} from "./support/dashboardCommand.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { publishedMainHosts } from "./support/publishedMainHosts.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";
import { processRunning } from "./support/processGroup.ts";
import { publishes } from "./support/fakeGitHub.ts";
import {
  checkedAfterActivation,
  deploymentCheckout,
  deploymentWork,
  outputCount,
  productionActivation,
  productionDeployments,
  productionInspections,
  productionReplacement,
  settledSkip,
  startProductionWatcher,
  type ProductionActivation,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";
import {
  buildGateChanges,
  builtCommitPrefixes,
  holdBuildPath,
  recordedBuilds,
} from "./support/productionBuildGate.ts";
import {
  faultGatedPackage,
  productionFault,
} from "./support/productionFault.ts";
import {
  expectSharedLaunchRecord,
  writeSharedLaunchRecord,
} from "./support/sharedLaunchRecord.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import { ciWorkflowPath } from "../server/productionQualification.mjs";
import { productionSeedProjects } from "../server/projectConfigurationSeed.ts";

test.describe.configure({ mode: "serial" });

type Fixture = Awaited<ReturnType<typeof publishedMainFixture>>;
type Hosts = Awaited<ReturnType<typeof publishedMainHosts>>;

const pushExclusions =
  '    paths-ignore:\n      - ".planning/**"\n      - "docs/**"\n';
const revision = "a5".repeat(20);
const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";

// What a failed setup may leave undefined is closed by afterAll regardless;
// every test reads the started ones through `started()`.
let fixture: Fixture | undefined;
let hosts: Hosts | undefined;
let development: ReturnType<typeof dashboardCommand> | undefined;
let developmentUrl: string;
let watcher: ProductionWatcher | undefined;
let page: Page | undefined;
let workflow: string;
let configuration: string;
let configured: string;
let configurationIdentity: number;
let a: string;
let served: ProductionActivation;
// The durable launch record both servers must discover in the shared HOME.
let shared: Awaited<ReturnType<typeof writeSharedLaunchRecord>>;
// Every commit the chain built so far, in build order.
const built: string[] = [];
const builds = () => recordedBuilds(started().fixture.home);
const work = () => deploymentWork(watcher, started().fixture.home);
const count = (expression: RegExp) => outputCount(watcher, expression);
const prefixesOf = (commits: string[]) =>
  commits.map((commit) => commit.slice(0, 12));
const expectSharedRecord = (request: APIRequestContext, url: string) =>
  expectSharedLaunchRecord(request, url, shared.record);

function started() {
  if (
    fixture === undefined ||
    hosts === undefined ||
    page === undefined ||
    watcher === undefined
  ) {
    throw new Error("The file's setup did not complete");
  }
  return { fixture, hosts, page, watcher };
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(180_000);
  fixture = await publishedMainFixture(true);
  hosts = await publishedMainHosts(fixture);
  const { env } = hosts;
  hosts.github.serve("terryyin/open-dough", publishes({ revision, backlog }));
  workflow = await readFile(
    path.join(fixture.development, ciWorkflowPath),
    "utf8",
  );
  expect(workflow).toContain(`  push:\n${pushExclusions}`);
  // A's build first passes its fault gate, then the counting build gate.
  await fixture.commit(
    {
      ...fixture.markerChanges("MAIN A"),
      ...(await buildGateChanges(fixture.development)),
    },
    "Main A",
  );
  a = await fixture.publish(
    {
      "package.json": await faultGatedPackage(fixture.development),
      "production-fault.mjs": productionFault,
    },
    "Fault-gated A",
  );
  await fixture.installDevelopment();
  configureDevelopmentProjects(fixture.home);
  // Production's physical project configuration, with distinctive bytes.
  configuration = path.join(
    fixture.home,
    ".open-dough/dashboard/projects-production.json",
  );
  configured = `${JSON.stringify(productionSeedProjects, null, 4)}\n`;
  await writeFile(configuration, configured);
  configurationIdentity = (await stat(configuration)).ino;
  const started = await developmentDashboard(fixture.development, env);
  development = started.command;
  developmentUrl = started.url;
  watcher = startProductionWatcher(fixture.development, env);
  served = await productionActivation(watcher, a);
  built.push(a);
  page = await browser.newPage();
  await page.goto(served.url);
  await expect(page).toHaveTitle("MAIN A");
});

test.afterAll(async () => {
  await page?.close();
  await watcher?.stop();
  await development?.stop();
  await fixture?.cleanup();
  await hosts?.close();
});

// Serves the commit at production's fixed URL, replacing the running preview.
async function replacedBy(commit: string) {
  served = await productionReplacement(watcher, served, commit);
  built.push(commit);
  return served;
}

test("repeated checks of unchanged main keep the same preview and build, which reads the shared launch record beside development", async ({
  request,
}) => {
  test.setTimeout(60_000);
  const { fixture, watcher } = started();
  expect(await builds()).toEqual([
    { pid: expect.any(Number), checkout: deploymentCheckout(a) },
  ]);
  // Supply an existing durable record after startup. Real server reads must
  // discover the same HOME file; the fixture does not answer record HTTP.
  shared = await writeSharedLaunchRecord(fixture.home);
  await expectSharedRecord(request, developmentUrl);
  await expectSharedRecord(request, served.url);
  const checksBefore = count(/Checked published main: /g);
  await expect
    .poll(() => count(new RegExp(`Checked published main: ${a}\\.`, "g")))
    .toBeGreaterThan(checksBefore + 2);
  expect(processRunning(served.pid)).toBe(true);
  expect(watcher.output().match(/preview PID \d+/g)).toEqual([
    `preview PID ${served.pid}`,
  ]);
  expect(count(/Preparing production dashboard/g)).toBe(1);
  expect(await builds()).toHaveLength(1);
});

test("a commit held in its build is served exactly at the same URL, and a later check replaces it with the next commit, keeping shared records and configuration", async ({
  request,
}) => {
  test.setTimeout(150_000);
  const { fixture, page, watcher } = started();
  // B is selected and held in its real build while C reaches main. B is
  // served exactly; a later check then selects C.
  await writeFile(holdBuildPath(fixture.home, 2), "");
  await writeFile(holdBuildPath(fixture.home, 3), "");
  const b = await fixture.publish(fixture.markerChanges("MAIN B"), "Main B");
  await expect
    .poll(async () => (await builds()).length, { timeout: 120_000 })
    .toBe(2);
  expect((await builds())[1]?.checkout).toEqual(deploymentCheckout(b));
  const c = await fixture.publish(fixture.markerChanges("MAIN C"), "Main C");
  await rm(holdBuildPath(fixture.home, 2));
  const switched = await replacedBy(b);
  expect(watcher.output()).toContain(`Preparing production dashboard ${b}.`);
  await page.reload();
  await expect(page).toHaveTitle("MAIN B");
  await expectSharedRecord(request, served.url);
  await expect
    .poll(() => watcher.output(), { timeout: 60_000 })
    .toContain(`Preparing production dashboard ${c}.`);
  expect(watcher.output()).not.toMatch(
    new RegExp(`Production dashboard ${c} at`),
  );
  await page.reload();
  await expect(page).toHaveTitle("MAIN B");
  await rm(holdBuildPath(fixture.home, 3));
  await replacedBy(c);
  expect(processRunning(switched.pid)).toBe(false);
  await page.reload();
  await expect(page).toHaveTitle("MAIN C");
  expect(await builtCommitPrefixes(fixture.home)).toEqual(prefixesOf(built));
  await expectSharedRecord(request, served.url);
  await expectSharedRecord(request, developmentUrl);
  expect(await readFile(shared.store, "utf8")).toBe(shared.stored);
  expect(await readFile(configuration, "utf8")).toBe(configured);
});

test("the served commit's page and boundaries read the backlog at the revision main names and refuse an unknown project", async ({
  request,
}) => {
  test.setTimeout(60_000);
  const { hosts, page } = started();
  const { github, claude } = hosts;
  // C's own page has read the backlog at the revision main names.
  await expect(
    page.getByRole("region", { name: "Published Git state" }),
  ).toContainText(revision);
  const callsBefore = github.calls.length;
  const read = await request.get(
    `${served.url}/__authenticated-read?source=open-dough`,
    { headers: { Origin: served.url } },
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
  const refused = await request.post(`${served.url}/__agent-launch/accept`, {
    headers: { Origin: served.url },
    data: { ...launchRequest, source: "not-a-real-project" },
  });
  expect(refused.status()).toBe(404);
  expect(await refused.json()).toHaveProperty("error");
  expect(claude.controls.claudeLaunchCalls()).toHaveLength(launchesBefore);
});

test("superseded checkouts are retired after the replacement serves, not before", async () => {
  test.setTimeout(90_000);
  const { fixture, watcher } = started();
  const c = built.at(-1) ?? "";
  await checkedAfterActivation(watcher, c);
  expect(await readdir(productionDeployments(fixture.home))).toEqual([
    deploymentCheckout(c),
  ]);
  expect(watcher.output()).not.toContain("Could not remove retired");
});

test("npm watcher skips excluded-only main ranges, builds accumulated and mixed ranges once at the latest commit, and follows the published CI policy over a different local workflow", async () => {
  test.setTimeout(150_000);
  const { fixture, page, watcher } = started();
  const baseline = built.at(-1) ?? "";

  // Excluded-only D: completed checks keep the served commit without
  // install, build or restart.
  const before = await work();
  const d = await fixture.publish(
    { "docs/d.md": "# D\n", ".planning/d.md": "# D\n" },
    "Document D",
  );
  await settledSkip(watcher, d);
  expect(watcher.output()).toContain(
    `Skipping production update ${d}: every change since ${baseline} is excluded by its CI push policy.`,
  );
  expect(await work()).toEqual(before);
  expect(processRunning(served.pid)).toBe(true);
  await page.reload();
  await expect(page).toHaveTitle("MAIN C");

  // An application commit (with documentation) then a documentation-only
  // commit reach main together: the whole range qualifies and builds the
  // latest commit once.
  const application = await fixture.commit(
    { ...fixture.markerChanges("MAIN E"), "docs/e.md": "# E\n" },
    "Application E",
  );
  const e = await fixture.commit({ "docs/e-notes.md": "# E\n" }, "Notes E");
  await fixture.push();
  await replacedBy(e);
  await page.reload();
  await expect(page).toHaveTitle("MAIN E");
  expect(watcher.output()).not.toContain(application);
  expect(await builtCommitPrefixes(fixture.home)).toEqual(prefixesOf(built));
  expect((await work()).preparing).toBe(before.preparing + 1);

  // F changes the published push exclusions within a mixed update.
  const policy = workflow.replace(
    pushExclusions,
    '    paths-ignore:\n      - ".planning/**"\n      - "extra/**"\n',
  );
  const f = await fixture.publish(
    {
      [ciWorkflowPath]: policy,
      "docs/policy.md": "# Policy\n",
      ...fixture.markerChanges("MAIN F"),
    },
    "Policy F",
  );
  await replacedBy(f);
  await page.reload();
  await expect(page).toHaveTitle("MAIN F");
  // The development checkout keeps a different, uncommitted workflow.
  await writeFile(path.join(fixture.development, ciWorkflowPath), workflow);

  const beforeG = await work();
  const g = await fixture.publish({ "extra/g.md": "# G\n" }, "Extra G");
  await settledSkip(watcher, g);
  expect(watcher.output()).toContain(
    `every change since ${f} is excluded by its CI push policy.`,
  );
  expect(await work()).toEqual(beforeG);
  expect(processRunning(served.pid)).toBe(true);

  // F's published policy no longer excludes docs/, so H qualifies.
  const h = await fixture.publish({ "docs/h.md": "# H\n" }, "Document H");
  await replacedBy(h);
  expect(watcher.output()).not.toContain(`Skipping production update ${h}`);
  expect(await builtCommitPrefixes(fixture.home)).toEqual(prefixesOf(built));
  await page.reload();
  await expect(page).toHaveTitle("MAIN F");
});

test("npm watcher keeps its baseline through an unsupported published policy and failed builds, then compares from the next successful activation", async () => {
  test.setTimeout(150_000);
  const { fixture, page, watcher } = started();
  const baseline = built.at(-1) ?? "";

  // An unsupported policy at P is reported on each check before any install.
  const before = await work();
  const p = await fixture.publish(
    {
      [ciWorkflowPath]: workflow.replace("  push:\n", "  push:\n    # P\n"),
      ...fixture.markerChanges("MAIN P"),
    },
    "Unsupported policy P",
  );
  const policyError = `Production update failed for ${p}: ${ciWorkflowPath} at ${p} has an unsupported CI push path policy.\nKeeping ${baseline} at ${served.url}; retrying on a later check.`;
  await expect
    .poll(() => watcher.output().split(policyError).length - 1, {
      timeout: 60_000,
    })
    .toBeGreaterThan(2);
  expect(await work()).toEqual(before);
  expect(processRunning(served.pid)).toBe(true);
  await page.reload();
  await expect(page).toHaveTitle("MAIN F");

  // A valid Q appears: the range to Q still holds P's application change.
  const q = await fixture.publish(
    { [ciWorkflowPath]: workflow, "docs/q.md": "# Q\n" },
    "Valid policy Q",
  );
  const atQ = await replacedBy(q);
  await page.reload();
  await expect(page).toHaveTitle("MAIN P");
  expect(await builtCommitPrefixes(fixture.home)).toEqual(prefixesOf(built));

  // R fails its real build; documentation-only S is still compared with Q.
  const buildFault = path.join(fixture.home, "fault-build");
  await writeFile(buildFault, "transient build cause");
  const r = await fixture.publish(fixture.markerChanges("MAIN R"), "Main R");
  await expect
    .poll(() => watcher.output(), { timeout: 120_000 })
    .toContain(`Production update failed for ${r}: `);
  expect(watcher.output()).toContain("TRANSIENT build FAILURE");
  const s = await fixture.publish({ "docs/s.md": "# S\n" }, "Document S");
  await expect
    .poll(() => watcher.output(), { timeout: 120_000 })
    .toContain(`Production update failed for ${s}: `);
  expect(watcher.output()).toContain(`Keeping ${q} at ${served.url}`);
  expect(processRunning(atQ.pid)).toBe(true);
  await rm(buildFault);
  await replacedBy(s);
  expect(watcher.output()).not.toContain(`Skipping production update ${s}`);
  expect(watcher.output()).not.toMatch(
    new RegExp(`Production dashboard ${r} at`),
  );
  await page.reload();
  await expect(page).toHaveTitle("MAIN R");
  expect(await builtCommitPrefixes(fixture.home)).toEqual(prefixesOf(built));

  // The next comparison starts at S, so documentation-only T is skipped.
  const beforeT = await work();
  const t = await fixture.publish({ "docs/t.md": "# T\n" }, "Document T");
  await settledSkip(watcher, t);
  expect(watcher.output()).toContain(
    `Skipping production update ${t}: every change since ${s} is excluded by its CI push policy.`,
  );
  expect(await work()).toEqual(beforeT);
  expect(processRunning(served.pid)).toBe(true);
});

test("SIGTERM while a commit is in its real build ends that build, the served preview and every deployment checkout, and leaves shared records and configuration untouched", async ({
  request,
}) => {
  test.setTimeout(90_000);
  const { fixture, watcher: running } = started();
  const store = path.join(
    fixture.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const stored = await readFile(store, "utf8");
  const storeIdentity = (await stat(store)).ino;
  const ordinal = (await builds()).length + 1;
  await writeFile(holdBuildPath(fixture.home, ordinal), "");
  await fixture.publish(fixture.markerChanges("MAIN X"), "Main X");
  await expect
    .poll(async () => (await builds()).length, { timeout: 120_000 })
    .toBe(ordinal);
  const heldBuild = (await builds())[ordinal - 1]?.pid;
  expect(processRunning(heldBuild)).toBe(true);
  await running.stop();
  expect(running.output()).not.toContain("could not run");
  watcher = undefined;
  await expect.poll(() => processRunning(heldBuild)).toBe(false);
  await expect.poll(() => processRunning(served.pid)).toBe(false);
  await expect(request.get(served.url, { timeout: 2_000 })).rejects.toThrow();
  expect(await readdir(productionDeployments(fixture.home))).toEqual([]);
  expect(await readdir(productionInspections(fixture.home))).toEqual([]);
  expect(await readFile(store, "utf8")).toBe(stored);
  expect((await stat(store)).ino).toBe(storeIdentity);
  expect(await readFile(configuration, "utf8")).toBe(configured);
  expect((await stat(configuration)).ino).toBe(configurationIdentity);
  expect((await request.get(developmentUrl)).status()).toBe(200);
});
