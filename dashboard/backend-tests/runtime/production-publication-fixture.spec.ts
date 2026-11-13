// The disposable origin receives exactly the path changes a test publishes.
import { expect, test } from "../../tests/support/pageTest.ts";
import { execFile } from "node:child_process";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { publishedMainFixture } from "../../tests/support/publishedMainFixture.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { materializeRepository } from "../../../tests/support/repository-fixture.mjs";
import { publishedMainSourceArtifact } from "../../tests/support/publishedMainSource.ts";
import { startRunArtifacts } from "../../tests/support/runArtifacts.ts";

const exec = promisify(execFile);

test("a documentation-only publication pushes only its requested paths to origin main", async ({
  publishedRepositorySourceReady,
}) => {
  await Promise.resolve(publishedRepositorySourceReady);
  const fixture = await publishedMainFixture(true);
  const origin = async (...args: string[]) =>
    (await exec("git", ["--git-dir", fixture.origin, ...args])).stdout;
  try {
    await fixture.push();
    const base = (await origin("rev-parse", "main")).trim();
    const readme = await readFile(
      path.join(fixture.development, "dashboard/README.md"),
      "utf8",
    );
    const published = await fixture.commit(
      {
        "dashboard/README.md": `${readme}\nPublication fixture note.\n`,
        "docs/publication-note.md": "# Publication note\n",
        "docs/dashboard-navigation.md": null,
      },
      "Document only",
    );
    await fixture.push();

    expect((await origin("rev-parse", "main")).trim()).toBe(published);
    expect((await origin("rev-parse", `${published}^`)).trim()).toBe(base);
    expect(
      (await origin("diff", "--name-status", "-z", base, published))
        .split("\0")
        .filter(Boolean),
    ).toEqual([
      "M",
      "dashboard/README.md",
      "D",
      "docs/dashboard-navigation.md",
      "A",
      "docs/publication-note.md",
    ]);
    for (const file of [
      "VERSION",
      "package.json",
      "dashboard/index.html",
      "dashboard/server/productionDeployment.mjs",
    ])
      expect(await origin("show", `${published}:${file}`)).toBe(
        await readFile(path.join(repoRoot, file), "utf8"),
      );
  } finally {
    await fixture.cleanup();
  }
});

test("full-source fixtures preserve live bytes and publish independently after their shared source is gone", async () => {
  const source = await materializeRepository(
    makeMe.aRepository
      .withRevision("source", {
        files: {
          "dashboard/index.html": "<title>COMMITTED</title>\n",
          "deleted.txt": "REMOVE FROM LIVE SOURCE\n",
          "dashboard/public/agent-avatars/excluded.webp": "LOCAL AVATAR\n",
        },
      })
      .please(),
  );
  let closeArtifacts: (() => Promise<void>) | undefined;
  const fixtures: Awaited<ReturnType<typeof publishedMainFixture>>[] = [];
  try {
    await writeFile(
      path.join(source.integration, "dashboard/index.html"),
      "<title>LIVE</title>\n",
    );
    await rm(path.join(source.integration, "deleted.txt"));
    await writeFile(
      path.join(source.integration, "new-source.ts"),
      "export const live = true;\n",
    );
    closeArtifacts = await startRunArtifacts(
      new Map([publishedMainSourceArtifact(source.integration)]),
    );
    const created = await Promise.allSettled([
      publishedMainFixture(true),
      publishedMainFixture(true),
    ]);
    for (const result of created)
      if (result.status === "fulfilled") fixtures.push(result.value);
    for (const result of created)
      if (result.status === "rejected") throw result.reason;
    const [first, second] = fixtures;
    if (!first || !second) throw new Error("Expected two private fixtures");
    for (const fixture of fixtures) {
      expect(await fixture.git("show", "HEAD:dashboard/index.html")).toBe(
        "<title>LIVE</title>",
      );
      expect(await fixture.git("show", "HEAD:new-source.ts")).toBe(
        "export const live = true;",
      );
      expect(
        await fixture.git(
          "ls-files",
          "--",
          "deleted.txt",
          "dashboard/public/agent-avatars",
        ),
      ).toBe("");
      expect(
        (await exec("git", ["--git-dir", fixture.origin, "for-each-ref"]))
          .stdout,
      ).toBe("");
    }
    expect(first.env["HOME"]).toBe(first.home);
    expect(second.env["HOME"]).toBe(second.home);
    expect(first.home).not.toBe(second.home);
    await writeFile(path.join(first.home, "private"), "FIRST HOME\n");
    await expect(readFile(path.join(second.home, "private"))).rejects.toThrow();
    await source.cleanup();
    const close = closeArtifacts;
    closeArtifacts = undefined;
    await close();

    const published = await first.publish(
      { "new-source.ts": "FIRST ONLY\n" },
      "First fixture",
    );
    expect(
      (
        await exec("git", [
          "--git-dir",
          first.origin,
          "show",
          `${published}:new-source.ts`,
        ])
      ).stdout,
    ).toBe("FIRST ONLY\n");
    expect(await second.git("status", "--porcelain")).toBe("");
    expect(
      await readFile(path.join(second.development, "new-source.ts"), "utf8"),
    ).toBe("export const live = true;\n");
    expect(
      (await exec("git", ["--git-dir", second.origin, "for-each-ref"])).stdout,
    ).toBe("");
    await first.cleanup();
    await second.push();
    expect(
      (
        await exec("git", [
          "--git-dir",
          second.origin,
          "show",
          "main:new-source.ts",
        ])
      ).stdout,
    ).toBe("export const live = true;\n");
  } finally {
    await Promise.all(fixtures.map((fixture) => fixture.cleanup()));
    await closeArtifacts?.();
    await source.cleanup();
  }
});

test("a full-source fixture without a run owner keeps private publication usable", async () => {
  const owner = process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  let fixture: Awaited<ReturnType<typeof publishedMainFixture>> | undefined;
  try {
    fixture = await publishedMainFixture(true);
    expect(
      (await exec("git", ["--git-dir", fixture.origin, "for-each-ref"])).stdout,
    ).toBe("");
    await fixture.push();
    expect(
      (
        await exec("git", [
          "--git-dir",
          fixture.origin,
          "show",
          "main:dashboard/server/productionDeployment.mjs",
        ])
      ).stdout,
    ).toBe(
      await readFile(
        path.join(repoRoot, "dashboard/server/productionDeployment.mjs"),
        "utf8",
      ),
    );
  } finally {
    await fixture?.cleanup();
    if (owner === undefined)
      delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
    else process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"] = owner;
  }
});
