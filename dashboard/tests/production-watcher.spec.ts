import { expect, test } from "./support/pageTest.ts";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { configureDevelopmentProjects } from "./support/projectConfiguration.ts";
import { processRunning } from "./support/processGroup.ts";
import { installFakeGh, fakeGhEnv } from "./support/fakeGh.ts";
import { startFakeGitHub } from "./support/fakeGitHub.ts";
import { ownAddress } from "./support/viteAddress.ts";
import {
  productionActivation,
  productionDeployments,
  type ProductionWatcher,
} from "./support/productionWatcher.ts";

test("npm watcher serves published main beside hot-reloaded uncommitted development, enforces local boundaries, owns shutdown and restarts at current main", async ({
  browser,
  request,
}) => {
  test.setTimeout(360_000);
  const fixture = await publishedMainFixture(true);
  const github = await startFakeGitHub();
  const gh = installFakeGh(fixture.root);
  const env = { ...fixture.env, ...fakeGhEnv(gh, github.url) };
  const bannerPath = "dashboard/src/DashboardBanner.tsx";
  const banner = path.join(fixture.development, bannerPath);
  const deployments = productionDeployments(fixture.home);
  let watcher: ProductionWatcher | undefined;
  let development: ReturnType<typeof dashboardCommand> | undefined;
  const productionPage = await browser.newPage();
  const developmentPage = await browser.newPage();
  try {
    // Marker changes in real application source become main's built JS and
    // development HMR; the fixture supplies no served pages or watcher outcomes.
    const pinnedBanner = (await readFile(banner, "utf8")).replace(
      "<SessionsButton />",
      '<p data-testid="production-source">PINNED SOURCE</p><SessionsButton />',
    );
    const pinned = await fixture.publish(
      { ...fixture.markerChanges("PINNED MAIN"), [bannerPath]: pinnedBanner },
      "Pinned main",
    );
    // Development differs only through uncommitted local edits.
    const index = path.join(fixture.development, "dashboard/index.html");
    await writeFile(
      index,
      (await readFile(index, "utf8")).replace(
        /<title>.*?<\/title>/,
        "<title>DEVELOPMENT ONLY</title>",
      ),
    );
    await writeFile(
      banner,
      pinnedBanner.replace("PINNED SOURCE", "DEVELOPMENT SOURCE"),
    );
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
    ]);
    const { url: productionUrl, pid: previewPid } = await productionActivation(
      watcher,
      pinned,
    );
    expect(watcher.output()).toContain(
      `Preparing production dashboard ${pinned}.`,
    );
    expect(processRunning(previewPid)).toBe(true);
    expect(productionUrl).not.toBe(developmentUrl);
    await productionPage.goto(productionUrl);
    await expect(productionPage).toHaveTitle("PINNED MAIN");
    await expect(productionPage.getByTestId("production-source")).toHaveText(
      "PINNED SOURCE",
    );
    await developmentPage.goto(developmentUrl);
    await expect(developmentPage).toHaveTitle("DEVELOPMENT ONLY");
    await expect(developmentPage.getByTestId("production-source")).toHaveText(
      "DEVELOPMENT SOURCE",
    );
    let productionNavigations = 0;
    productionPage.on("framenavigated", (frame) => {
      if (frame === productionPage.mainFrame()) productionNavigations++;
    });
    await productionPage.evaluate(() => {
      document.documentElement.dataset["openWatcherPage"] = "retained";
    });
    await writeFile(
      banner,
      (await readFile(banner, "utf8")).replace(
        "DEVELOPMENT SOURCE",
        "EDITED DEVELOPMENT SOURCE",
      ),
    );
    await expect(developmentPage.getByTestId("production-source")).toHaveText(
      "EDITED DEVELOPMENT SOURCE",
    );
    await expect(productionPage.getByTestId("production-source")).toHaveText(
      "PINNED SOURCE",
    );
    await expect(productionPage).toHaveTitle("PINNED MAIN");
    expect(productionNavigations).toBe(0);
    expect(
      await productionPage.evaluate(
        () => document.documentElement.dataset["openWatcherPage"],
      ),
    ).toBe("retained");
    expect(processRunning(previewPid)).toBe(true);
    expect(watcher.output().match(/preview PID \d+/g)).toEqual([
      `preview PID ${previewPid}`,
    ]);
    const fresh = await browser.newPage();
    await fresh.goto(productionUrl);
    await expect(fresh).toHaveTitle("PINNED MAIN");
    await expect(fresh.getByTestId("production-source")).toHaveText(
      "PINNED SOURCE",
    );
    await fresh.close();
    const readUrl = `${productionUrl}/__authenticated-read?source=unknown`;
    expect((await request.get(readUrl)).status()).toBe(403);
    expect(
      (
        await request.get(readUrl, {
          headers: { Origin: "https://example.invalid" },
        })
      ).status(),
    ).toBe(403);
    const sameOrigin = await request.get(readUrl, {
      headers: { Origin: productionUrl },
    });
    expect(sameOrigin.status()).toBe(404);
    expect(await sameOrigin.text()).toContain("Unknown catalog source");
    expect(
      (
        await request.post(`${productionUrl}/__agent-launch/accept`, {
          data: {},
          headers: { Origin: "https://example.invalid" },
        })
      ).status(),
    ).toBe(403);
    await watcher.stop();
    watcher = undefined;
    await expect.poll(() => processRunning(previewPid)).toBe(false);
    await expect(
      request.get(productionUrl, { timeout: 2_000 }),
    ).rejects.toThrow();
    expect(await readdir(deployments)).toEqual([]);
    // SIGTERM (stop) ends production; independently launched development stays usable.
    await expect(developmentPage.getByTestId("production-source")).toHaveText(
      "EDITED DEVELOPMENT SOURCE",
    );
    expect((await request.get(developmentUrl)).status()).toBe(200);

    // An occupied intended production URL must fail, never move to another port.
    const occupied = createServer((req, res) => {
      req.resume();
      res.end("UNOWNED LISTENER");
    });
    const productionPort = new URL(productionUrl).port;
    await new Promise<void>((resolve) =>
      occupied.listen(Number(productionPort), "127.0.0.1", resolve),
    );
    try {
      watcher = dashboardCommand(fixture.development, env, "watch:dashboard", [
        "--port",
        productionPort,
      ]);
      expect((await watcher.exited).code).toBe(1);
      expect(watcher.output()).toContain(
        `Port ${productionPort} is already in use`,
      );
      expect(watcher.output()).not.toMatch(/Production dashboard \w+ at http:/);
      expect(await (await request.get(productionUrl)).text()).toBe(
        "UNOWNED LISTENER",
      );
      expect(await readdir(deployments)).toEqual([]);
    } finally {
      await new Promise<void>((resolve, reject) =>
        occupied.close((error) => {
          if (error) reject(error);
          else resolve();
        }),
      );
    }

    // A restart establishes current main as the new baseline, even when its
    // latest commit edits only documentation; SIGINT ends that watcher.
    const current = await fixture.publish(
      { "docs/production-restart-note.md": "# Restart note\n" },
      "Document restart",
    );
    watcher = dashboardCommand(fixture.development, env, "watch:dashboard", [
      "--port",
      "0",
    ]);
    const restarted = await productionActivation(watcher, current);
    expect(watcher.output()).toContain(
      `Preparing production dashboard ${current}.`,
    );
    expect(watcher.output()).not.toContain(pinned);
    expect(await readdir(deployments)).toEqual([
      expect.stringMatching(new RegExp(`^${current.slice(0, 12)}-`)),
    ]);
    await productionPage.goto(restarted.url);
    await expect(productionPage).toHaveTitle("PINNED MAIN");
    await expect(productionPage.getByTestId("production-source")).toHaveText(
      "PINNED SOURCE",
    );
    if (watcher.child.pid === undefined) throw new Error("Missing watcher PID");
    process.kill(-watcher.child.pid, "SIGINT");
    await watcher.exited;
    await watcher.stop();
    expect(watcher.output()).not.toContain("could not run");
    expect(processRunning(restarted.pid)).toBe(false);
    await expect(
      request.get(restarted.url, { timeout: 2_000 }),
    ).rejects.toThrow();
    expect(await readdir(deployments)).toEqual([]);
    watcher = undefined;
  } finally {
    await productionPage.close();
    await developmentPage.close();
    await watcher?.stop();
    await development?.stop();
    await github.close();
    fixture.cleanup();
  }
});
