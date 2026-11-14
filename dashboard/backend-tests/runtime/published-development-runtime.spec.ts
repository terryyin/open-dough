// Locked development packages are an input; caches and published source stay
// private. Real production installation is exercised by production-deployment.
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { localPublishedMainFixture } from "../../tests/support/publishedMainFixture.ts";
import { repoRoot } from "../../tests/support/repositoryRoot.ts";

const exec = promisify(execFile);
const runtimeScript = `node --input-type=module -e "import {version} from 'vite'; import React from 'react'; console.log(JSON.stringify({vite:version,react:React.version,cwd:process.cwd()}))"`;

test("locked development inputs need no second install and keep writable caches and publications private", async ({
  publishedApplicationSourceReady,
}) => {
  await Promise.resolve(publishedApplicationSourceReady);
  const fixtures: Awaited<ReturnType<typeof localPublishedMainFixture>>[] = [];
  const viteManifest = path.join(repoRoot, "node_modules/vite/package.json");
  const originalVite = await readFile(viteManifest, "utf8");
  const lock = JSON.parse(
    await readFile(path.join(repoRoot, "package-lock.json"), "utf8"),
  ) as { packages: Record<string, { version?: string }> };
  try {
    for (let index = 0; index < 2; index += 1) {
      const fixture = await localPublishedMainFixture(true, "application");
      fixtures.push(fixture);
      const manifest = JSON.parse(
        await readFile(path.join(fixture.development, "package.json"), "utf8"),
      ) as { scripts: Record<string, string> };
      const facts = makeMe.aRepository
        .withRevision("Development runtime observation", {
          backlog: null,
          files: {
            "package.json": JSON.stringify({
              ...manifest,
              scripts: {
                ...manifest.scripts,
                "inspect-runtime": runtimeScript,
              },
            }),
          },
        })
        .please().revisions[0];
      await fixture.commit(facts.files ?? {}, facts.name);
      const bin = path.join(fixture.root, "poisoned-install");
      await mkdir(bin);
      await writeFile(
        path.join(bin, "npm"),
        "#!/bin/sh\nprintf 'unexpected repeated development installation' >&2\nexit 99\n",
        { mode: 0o755 },
      );
      const previousPath = fixture.env["PATH"];
      fixture.env["PATH"] = [bin, previousPath ?? ""].join(path.delimiter);
      fixture.env["NODE_ENV"] = "production";
      try {
        await fixture.installDevelopment();
      } finally {
        fixture.env["PATH"] = previousPath;
      }
      const observed = JSON.parse(
        (
          await exec("npm", ["run", "--silent", "inspect-runtime"], {
            cwd: fixture.development,
            env: fixture.env,
          })
        ).stdout.trim(),
      ) as unknown;
      expect(observed).toEqual({
        vite: lock.packages["node_modules/vite"]?.version,
        react: lock.packages["node_modules/react"]?.version,
        cwd: await realpath(fixture.development),
      });
    }
    const [first, second] = fixtures;
    if (!first || !second) throw new Error("Two development fixtures required");
    const secondSource = await readFile(
      path.join(second.development, "dashboard/index.html"),
      "utf8",
    );
    const marker = `private-${path.basename(first.root)}`;
    for (const cache of [".vite", ".vite-temp", ".cache"]) {
      const directory = path.join(first.development, "node_modules", cache);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, marker), "first only");
      expect(
        existsSync(
          path.join(second.development, "node_modules", cache, marker),
        ),
      ).toBe(false);
      expect(
        existsSync(path.join(repoRoot, "node_modules", cache, marker)),
      ).toBe(false);
    }
    await first.publish(first.markerChanges("FIRST PRIVATE SOURCE"), "First");
    expect(await first.git("ls-files", "--", "node_modules")).toBe("");
    expect(
      (
        await exec("git", [
          "--git-dir",
          first.origin,
          "ls-tree",
          "-r",
          "--name-only",
          "main",
          "--",
          "node_modules",
        ])
      ).stdout,
    ).toBe("");
    expect(
      await readFile(
        path.join(second.development, "dashboard/index.html"),
        "utf8",
      ),
    ).toBe(secondSource);
    await first.cleanup();
    expect(existsSync(first.root)).toBe(false);
    expect(await readFile(viteManifest, "utf8")).toBe(originalVite);
    expect(
      (
        await exec("npm", ["run", "--silent", "inspect-runtime"], {
          cwd: second.development,
          env: second.env,
        })
      ).stdout,
    ).toContain(second.development);
  } finally {
    await Promise.all(fixtures.map((fixture) => fixture.cleanup()));
  }
});

test("a changed development lock uses real npm ci and retains dev dependencies under production", async ({
  publishedApplicationSourceReady,
}) => {
  await Promise.resolve(publishedApplicationSourceReady);
  const fixture = await localPublishedMainFixture(true, "application");
  try {
    const name = "fixture-development-dependency";
    const facts = makeMe.aRepository
      .withRevision("Different development dependencies", {
        backlog: null,
        files: {
          "package.json": JSON.stringify({
            name: "development-fallback",
            devDependencies: { [name]: "file:./development-dependency" },
            scripts: {
              prepare: `node -e "require('node:fs').writeFileSync('native-install.txt', process.env.npm_lifecycle_event)"`,
            },
          }),
          "package-lock.json": JSON.stringify({
            name: "development-fallback",
            lockfileVersion: 3,
            requires: true,
            packages: {
              "": {
                name: "development-fallback",
                devDependencies: { [name]: "file:./development-dependency" },
              },
              "development-dependency": { name, version: "1.0.0", dev: true },
              [`node_modules/${name}`]: {
                resolved: "development-dependency",
                link: true,
              },
            },
          }),
          "development-dependency/package.json": JSON.stringify({
            name,
            version: "1.0.0",
            main: "index.cjs",
          }),
          "development-dependency/index.cjs":
            "module.exports = 'local development dependency';\n",
        },
      })
      .please().revisions[0];
    await fixture.commit(facts.files ?? {}, facts.name);
    fixture.env["NODE_ENV"] = "production";
    await fixture.installDevelopment();
    expect(
      await readFile(
        path.join(fixture.development, "native-install.txt"),
        "utf8",
      ),
    ).toBe("prepare");
    expect(
      (
        await exec(
          process.execPath,
          ["-e", `console.log(require('${name}'))`],
          {
            cwd: fixture.development,
            env: fixture.env,
          },
        )
      ).stdout.trim(),
    ).toBe("local development dependency");
  } finally {
    await fixture.cleanup();
  }
});
