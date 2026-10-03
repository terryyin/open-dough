// Real npm watcher release replacement, with shared machine evidence and
// external gh/Claude answers supplied only by disposable origin/host fixtures.
import { expect, test } from "@playwright/test";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { dashboardReleaseFixture } from "./support/dashboardReleaseFixture.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";
import { processRunning } from "./support/processGroup.ts";
import { installFakeGh, fakeGhEnv } from "./support/fakeGh.ts";
import { installFakeClaude } from "./support/fakeClaude.ts";
import { publishes, startFakeGitHub } from "./support/fakeGitHub.ts";
import { ownAddress } from "./support/viteAddress.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/agentLaunch.ts";

test("npm watcher replaces a newer numeric release at the same URL, keeps shared records and tagged boundaries, and ignores other publications", async ({
  browser,
  request,
}) => {
  test.setTimeout(300_000);
  const fixture = await dashboardReleaseFixture(true);
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
  let watcher: ReturnType<typeof dashboardCommand> | undefined;
  let development: ReturnType<typeof dashboardCommand> | undefined;
  const page = await browser.newPage();
  try {
    await fixture.publish("1.10.0", { marker: "RELEASE A" });
    await fixture.installDevelopment();
    configureDevelopmentProjects(fixture.home);
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
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toMatch(/Production dashboard v1\.10\.0 at http:/);
    const startup =
      /Production dashboard v1\.10\.0 at (http:\/\/127\.0\.0\.1:\d+) \(preview PID (\d+)\)/.exec(
        watcher.output(),
      );
    if (!startup?.[1] || !startup[2])
      throw new Error("Missing initial production address/PID");
    const productionUrl = startup[1];
    const oldPid = Number(startup[2]);
    await page.goto(productionUrl);
    await expect(page).toHaveTitle("RELEASE A");

    // Supply an existing durable record after startup. Real server reads must
    // discover the same HOME file; the fixture does not answer record HTTP.
    const record: LaunchRecord = {
      request: launchRequest as LaunchRecord["request"],
      session: {
        host: "claude",
        sessionId: "shared-before-switch",
        shortId: "shared",
        name: "Shared launch",
      },
      launchedAt: new Date().toISOString(),
    };
    const store = path.join(
      fixture.home,
      ".open-dough/dashboard/agent-launches.json",
    );
    await mkdir(path.dirname(store), { recursive: true });
    const stored = JSON.stringify({ "open-dough": [record] });
    await writeFile(store, stored);
    async function expectSharedRecord(url: string) {
      const response = await request.get(`${url}/__agent-launch`, {
        headers: { Origin: url },
      });
      expect(response.status()).toBe(200);
      const answer = (await response.json()) as { records: unknown[] };
      expect(answer.records).toEqual([expect.objectContaining(record)]);
    }
    await expectSharedRecord(developmentUrl);
    await expectSharedRecord(productionUrl);

    // All three publications are visible to a subsequent real origin check.
    await fixture.publish("1.9.9", { marker: "LOWER RELEASE" });
    await fixture.publish("2.0.0-rc.1", { marker: "PRERELEASE" });
    await fixture.commit(
      fixture.releaseChanges("99.0.0", "BRANCH ONLY"),
      "BRANCH ONLY",
    );
    await fixture.push();
    const checksBefore =
      watcher.output().match(/Checked production release:/g)?.length ?? 0;
    await expect
      .poll(
        () =>
          watcher?.output().match(/Checked production release:/g)?.length ?? 0,
      )
      .toBeGreaterThan(checksBefore + 1);
    await page.reload();
    await expect(page).toHaveTitle("RELEASE A");
    expect(processRunning(oldPid)).toBe(true);
    expect(watcher.output().match(/preview PID \d+/g)).toEqual([
      `preview PID ${oldPid}`,
    ]);
    expect(
      watcher.output().match(/Preparing production dashboard/g),
    ).toHaveLength(1);

    const replacement = await fixture.publish("1.11.0", {
      annotated: true,
      marker: "RELEASE B",
    });
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toMatch(/Production dashboard v1\.11\.0 at http:/);
    expect(watcher.output()).toContain(
      `Preparing production dashboard v1.11.0 (${replacement}).`,
    );
    const switched =
      /Production dashboard v1\.11\.0 at (http:\/\/127\.0\.0\.1:\d+) \(preview PID (\d+)\)/.exec(
        watcher.output(),
      );
    expect(switched?.[1]).toBe(productionUrl);
    const newPid = Number(switched?.[2]);
    expect(newPid).not.toBe(oldPid);
    await expect.poll(() => processRunning(oldPid)).toBe(false);
    expect(processRunning(newPid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("RELEASE B");
    await expectSharedRecord(productionUrl);
    await expectSharedRecord(developmentUrl);
    expect(await readFile(store, "utf8")).toBe(stored);

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
      "repos/terryyin/open-dough/commits/main",
      "--jq",
      ".sha",
    ]);
    expect(
      github.calls
        .slice(callsBefore)
        .some(
          (call) =>
            call.request.kind === "content" &&
            call.request.revision === revision &&
            call.request.path === ".planning/PRODUCT-BACKLOG.md",
        ),
    ).toBe(true);
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

    const checksAfterSwitch =
      watcher.output().match(/Checked production release:/g)?.length ?? 0;
    await expect
      .poll(
        () =>
          watcher?.output().match(/Checked production release:/g)?.length ?? 0,
      )
      .toBeGreaterThan(checksAfterSwitch);
    expect(watcher.output().match(/preview PID \d+/g)).toHaveLength(2);
    expect(
      await readdir(path.join(fixture.home, ".open-dough/dashboard/releases")),
    ).toEqual([expect.stringContaining(`v1.11.0-${replacement.slice(0, 12)}`)]);
    await watcher.stop();
    watcher = undefined;
    await expect.poll(() => processRunning(newPid)).toBe(false);
    await expect(
      request.get(productionUrl, { timeout: 2_000 }),
    ).rejects.toThrow();
    expect(
      await readdir(path.join(fixture.home, ".open-dough/dashboard/releases")),
    ).toEqual([]);
    expect(await readFile(store, "utf8")).toBe(stored);
    expect((await request.get(developmentUrl)).status()).toBe(200);
  } finally {
    await page.close();
    await watcher?.stop();
    await development?.stop();
    await github.close();
    fixture.cleanup();
  }
});
