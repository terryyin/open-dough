// Deploying a published main commit (../../server/productionDeployment.mjs):
// selecting and verifying it, staging and serving it pinned, and cancelling
// a commit while it installs.
import { expect, test } from "vitest";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolvePublishedMain,
  stageDeployment,
  startDeploymentPreview,
  verifyPublishedCommit,
} from "../../server/productionDeployment.mjs";
import { publishedMainFixture } from "../../test-support/support/publishedMainFixture.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import { stagePinnedDeployment } from "../../test-support/support/pinnedDeployment.ts";
import { incidentEntries } from "../../test-support/support/readDiagnostics.ts";
import { expectSuppliedIcons } from "../../test-support/support/brandIcons.ts";
import { expectOwnOriginReadsOnly } from "../../test-support/support/localOriginReads.ts";

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

test("deployment installs, builds, and serves its pinned commit in isolation after main advances, with the real preview boundaries", async () => {
  // Staged after main changed the title and portrait
  // (../../test-support/support/pinnedDeployment.ts).
  const pinnedDeployment = await stagePinnedDeployment();
  const { fixture, env, commit, published, cartoon, staged } = pinnedDeployment;
  let preview: Awaited<ReturnType<typeof startDeploymentPreview>> | undefined;
  try {
    // The deployment checkout a commit is staged in: named by its prefix.
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
    // The fixture's root is its machine directory, holding its HOME.
    const earlierEntries = incidentEntries(fixture.root).length;
    preview = await startDeploymentPreview({
      directory: staged.directory,
      port: 0,
      env,
    });
    expect(new URL(preview.url).hostname).toBe("127.0.0.1");
    const page = await fetch(preview.url);
    expect(page.status).toBe(200);
    expect(await page.text()).toContain("PINNED DASHBOARD COMMIT");
    const avatar = await fetch(
      `${preview.url}/agent-avatars/odd-e-nerds/cartoon/stanly.webp`,
    );
    expect(avatar.status).toBe(200);
    expect(avatar.headers.get("content-type")).toContain("image/webp");
    expect(Buffer.from(await avatar.arrayBuffer())).toEqual(cartoon);
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
    // The pinned checkout's build serves Open Dough's supplied icon exports,
    // and its authenticated read boundary is reached only from the preview's
    // own origin.
    await expectSuppliedIcons(preview.url);
    await expectOwnOriginReadsOnly(preview.url);
    const pid = preview.pid;
    const url = preview.url;
    await preview.stop();
    expect(processRunning(pid)).toBe(false);
    await expect(
      fetch(url, { signal: AbortSignal.timeout(2_000) }),
    ).rejects.toThrow();
    preview = undefined;
    // Stopped as a replacement stops it, the preview closed cleanly: its
    // incident record (../../server/incidentLifecycle.ts) has its start and
    // end.
    const recorded = incidentEntries(fixture.root)
      .slice(earlierEntries)
      .map((entry) => entry.kind)
      .filter((kind) => kind.startsWith("process-"));
    expect(recorded).toEqual(["process-started", "process-ended"]);
  } finally {
    await preview?.stop();
    await pinnedDeployment.cleanup();
  }
}, 120_000);

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
      .poll(
        async () =>
          readFile(pidFile, "utf8")
            .then(Number)
            .catch(() => undefined),
        { timeout: 5_000 },
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
