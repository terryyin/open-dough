import { expect, test } from "@playwright/test";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolveDashboardRelease,
  stageDashboardRelease,
  startReleasePreview,
  verifyDashboardRelease,
} from "../server/productionReleaseRunner.mjs";
import { dashboardReleaseFixture } from "./support/dashboardReleaseFixture.ts";
import { processRunning } from "./support/processGroup.ts";

test("release runner selects the highest numeric tag and peeled annotated commit, ignoring prereleases and branch edits", async () => {
  const fixture = await dashboardReleaseFixture();
  try {
    await fixture.publish("1.9.0");
    const commit = await fixture.publish("1.10.0", { annotated: true });
    await fixture.publish("2.0.0-rc.1");
    await fixture.commit("99.0.0", "untagged development");
    expect(
      await resolveDashboardRelease(fixture.development, fixture.env),
    ).toEqual({
      origin: fixture.origin,
      tag: "v1.10.0",
      commit,
      version: "1.10.0",
    });
  } finally {
    fixture.cleanup();
  }
});

test("release runner refuses no numeric tag without a branch fallback", async () => {
  const fixture = await dashboardReleaseFixture();
  try {
    await fixture.publish("1.0.0-rc.1");
    await expect(
      resolveDashboardRelease(fixture.development, fixture.env),
    ).rejects.toThrow("No numeric release tags");
  } finally {
    fixture.cleanup();
  }
});

test("release runner verifies the exact resolved commit before running tagged code", async () => {
  const fixture = await dashboardReleaseFixture();
  try {
    await fixture.publish("1.0.0");
    const release = await resolveDashboardRelease(
      fixture.development,
      fixture.env,
    );
    await fixture.commit("1.0.0", "unpublished branch change");
    await expect(
      verifyDashboardRelease(fixture.development, release, fixture.env),
    ).rejects.toThrow("did not match resolved");
  } finally {
    fixture.cleanup();
  }
});

test("release runner refuses a highest tag with mismatching VERSION and removes the failed directory without falling back", async () => {
  const fixture = await dashboardReleaseFixture();
  try {
    await fixture.publish("1.0.0");
    await fixture.publish("2.0.0", { versionFile: "1.5.0" });
    const release = await resolveDashboardRelease(
      fixture.development,
      fixture.env,
    );
    await expect(
      stageDashboardRelease({
        developmentRoot: fixture.development,
        release,
        releasesRoot: fixture.releasesRoot,
        env: fixture.env,
      }),
    ).rejects.toThrow("Highest release v2.0.0 has VERSION 1.5.0");
    expect(await readdir(fixture.releasesRoot)).toEqual([]);
  } finally {
    fixture.cleanup();
  }
});

test("release runner installs, builds, and serves isolated pinned source with the real preview boundaries", async ({
  request,
}) => {
  test.setTimeout(240_000);
  const fixture = await dashboardReleaseFixture(true);
  let staged: Awaited<ReturnType<typeof stageDashboardRelease>> | undefined;
  let preview: Awaited<ReturnType<typeof startReleasePreview>> | undefined;
  try {
    const commit = await fixture.publish("1.0.0", {
      marker: "PINNED DASHBOARD RELEASE",
    });
    const release = await resolveDashboardRelease(
      fixture.development,
      fixture.env,
    );
    await fixture.commit("2.0.0", "DEVELOPMENT BRANCH ONLY");
    staged = await stageDashboardRelease({
      developmentRoot: fixture.development,
      release,
      releasesRoot: fixture.releasesRoot,
      env: fixture.env,
    });
    expect(staged.directory).toContain(`v1.0.0-${commit.slice(0, 12)}`);
    expect(path.relative(fixture.development, staged.directory)).toMatch(
      /^\.\./,
    );
    await verifyDashboardRelease(staged.directory, release, fixture.env);
    expect(
      await readFile(
        path.join(staged.directory, "dashboard/dist/index.html"),
        "utf8",
      ),
    ).toContain("PINNED DASHBOARD RELEASE");
    expect(
      await readFile(
        path.join(staged.directory, "dashboard/dist/index.html"),
        "utf8",
      ),
    ).not.toContain("DEVELOPMENT BRANCH ONLY");
    preview = await startReleasePreview({
      directory: staged.directory,
      port: 0,
      env: fixture.env,
    });
    expect(new URL(preview.url).hostname).toBe("127.0.0.1");
    const page = await request.get(preview.url);
    expect(page.status()).toBe(200);
    expect(await page.text()).toContain("PINNED DASHBOARD RELEASE");
    const boundary = `${preview.url}/__authenticated-read?source=unknown`;
    const sameOrigin = await request.get(boundary, {
      headers: { Origin: preview.url },
    });
    expect(sameOrigin.status()).toBe(404);
    expect(await sameOrigin.text()).toContain("Unknown catalog source");
    expect((await request.get(boundary)).status()).toBe(403);
    expect(
      (
        await request.get(boundary, {
          headers: { Origin: "https://example.invalid" },
        })
      ).status(),
    ).toBe(403);
    const pid = preview.pid;
    const url = preview.url;
    await preview.stop();
    expect(processRunning(pid)).toBe(false);
    await expect(request.get(url, { timeout: 2_000 })).rejects.toThrow();
    preview = undefined;
  } finally {
    await preview?.stop();
    await staged?.remove();
    fixture.cleanup();
  }
});

test("release runner cancellation ends an installing release's children and removes its incomplete directory", async () => {
  const fixture = await dashboardReleaseFixture();
  const cancellation = new AbortController();
  let staging: Promise<unknown> | undefined;
  try {
    const manifest = {
      name: "release-cancellation",
      version: "1.0.0",
      scripts: { prepare: "node hold.cjs" },
    };
    await writeFile(
      path.join(fixture.development, "package.json"),
      JSON.stringify(manifest),
    );
    await writeFile(
      path.join(fixture.development, "package-lock.json"),
      JSON.stringify({
        name: manifest.name,
        version: manifest.version,
        lockfileVersion: 3,
        packages: { "": manifest },
      }),
    );
    await writeFile(
      path.join(fixture.development, "hold.cjs"),
      'require("node:fs").writeFileSync(require("node:path").join(process.env.HOME, "install.pid"), String(process.pid)); setInterval(() => {}, 1000);',
    );
    await fixture.publish("1.0.0");
    const release = await resolveDashboardRelease(
      fixture.development,
      fixture.env,
    );
    staging = stageDashboardRelease({
      developmentRoot: fixture.development,
      release,
      releasesRoot: fixture.releasesRoot,
      env: fixture.env,
      signal: cancellation.signal,
    });
    // Keep rejection observed even if the polling assertion fails first.
    void staging.catch(() => undefined);
    const pidFile = path.join(fixture.home, "install.pid");
    await expect
      .poll(async () =>
        readFile(pidFile, "utf8")
          .then(Number)
          .catch(() => undefined),
      )
      .toBeGreaterThan(0);
    const pid = Number(await readFile(pidFile, "utf8"));
    cancellation.abort();
    await expect(staging).rejects.toThrow();
    await expect.poll(() => processRunning(pid)).toBe(false);
    expect(await readdir(fixture.releasesRoot)).toEqual([]);
  } finally {
    cancellation.abort();
    await staging?.catch(() => undefined);
    fixture.cleanup();
  }
});
