// Owned real-Git setup for production qualification; no build or decision is
// supplied by the fixture.
import { expect } from "./pageTest.ts";
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
  ciWorkflowPath,
  qualifyPublishedRange,
} from "../../server/productionQualification.mjs";
import { publishedMainFixture } from "./publishedMainFixture.ts";
import { repoRoot } from "./repositoryRoot.ts";

export const pushExclusions =
  '    paths-ignore:\n      - ".planning/**"\n      - "docs/**"\n';

export async function qualificationFixture() {
  const fixture = await publishedMainFixture();
  const workflow = await readFile(path.join(repoRoot, ciWorkflowPath), "utf8");
  expect(workflow).toContain(`  push:\n${pushExclusions}`);
  const inspectionsRoot = path.join(fixture.root, "inspections");
  const qualify = async (from: string, to: string) => {
    const result = await qualifyPublishedRange({
      developmentRoot: fixture.development,
      baseline: { origin: fixture.origin, commit: from },
      selected: { origin: fixture.origin, commit: to },
      inspectionsRoot,
      env: fixture.env,
    });
    expect(await readdir(inspectionsRoot)).toEqual([]);
    return result;
  };
  return { fixture, workflow, inspectionsRoot, qualify };
}

// Git's own exec path with `git` replaced: automatic maintenance, which a
// fetch starts detached, keeps writing pack entries until its repository's
// pack directory is gone, as CI's Git once left it writing during removal;
// every other Git command runs unchanged.
export async function backgroundPackWriterGit(root: string) {
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
