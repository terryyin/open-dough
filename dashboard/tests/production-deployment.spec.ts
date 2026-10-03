import { expect, test } from "@playwright/test";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolvePublishedMain,
  stageDeployment,
  startDeploymentPreview,
  verifyPublishedCommit,
} from "../server/productionDeployment.mjs";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { processRunning } from "./support/processGroup.ts";

test("deployment selects origin main's commit, never local commits or edits", async () => {
  const fixture = await publishedMainFixture();
  try {
    await expect(
      resolvePublishedMain(fixture.development, fixture.env),
    ).rejects.toThrow(`Origin ${fixture.origin} has no published main branch.`);
    const published = await fixture.publish(
      { "fixture-marker": "PUBLISHED" },
      "Published",
    );
    await fixture.commit({ "fixture-marker": "LOCAL ONLY" }, "Local only");
    await writeFile(
      path.join(fixture.development, "fixture-marker"),
      "UNCOMMITTED",
    );
    expect(
      await resolvePublishedMain(fixture.development, fixture.env),
    ).toEqual({ origin: fixture.origin, commit: published });
  } finally {
    fixture.cleanup();
  }
});

test("deployment verifies the exact selected commit before running its code", async () => {
  const fixture = await publishedMainFixture();
  try {
    await fixture.publish({ "fixture-marker": "A" }, "A");
    const published = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    await fixture.publish({ "fixture-marker": "B" }, "B");
    await expect(
      verifyPublishedCommit(fixture.development, published, fixture.env),
    ).rejects.toThrow(`did not match selected main commit ${published.commit}`);
  } finally {
    fixture.cleanup();
  }
});

test("deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries", async ({
  request,
}) => {
  test.setTimeout(240_000);
  const fixture = await publishedMainFixture(true);
  let staged: Awaited<ReturnType<typeof stageDeployment>> | undefined;
  let preview: Awaited<ReturnType<typeof startDeploymentPreview>> | undefined;
  try {
    const commit = await fixture.publish(
      fixture.markerChanges("PINNED DASHBOARD COMMIT"),
      "Pinned",
    );
    const published = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    // Main advances after selection; staging still builds the selected commit.
    await fixture.publish(fixture.markerChanges("LATER MAIN"), "Later main");
    staged = await stageDeployment({
      developmentRoot: fixture.development,
      published,
      deploymentsRoot: fixture.deploymentsRoot,
      env: fixture.env,
    });
    expect(path.basename(staged.directory)).toMatch(
      new RegExp(`^${commit.slice(0, 12)}-`),
    );
    expect(path.relative(fixture.development, staged.directory)).toMatch(
      /^\.\./,
    );
    await verifyPublishedCommit(staged.directory, published, fixture.env);
    expect(
      await readFile(
        path.join(staged.directory, "dashboard/dist/index.html"),
        "utf8",
      ),
    ).toContain("PINNED DASHBOARD COMMIT");
    expect(
      await readFile(
        path.join(staged.directory, "dashboard/dist/index.html"),
        "utf8",
      ),
    ).not.toContain("LATER MAIN");
    preview = await startDeploymentPreview({
      directory: staged.directory,
      port: 0,
      env: fixture.env,
    });
    expect(new URL(preview.url).hostname).toBe("127.0.0.1");
    const page = await request.get(preview.url);
    expect(page.status()).toBe(200);
    expect(await page.text()).toContain("PINNED DASHBOARD COMMIT");
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

test("deployment cancellation ends an installing commit's children and removes its incomplete directory", async () => {
  const fixture = await publishedMainFixture();
  const cancellation = new AbortController();
  let staging: Promise<unknown> | undefined;
  try {
    const manifest = {
      name: "deployment-cancellation",
      version: "1.0.0",
      scripts: { prepare: "node hold.cjs" },
    };
    await fixture.publish(
      {
        "package.json": JSON.stringify(manifest),
        "package-lock.json": JSON.stringify({
          name: manifest.name,
          version: manifest.version,
          lockfileVersion: 3,
          packages: { "": manifest },
        }),
        "hold.cjs":
          'require("node:fs").writeFileSync(require("node:path").join(process.env.HOME, "install.pid"), String(process.pid)); setInterval(() => {}, 1000);',
      },
      "Holding install",
    );
    const published = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    staging = stageDeployment({
      developmentRoot: fixture.development,
      published,
      deploymentsRoot: fixture.deploymentsRoot,
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
    expect(await readdir(fixture.deploymentsRoot)).toEqual([]);
  } finally {
    cancellation.abort();
    await staging?.catch(() => undefined);
    fixture.cleanup();
  }
});
