// Real npm watcher main-commit replacement, with shared machine evidence and
// external gh/Claude answers supplied only by disposable origin/host fixtures.
import { expect, test } from "./support/pageTest.ts";
import { readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";
import { processRunning } from "./support/processGroup.ts";
import { installFakeGh, fakeGhEnv } from "./support/fakeGh.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { publishes, startFakeGitHub } from "./support/fakeGitHub.ts";
import { ownAddress } from "./support/viteAddress.ts";
import {
  checkedAfterActivation,
  outputCount,
  productionActivation,
  productionDeployments,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";
import {
  buildGateChanges,
  builtCommitPrefixes,
  holdBuildPath,
  recordedBuilds,
} from "./support/productionBuildGate.ts";
import {
  expectSharedLaunchRecord,
  writeSharedLaunchRecord,
} from "./support/sharedLaunchRecord.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import { productionSeedProjects } from "../server/projectConfigurationSeed.ts";

test("npm watcher replaces production with each newly published main commit at the same URL, pins the building commit, keeps unchanged main running, and preserves shared records and configuration", async ({
  browser,
  request,
}) => {
  test.setTimeout(360_000);
  const fixture = await publishedMainFixture(true);
  const github = await startFakeGitHub();
  const gh = installFakeGh(fixture.root);
  const ghEnv = fakeGhEnv(gh, github.url);
  const claude = installFakeClaude(
    fixture.root,
    { binDir: gh.binDir, path: ghEnv["PATH"] ?? "" },
    { machine: fixture.root, projectFolders: ["open-dough"] },
  );
  const env = { ...fixture.env, ...ghEnv, ...claude.env };
  const revision = "a5".repeat(20);
  const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
  github.serve("terryyin/open-dough", publishes({ revision, backlog }));
  const deployments = productionDeployments(fixture.home);
  const builds = () => recordedBuilds(fixture.home);
  const count = (expression: RegExp) => outputCount(watcher, expression);
  const activation = (commit: string) => productionActivation(watcher, commit);
  const checkoutOf = (commit: string) =>
    expect.stringMatching(new RegExp(`^${commit.slice(0, 12)}-`));
  let watcher: ProductionWatcher | undefined;
  let development: ReturnType<typeof dashboardCommand> | undefined;
  const page = await browser.newPage();
  try {
    const a = await fixture.publish(
      {
        ...fixture.markerChanges("MAIN A"),
        ...(await buildGateChanges(fixture.development)),
      },
      "Main A",
    );
    await fixture.installDevelopment();
    configureDevelopmentProjects(fixture.home);
    // Production's physical project configuration, with distinctive bytes.
    const configuration = path.join(
      fixture.home,
      ".open-dough/dashboard/projects-production.json",
    );
    const configured = `${JSON.stringify(productionSeedProjects, null, 4)}\n`;
    await writeFile(configuration, configured);
    const configurationIdentity = (await stat(configuration)).ino;
    development = dashboardCommand(fixture.development, env, "dev:dashboard", [
      "--port",
      "0",
    ]);
    const developmentUrl = await ownAddress(
      development.child,
      development.output,
      20_000,
    );
    watcher = dashboardCommand(fixture.development, env, "watch:dashboard", [
      "--port",
      "0",
      "--check-interval",
      "500",
    ]);
    const startup = await activation(a);
    const productionUrl = startup.url;
    await page.goto(productionUrl);
    await expect(page).toHaveTitle("MAIN A");
    expect(await builds()).toEqual([
      {
        pid: expect.any(Number),
        checkout: checkoutOf(a),
      },
    ]);

    // Supply an existing durable record after startup. Real server reads must
    // discover the same HOME file; the fixture does not answer record HTTP.
    const { record, store, stored } = await writeSharedLaunchRecord(
      fixture.home,
    );
    const expectSharedRecord = (url: string) =>
      expectSharedLaunchRecord(request, url, record);
    await expectSharedRecord(developmentUrl);
    await expectSharedRecord(productionUrl);
    const storeIdentity = (await stat(store)).ino;

    // Repeated checks of unchanged main keep the same process and build.
    const checksBefore = count(/Checked published main: /g);
    await expect
      .poll(() => count(new RegExp(`Checked published main: ${a}\\.`, "g")))
      .toBeGreaterThan(checksBefore + 2);
    expect(processRunning(startup.pid)).toBe(true);
    expect(watcher.output().match(/preview PID \d+/g)).toEqual([
      `preview PID ${startup.pid}`,
    ]);
    expect(count(/Preparing production dashboard/g)).toBe(1);
    expect(await builds()).toHaveLength(1);

    // B is selected and held in its real build while C reaches main. B is
    // served exactly; a later check then selects C.
    await writeFile(holdBuildPath(fixture.home, 2), "");
    await writeFile(holdBuildPath(fixture.home, 3), "");
    const b = await fixture.publish(fixture.markerChanges("MAIN B"), "Main B");
    await expect
      .poll(async () => (await builds()).length, { timeout: 180_000 })
      .toBe(2);
    expect((await builds())[1]?.checkout).toEqual(checkoutOf(b));
    const c = await fixture.publish(fixture.markerChanges("MAIN C"), "Main C");
    await rm(holdBuildPath(fixture.home, 2));
    const switched = await activation(b);
    expect(switched.url).toBe(productionUrl);
    expect(switched.pid).not.toBe(startup.pid);
    expect(watcher.output()).toContain(`Preparing production dashboard ${b}.`);
    await expect.poll(() => processRunning(startup.pid)).toBe(false);
    await page.reload();
    await expect(page).toHaveTitle("MAIN B");
    await expectSharedRecord(productionUrl);
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 60_000 })
      .toContain(`Preparing production dashboard ${c}.`);
    expect(watcher.output()).not.toMatch(
      new RegExp(`Production dashboard ${c} at`),
    );
    await page.reload();
    await expect(page).toHaveTitle("MAIN B");
    await rm(holdBuildPath(fixture.home, 3));
    const latest = await activation(c);
    expect(latest.url).toBe(productionUrl);
    await expect.poll(() => processRunning(switched.pid)).toBe(false);
    expect(processRunning(latest.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("MAIN C");
    // C's own page has read the backlog at the revision main names.
    await expect(
      page.getByRole("region", { name: "Published Git state" }),
    ).toContainText(revision);
    expect(await builtCommitPrefixes(fixture.home)).toEqual(
      [a, b, c].map((commit) => commit.slice(0, 12)),
    );
    await expectSharedRecord(productionUrl);
    await expectSharedRecord(developmentUrl);
    expect(await readFile(store, "utf8")).toBe(stored);
    expect(await readFile(configuration, "utf8")).toBe(configured);

    const callsBefore = github.calls.length;
    const read = await request.get(
      `${productionUrl}/__authenticated-read?source=open-dough`,
      {
        headers: { Origin: productionUrl },
      },
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
      `${productionUrl}/__agent-launch/accept`,
      {
        headers: { Origin: productionUrl },
        data: { ...launchRequest, source: "not-a-real-project" },
      },
    );
    expect(refused.status()).toBe(404);
    expect(await refused.json()).toHaveProperty("error");
    expect(claude.controls.claudeLaunchCalls()).toHaveLength(launchesBefore);

    // Superseded checkouts are retired after C serves, not before.
    await checkedAfterActivation(watcher, c);
    expect(await readdir(deployments)).toEqual([checkoutOf(c)]);

    // SIGTERM while D is in its real build ends that build, the served C
    // preview and every deployment checkout.
    await writeFile(holdBuildPath(fixture.home, 4), "");
    await fixture.publish(fixture.markerChanges("MAIN D"), "Main D");
    await expect
      .poll(async () => (await builds()).length, { timeout: 180_000 })
      .toBe(4);
    const heldBuild = (await builds())[3]?.pid;
    expect(processRunning(heldBuild)).toBe(true);
    await watcher.stop();
    expect(watcher.output()).not.toContain("could not run");
    watcher = undefined;
    await expect.poll(() => processRunning(heldBuild)).toBe(false);
    await expect.poll(() => processRunning(latest.pid)).toBe(false);
    await expect(
      request.get(productionUrl, { timeout: 2_000 }),
    ).rejects.toThrow();
    expect(await readdir(deployments)).toEqual([]);
    expect(await readFile(store, "utf8")).toBe(stored);
    expect((await stat(store)).ino).toBe(storeIdentity);
    expect(await readFile(configuration, "utf8")).toBe(configured);
    expect((await stat(configuration)).ino).toBe(configurationIdentity);
    expect((await request.get(developmentUrl)).status()).toBe(200);
  } finally {
    await page.close();
    await watcher?.stop();
    await development?.stop();
    await github.close();
    fixture.cleanup();
  }
});
