import { expect, test } from "@playwright/test";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { dashboardReleaseFixture } from "./support/dashboardReleaseFixture.ts";
import { processRunning } from "./support/processGroup.ts";
import { installFakeGh, fakeGhEnv } from "./support/fakeGh.ts";
import { startFakeGitHub } from "./support/fakeGitHub.ts";
import { ownAddress } from "./support/viteAddress.ts";

test("npm watcher reports no numeric release instead of serving development or a prerelease", async () => {
  const fixture = await dashboardReleaseFixture(true);
  let watcher: ReturnType<typeof dashboardCommand> | undefined;
  try {
    await fixture.publish("1.0.0-rc.1");
    watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
    );
    expect((await watcher.exited).code).toBe(1);
    expect(watcher.output()).toContain("Production dashboard could not run");
    expect(watcher.output()).toContain("No numeric release tags");
    expect(watcher.output()).not.toContain("at http://");
  } finally {
    await watcher?.stop();
    fixture.cleanup();
  }
});

test("npm watcher serves the pinned highest release beside hot-reloaded development, enforces local boundaries and owns shutdown", async ({
  browser,
  request,
}) => {
  test.setTimeout(240_000);
  const fixture = await dashboardReleaseFixture(true);
  const github = await startFakeGitHub();
  const gh = installFakeGh(fixture.root);
  const env = { ...fixture.env, ...fakeGhEnv(gh, github.url) };
  const banner = path.join(
    fixture.development,
    "dashboard/src/DashboardBanner.tsx",
  );
  let watcher: ReturnType<typeof dashboardCommand> | undefined;
  let development: ReturnType<typeof dashboardCommand> | undefined;
  const productionPage = await browser.newPage();
  const developmentPage = await browser.newPage();
  try {
    // Marker changes in real application source become tagged built JS and
    // development HMR; the fixture supplies no served pages or watcher outcomes.
    await writeFile(
      banner,
      (await readFile(banner, "utf8")).replace(
        "<SessionsButton />",
        '<p data-testid="release-source">PINNED SOURCE</p><SessionsButton />',
      ),
    );
    await fixture.publish("1.9.0", { marker: "OLDER RELEASE" });
    const pinned = await fixture.publish("1.10.0", {
      annotated: true,
      marker: "PINNED RELEASE",
    });
    await fixture.publish("2.0.0-rc.1", { marker: "IGNORED PRERELEASE" });
    await writeFile(
      banner,
      (await readFile(banner, "utf8")).replace(
        "PINNED SOURCE",
        "DEVELOPMENT SOURCE",
      ),
    );
    await fixture.commit("99.0.0", "DEVELOPMENT ONLY");
    await fixture.installDevelopment();
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
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toMatch(
        /Production dashboard v1\.10\.0 at http:\/\/127\.0\.0\.1:\d+ \(preview PID \d+\)/,
      );
    expect(watcher.output()).toContain(pinned);
    const previewPid = Number(/preview PID (\d+)/.exec(watcher.output())?.[1]);
    expect(processRunning(previewPid)).toBe(true);
    const productionUrl =
      /Production dashboard v1\.10\.0 at (http:\/\/127\.0\.0\.1:\d+)/.exec(
        watcher.output(),
      )?.[1];
    if (productionUrl === undefined) {
      throw new Error("Watcher did not report its production URL");
    }
    expect(productionUrl).not.toBe(developmentUrl);
    await productionPage.goto(productionUrl);
    await expect(productionPage).toHaveTitle("PINNED RELEASE");
    await expect(productionPage.getByTestId("release-source")).toHaveText(
      "PINNED SOURCE",
    );
    await developmentPage.goto(developmentUrl);
    await expect(developmentPage).toHaveTitle("DEVELOPMENT ONLY");
    await expect(developmentPage.getByTestId("release-source")).toHaveText(
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
    await expect(developmentPage.getByTestId("release-source")).toHaveText(
      "EDITED DEVELOPMENT SOURCE",
    );
    await expect(productionPage.getByTestId("release-source")).toHaveText(
      "PINNED SOURCE",
    );
    await expect(productionPage).toHaveTitle("PINNED RELEASE");
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
    await expect(fresh).toHaveTitle("PINNED RELEASE");
    await expect(fresh.getByTestId("release-source")).toHaveText(
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
    expect(
      await readdir(path.join(fixture.home, ".open-dough/dashboard/releases")),
    ).toEqual([]);
    // Stopping production leaves independently launched development usable.
    await expect(developmentPage.getByTestId("release-source")).toHaveText(
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
      expect(watcher.output()).not.toMatch(/Production dashboard v.* at http:/);
      expect(await (await request.get(productionUrl)).text()).toBe(
        "UNOWNED LISTENER",
      );
      expect(
        await readdir(
          path.join(fixture.home, ".open-dough/dashboard/releases"),
        ),
      ).toEqual([]);
    } finally {
      await new Promise<void>((resolve, reject) =>
        occupied.close((error) => {
          if (error) reject(error);
          else resolve();
        }),
      );
    }
  } finally {
    await productionPage.close();
    await developmentPage.close();
    await watcher?.stop();
    await development?.stop();
    await github.close();
    fixture.cleanup();
  }
});
