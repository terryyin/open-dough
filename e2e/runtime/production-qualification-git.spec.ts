// Real Git under production qualification
// (../../dashboard/server/productionQualification.mjs): the published range
// is read from origin in an owned inspection, deletions, both rename ends and
// any file name included, and the inspection is removed while Git's detached
// background maintenance would still write into it.
import { execFileSync } from "node:child_process";
import {
  chmod,
  mkdir,
  readFile,
  readdir,
  symlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import {
  expect,
  test as base,
} from "../../dashboard/test-support/support/pageTest.ts";
import {
  ciWorkflowPath,
  qualifyPublishedRange,
} from "../../dashboard/server/productionQualification.mjs";
import { localPublishedMainFixture } from "../../dashboard/test-support/support/publishedMainFixture.ts";
import { repoRoot } from "../../dashboard/test-support/support/repositoryRoot.ts";

// Git's own exec path with `git` replaced: automatic maintenance, which a
// fetch starts detached, keeps writing pack entries until its repository's
// pack directory is gone, as CI's Git once left it writing during removal;
// every other Git command runs unchanged.
async function backgroundPackWriterGit(root: string) {
  const real = execFileSync("git", ["--exec-path"], {
    encoding: "utf8",
  }).trim();
  const execPath = path.join(root, "git-exec-path");
  await mkdir(execPath);
  for (const entry of await readdir(real)) {
    if (entry !== "git") {
      await symlink(path.join(real, entry), path.join(execPath, entry));
    }
  }
  const wrapper = path.join(execPath, "git");
  await writeFile(
    wrapper,
    `#!/bin/sh
if [ "$1" = maintenance ]; then
  pack="$("${real}/git" rev-parse --absolute-git-dir)/objects/pack"
  (
    n=0
    while [ -d "$pack" ] && [ "$n" -lt 200000 ]; do
      : >"$pack/racing-$((n % 20))" 2>/dev/null
      n=$((n + 1))
    done
  ) </dev/null >/dev/null 2>&1 &
  exit 0
fi
exec "${real}/git" "$@"
`,
  );
  await chmod(wrapper, 0o755);
  return execPath;
}

type PublishedMainFixture = Awaited<
  ReturnType<typeof localPublishedMainFixture>
>;
const tabbed = "old name\twith tab.js";
const inspectionsOf = (origin: PublishedMainFixture) =>
  path.join(origin.root, "inspections");

const test = base.extend<{ origin: PublishedMainFixture }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  origin: async ({}, use) => {
    const fixture = await localPublishedMainFixture();
    try {
      await use(fixture);
    } finally {
      await fixture.cleanup();
    }
  },
});

// Publishes A with this repository's workflow, then B after a deletion, a
// rename into and a rename out of the application, under awkward file names.
async function publishMovedPaths(origin: PublishedMainFixture) {
  const workflow = await readFile(path.join(repoRoot, ciWorkflowPath), "utf8");
  const a = await origin.publish(
    {
      [ciWorkflowPath]: workflow,
      "app.js": "A",
      "docs/moved.md": "moved",
      [`app/${tabbed}`]: "tabbed",
    },
    "Baseline",
  );
  await origin.commit(
    { "app.js": null, "docs/moved.md": null, "src/moved\nline.md": "moved" },
    "Delete and rename in",
  );
  const b = await origin.publish(
    { [`app/${tabbed}`]: null, [`docs/${tabbed}`]: "tabbed" },
    "Rename out",
  );
  return { a, b };
}

test("qualification reads a published range with deletions, both rename ends and any file name from origin, and removes its inspection while Git maintenance writes", async ({
  origin,
}) => {
  const { a, b } =
    await test.step("Given origin publishes a deletion and renames into and out of the application", () =>
      publishMovedPaths(origin));
  const qualified =
    await test.step("When qualification inspects that range while Git maintenance writes", async () =>
      qualifyPublishedRange({
        developmentRoot: origin.development,
        baseline: { origin: origin.origin, commit: a },
        selected: { origin: origin.origin, commit: b },
        inspectionsRoot: inspectionsOf(origin),
        env: {
          ...origin.env,
          GIT_EXEC_PATH: await backgroundPackWriterGit(origin.root),
        },
      }));
  await test.step("Then it names every changed path and qualifies the application ones", () => {
    expect(qualified).toEqual({
      qualifies: true,
      changed: [
        "app.js",
        `app/${tabbed}`,
        "docs/moved.md",
        `docs/${tabbed}`,
        "src/moved\nline.md",
      ],
      qualifying: ["app.js", `app/${tabbed}`, "src/moved\nline.md"],
    });
  });
  await test.step("And its inspection is removed", async () => {
    expect(await readdir(inspectionsOf(origin))).toEqual([]);
  });
});
