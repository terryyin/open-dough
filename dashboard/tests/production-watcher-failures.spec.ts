// Tagged lifecycle fault gates leave real npm/Vite build and serving intact.
import { expect, test } from "@playwright/test";
import { readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { dashboardCommand } from "./support/dashboardCommand.ts";
import { dashboardReleaseFixture } from "./support/dashboardReleaseFixture.ts";
import { processRunning } from "./support/processGroup.ts";

test("failed builds and real preview activation restore working production, retry immutable tags, survive origin failure and stop checks", async ({
  browser,
  request,
}) => {
  test.setTimeout(360_000);
  const fixture = await dashboardReleaseFixture(true);
  const releases = path.join(fixture.home, ".open-dough/dashboard/releases");
  let watcher: ReturnType<typeof dashboardCommand> | undefined;
  const page = await browser.newPage();
  try {
    await fixture.publish("1.0.0", { marker: "WORKING A" });
    watcher = dashboardCommand(
      fixture.development,
      fixture.env,
      "watch:dashboard",
      ["--port", "0", "--check-interval", "500"],
    );
    async function activation(version: string, restored = false) {
      const expression = new RegExp(
        `${restored ? "Restored production" : "Production"} dashboard v${version.replaceAll(".", "\\.")} at (http://127\\.0\\.0\\.1:\\d+) \\(preview PID (\\d+)\\)`,
      );
      await expect
        .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
        .toMatch(expression);
      const match = expression.exec(watcher?.output() ?? "");
      if (!match?.[1] || !match[2])
        throw new Error("Missing preview address/PID");
      return { url: match[1], pid: Number(match[2]) };
    }
    const a = await activation("1.0.0");
    await page.goto(a.url);
    await expect(page).toHaveTitle("WORKING A");

    // The tag gates its own build/start on a machine-local transient cause.
    // Clearing it never changes source, tag or commit and runs the real scripts.
    const packagePath = path.join(fixture.development, "package.json");
    const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as {
      scripts: Record<string, string>;
    };
    const releaseFault = `
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
const phase = process.argv[2];
if (existsSync(path.join(homedir(), "fault-" + phase))) {
  console.error("TRANSIENT " + phase + " FAILURE");
  process.exit(42);
}
`;
    for (const phase of ["build", "preview"]) {
      const script = `${phase}:dashboard`;
      packageJson.scripts[script] =
        `node release-fault.mjs ${phase} && ${packageJson.scripts[script]}`;
    }
    const buildFault = path.join(fixture.home, "fault-build");
    await writeFile(buildFault, "transient build cause");
    const bSha = await fixture.publish("1.1.0", {
      marker: "WORKING B",
      changes: {
        "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
        "release-fault.mjs": releaseFault,
      },
    });
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 180_000 })
      .toContain("TRANSIENT build FAILURE");
    expect(watcher.output()).toContain(
      "Production release check failed for v1.1.0",
    );
    expect(watcher.output()).toContain(`Keeping v1.0.0 at ${a.url}`);
    expect(processRunning(a.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("WORKING A");
    await rm(buildFault);
    const b = await activation("1.1.0");
    expect(b.url).toBe(a.url);
    expect(
      watcher
        .output()
        .match(
          new RegExp(
            `Preparing production dashboard v1\\.1\\.0 \\(${bSha}\\)`,
            "g",
          ),
        )?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);
    await expect.poll(() => processRunning(a.pid)).toBe(false);
    await page.reload();
    await expect(page).toHaveTitle("WORKING B");

    const startFault = path.join(fixture.home, "fault-preview");
    // B's gate also reads HOME; make the start cause apply to C only.
    const cFault = `${startFault}-c`;
    await writeFile(cFault, "transient candidate start cause");
    const cSha = await fixture.publish("1.2.0", {
      marker: "WORKING C",
      changes: {
        "release-fault.mjs": releaseFault.replace(
          'existsSync(path.join(homedir(), "fault-" + phase))',
          'existsSync(path.join(homedir(), "fault-" + phase + "-c"))',
        ),
      },
    });
    const restored = await activation("1.1.0", true);
    expect(restored.url).toBe(a.url);
    expect(restored.pid).not.toBe(b.pid);
    await expect.poll(() => processRunning(b.pid)).toBe(false);
    expect(processRunning(restored.pid)).toBe(true);
    await expect
      .poll(() => watcher?.output() ?? "")
      .toContain("Production release check failed for v1.2.0");
    expect(watcher.output()).toContain("TRANSIENT preview FAILURE");
    expect(watcher.output()).toContain(`Keeping v1.1.0 at ${a.url}`);
    expect(watcher.output()).not.toContain(
      `Production dashboard v1.2.0 at ${a.url}`,
    );
    await page.reload();
    await expect(page).toHaveTitle("WORKING B");
    await rm(cFault);
    const c = await activation("1.2.0");
    expect(c.url).toBe(a.url);
    expect(
      watcher
        .output()
        .match(
          new RegExp(
            `Preparing production dashboard v1\\.2\\.0 \\(${cSha}\\)`,
            "g",
          ),
        )?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);
    await expect.poll(() => processRunning(restored.pid)).toBe(false);
    await page.reload();
    await expect(page).toHaveTitle("WORKING C");

    await rename(fixture.origin, `${fixture.origin}.unavailable`);
    await expect
      .poll(() => watcher?.output() ?? "", { timeout: 60_000 })
      .toContain("Failed to fetch tags from");
    expect(processRunning(c.pid)).toBe(true);
    await page.reload();
    await expect(page).toHaveTitle("WORKING C");
    expect(watcher.output()).toContain(`Keeping v1.2.0 at ${a.url}`);
    await rename(`${fixture.origin}.unavailable`, fixture.origin);
    const checks =
      watcher.output().match(/Checked production release:/g)?.length ?? 0;
    await expect
      .poll(
        () =>
          watcher?.output().match(/Checked production release:/g)?.length ?? 0,
      )
      .toBeGreaterThan(checks);
    if (watcher.child.pid === undefined) throw new Error("Missing watcher PID");
    process.kill(-watcher.child.pid, "SIGHUP");
    expect(await watcher.exited).toMatchObject({
      code: null,
      signal: "SIGHUP",
    });
    await watcher.stop();
    const endedOutput = watcher.output();
    await new Promise((resolve) => setTimeout(resolve, 1_100));
    expect(watcher.output()).toBe(endedOutput);
    expect(processRunning(c.pid)).toBe(false);
    await expect(request.get(a.url, { timeout: 2_000 })).rejects.toThrow();
    expect(await readdir(releases)).toEqual([]);
    watcher = undefined;
  } finally {
    await page.close();
    await watcher?.stop();
    fixture.cleanup();
  }
});
