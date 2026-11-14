// Application publications use current runtime inputs, while repository callers
// still receive the full live tree. Both retain private writable Git and HOME.
import { execFile } from "node:child_process";
import { chmod, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { objectPack } from "../../../Distribution/tests/support/fixture-observation.mjs";
import {
  localPublishedMainFixture,
  publishedMainFixture,
} from "../../tests/support/publishedMainFixture.ts";
import { publishedMainSourceArtifact } from "../../tests/support/publishedMainSource.ts";
import {
  requestRunArtifact,
  startRunArtifacts,
} from "../../tests/support/runArtifacts.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";

const exec = promisify(execFile);

test("application inputs preserve live runtime and policy bytes, with isolated publication after shared source retirement", async () => {
  const source = await materializeRepository(
    makeMe.aRepository
      .withRevision("source", {
        files: {
          "dashboard/index.html": "<title>COMMITTED</title>\n",
          "dashboard/server/deleted.ts": "DELETE THIS INPUT\n",
          "dashboard/public/agent-avatars/excluded.webp": "LOCAL AVATAR\n",
          ".github/workflows/ci.yml": "name: REAL POLICY\n",
          ".planning/maintainer.md": "PRIVATE PLANNING\n",
          "docs/maintainer.md": "REPOSITORY DOCUMENTATION\n",
          "tests/maintainer.spec.ts": "MAINTENANCE TEST\n",
        },
      })
      .please(),
  );
  const fixtures: (
    | Awaited<ReturnType<typeof publishedMainFixture>>
    | Awaited<ReturnType<typeof localPublishedMainFixture>>
  )[] = [];
  let closeArtifacts: (() => Promise<void>) | undefined;
  try {
    await writeFile(
      path.join(source.integration, "dashboard/index.html"),
      "<title>LIVE</title>\n",
    );
    await rm(path.join(source.integration, "dashboard/server/deleted.ts"));
    await writeFile(
      path.join(source.integration, ".github/workflows/ci.yml"),
      "name: LIVE POLICY\n",
    );
    await writeFile(
      path.join(source.integration, "dashboard/server/new-runtime.ts"),
      "export const live = true;\n",
    );
    await writeFile(
      path.join(source.integration, "docs/untracked.md"),
      "LIVE REPOSITORY NOTE\n",
    );
    closeArtifacts = await startRunArtifacts(
      new Map([
        publishedMainSourceArtifact(source.integration),
        publishedMainSourceArtifact(source.integration, "application"),
      ]),
    );
    const created = await Promise.allSettled([
      localPublishedMainFixture(true, "application"),
      publishedMainFixture(true, "application"),
      publishedMainFixture(true),
    ]);
    for (const result of created)
      if (result.status === "fulfilled") fixtures.push(result.value);
    for (const result of created)
      if (result.status === "rejected") throw result.reason;
    const [first, second, repository] = fixtures;
    if (!first || !second || !repository)
      throw new Error("Expected three private fixtures");
    expect(first.gh).toBeUndefined();
    expect(second.gh).toBeDefined();
    for (const fixture of [first, second]) {
      expect(await fixture.git("show", "HEAD:dashboard/index.html")).toBe(
        "<title>LIVE</title>",
      );
      expect(
        await fixture.git("show", "HEAD:dashboard/server/new-runtime.ts"),
      ).toBe("export const live = true;");
      expect(await fixture.git("show", "HEAD:.github/workflows/ci.yml")).toBe(
        "name: LIVE POLICY",
      );
      expect(
        await fixture.git(
          "ls-files",
          "--",
          "dashboard/server/deleted.ts",
          "dashboard/public/agent-avatars",
          ".planning",
          "docs",
          "tests",
        ),
      ).toBe("");
      expect(
        (await exec("git", ["--git-dir", fixture.origin, "for-each-ref"]))
          .stdout,
      ).toBe("");
    }
    expect(await repository.git("show", "HEAD:.planning/maintainer.md")).toBe(
      "PRIVATE PLANNING",
    );
    expect(await repository.git("show", "HEAD:docs/untracked.md")).toBe(
      "LIVE REPOSITORY NOTE",
    );
    const shared = await requestRunArtifact("published-application-source");
    if (shared === undefined) throw new Error("No application source owner");
    const packs = [shared, first.development, second.development].map(
      (directory) => objectPack(path.join(directory, ".git")),
    );
    expect(
      new Set(
        await Promise.all(packs.map(async (file) => (await stat(file)).ino)),
      ).size,
    ).toBe(3);
    const firstPack = packs[1];
    if (firstPack === undefined) throw new Error("No first private pack");
    const bytes = await readFile(firstPack);
    await chmod(firstPack, 0o644);
    await writeFile(firstPack, "DAMAGED PRIVATE OBJECTS\n");
    await expect(first.git("fsck", "--full")).rejects.toThrow();
    await second.git("fsck", "--full");
    await exec("git", ["-C", shared, "fsck", "--full"]);
    await writeFile(firstPack, bytes);
    expect(first.env["HOME"]).toBe(first.home);
    expect(second.env["HOME"]).toBe(second.home);
    expect(first.home).not.toBe(second.home);
    await writeFile(path.join(first.home, "private"), "FIRST HOME\n");
    await expect(readFile(path.join(second.home, "private"))).rejects.toThrow();
    await source.cleanup();
    const close = closeArtifacts;
    closeArtifacts = undefined;
    await close();
    await expect(stat(shared)).rejects.toMatchObject({ code: "ENOENT" });
    const published = await first.publish(
      { "dashboard/server/new-runtime.ts": "FIRST ONLY\n" },
      "First application",
    );
    expect(
      (
        await exec("git", [
          "--git-dir",
          first.origin,
          "show",
          `${published}:dashboard/server/new-runtime.ts`,
        ])
      ).stdout,
    ).toBe("FIRST ONLY\n");
    expect(await second.git("status", "--porcelain")).toBe("");
    expect(
      await second.git("show", "HEAD:dashboard/server/new-runtime.ts"),
    ).toBe("export const live = true;");
    await first.cleanup();
    await second.push();
    expect(
      (
        await exec("git", [
          "--git-dir",
          second.origin,
          "show",
          "main:dashboard/server/new-runtime.ts",
        ])
      ).stdout,
    ).toBe("export const live = true;\n");
  } finally {
    await Promise.all(fixtures.map((fixture) => fixture.cleanup()));
    await closeArtifacts?.();
    await source.cleanup();
  }
});

test("an application fixture without a run owner publishes the current app privately", async () => {
  const owner = process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
  let fixture: Awaited<ReturnType<typeof publishedMainFixture>> | undefined;
  try {
    fixture = await publishedMainFixture(true, "application");
    expect(
      await fixture.git(
        "ls-files",
        "--",
        ".planning",
        "tests",
        ".agents",
        ".claude",
      ),
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
    expect(
      (
        await exec("git", [
          "--git-dir",
          fixture.origin,
          "show",
          "main:.github/workflows/ci.yml",
        ])
      ).stdout,
    ).toBe(
      await readFile(path.join(repoRoot, ".github/workflows/ci.yml"), "utf8"),
    );
  } finally {
    await fixture?.cleanup();
    if (owner === undefined)
      delete process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"];
    else process.env["OPEN_DOUGH_DASHBOARD_ARTIFACT_OWNER"] = owner;
  }
});
