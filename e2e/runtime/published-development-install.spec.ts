// A fixture whose development lock differs from this checkout's installs its
// own packages with a real `npm ci`, keeping dev dependencies under a
// production NODE_ENV.
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import {
  expect,
  test as base,
} from "../../dashboard/test-support/support/pageTest.ts";
import { localPublishedMainFixture } from "../../dashboard/test-support/support/publishedMainFixture.ts";

const exec = promisify(execFile);

type PublishedMainFixture = Awaited<
  ReturnType<typeof localPublishedMainFixture>
>;

// An application fixture whose commands run under a production NODE_ENV.
const test = base.extend<{ fixture: PublishedMainFixture }>({
  fixture: async ({ publishedApplicationSourceReady }, use) => {
    await Promise.resolve(publishedApplicationSourceReady);
    const fixture = await localPublishedMainFixture(true, "application");
    fixture.env["NODE_ENV"] = "production";
    try {
      await use(fixture);
    } finally {
      await fixture.cleanup();
    }
  },
});

const dependency = "fixture-development-dependency";

// A development lock this checkout's packages do not match: one local dev
// dependency, and a prepare script that records which npm lifecycle ran it.
const differentDevelopmentLock = () =>
  makeMe.aRepository
    .withRevision("Different development dependencies", {
      backlog: null,
      files: {
        "package.json": JSON.stringify({
          name: "development-fallback",
          devDependencies: { [dependency]: "file:./development-dependency" },
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
              devDependencies: {
                [dependency]: "file:./development-dependency",
              },
            },
            "development-dependency": {
              name: dependency,
              version: "1.0.0",
              dev: true,
            },
            [`node_modules/${dependency}`]: {
              resolved: "development-dependency",
              link: true,
            },
          },
        }),
        "development-dependency/package.json": JSON.stringify({
          name: dependency,
          version: "1.0.0",
          main: "index.cjs",
        }),
        "development-dependency/index.cjs":
          "module.exports = 'local development dependency';\n",
      },
    })
    .please().revisions[0];

const resolvedDependency = async (fixture: PublishedMainFixture) =>
  (
    await exec(
      process.execPath,
      ["-e", `console.log(require('${dependency}'))`],
      { cwd: fixture.development, env: fixture.env },
    )
  ).stdout.trim();

test("a changed development lock uses real npm ci and retains dev dependencies under production", async ({
  fixture,
}) => {
  await test.step("Given the fixture commits a different development lock", async () => {
    const revision = differentDevelopmentLock();
    await fixture.commit(revision.files ?? {}, revision.name);
  });
  await test.step("When it installs development under a production NODE_ENV", () =>
    fixture.installDevelopment());
  await test.step("Then npm ci ran the package's prepare script", async () => {
    expect(
      await readFile(
        path.join(fixture.development, "native-install.txt"),
        "utf8",
      ),
    ).toBe("prepare");
  });
  await test.step("And the dev dependency resolves under production", async () => {
    expect(await resolvedDependency(fixture)).toBe(
      "local development dependency",
    );
  });
});
