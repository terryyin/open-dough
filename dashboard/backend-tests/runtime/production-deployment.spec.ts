// Deploying a published main commit (../../server/productionDeployment.mjs):
// selecting and verifying it, staging and serving it pinned, and cancelling
// a commit while it installs.
import { expect, test } from "../../tests/support/pageTest.ts";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolvePublishedMain,
  stageDeployment,
  startDeploymentPreview,
  verifyPublishedCommit,
} from "../../server/productionDeployment.mjs";
import { publishedMainFixture } from "../../tests/support/publishedMainFixture.ts";
import { processRunning } from "../../tests/support/processGroup.ts";
import { deploymentCheckout } from "../../tests/support/productionWatcher.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import { expectSuppliedIcons } from "../../tests/support/brandIcons.ts";
import { expectOwnOriginReadsOnly } from "../../tests/support/localOriginReads.ts";
import { incidentEntries } from "../../tests/support/readDiagnostics.ts";

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
    await fixture.cleanup();
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
    await fixture.cleanup();
  }
});

test("deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries", async ({
  request,
  publishedApplicationSourceReady,
}) => {
  await Promise.resolve(publishedApplicationSourceReady);
  const fixture = await publishedMainFixture(true, "application");
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
    const nerdsPath = "dashboard/public/agent-avatars/odd-e-nerds";
    const cartoons = path.join(fixture.development, nerdsPath, "cartoon");
    await mkdir(cartoons, { recursive: true });
    const cartoon = await readFile(
      path.join(repoRoot, "dashboard/public/agent-avatars/atlas-1.webp"),
    );
    await writeFile(path.join(cartoons, "stanly.webp"), cartoon);
    await writeFile(path.join(cartoons, "notes.txt"), "LOCAL NOTES");
    await writeFile(
      path.join(fixture.development, nerdsPath, "stanly.jpg"),
      "PRIVATE RAW PHOTO",
    );
    expect(await fixture.git("ls-files", "--", nerdsPath)).toBe("");
    staged = await stageDeployment({
      developmentRoot: fixture.development,
      published,
      deploymentsRoot: fixture.deploymentsRoot,
      env: fixture.env,
    });
    expect(path.basename(staged.directory)).toEqual(deploymentCheckout(commit));
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
    const avatar = await request.get(
      `${preview.url}/agent-avatars/odd-e-nerds/cartoon/stanly.webp`,
    );
    expect(avatar.status()).toBe(200);
    expect(avatar.headers()["content-type"]).toContain("image/webp");
    expect(await avatar.body()).toEqual(cartoon);
    expect(
      await readdir(
        path.join(staged.directory, "dashboard/dist/agent-avatars/odd-e-nerds"),
      ),
    ).toEqual(["cartoon"]);
    expect(
      await readdir(
        path.join(
          staged.directory,
          "dashboard/dist/agent-avatars/odd-e-nerds/cartoon",
        ),
      ),
    ).toEqual(["stanly.webp"]);
    // The pinned checkout's build serves Open Dough's supplied icon exports.
    await expectSuppliedIcons(request, preview.url);
    await expectOwnOriginReadsOnly(request, preview.url);
    const pid = preview.pid;
    const url = preview.url;
    await preview.stop();
    expect(processRunning(pid)).toBe(false);
    await expect(request.get(url, { timeout: 2_000 })).rejects.toThrow();
    preview = undefined;
    // Stopped as a replacement stops it, the preview closed cleanly: its
    // incident record (../../server/incidentLifecycle.ts) has its start and
    // end. The fixture's root is its machine directory, holding its HOME.
    const recorded = incidentEntries(fixture.root)
      .map((entry) => entry.kind)
      .filter((kind) => kind.startsWith("process-"));
    expect(recorded).toEqual(["process-started", "process-ended"]);
  } finally {
    await preview?.stop();
    await staged?.remove();
    await fixture.cleanup();
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
    await fixture.cleanup();
  }
});
