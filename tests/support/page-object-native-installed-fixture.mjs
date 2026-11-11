// Full release installation/update followed by fresh ordinary browser work.
// Releases and tags exist only in the caller's isolated fixture directory.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import {
  commitDeclaredRevision,
  materializeLocalCheckout,
} from "./repository-fixture.mjs";
import { tagRevision } from "./repository-history.mjs";
import { createPageObjectProject } from "./page-object-native-fixture.mjs";

export async function createPageObjectInstalledProject(
  directory,
  host,
  { files = {} } = {},
) {
  const fixture = await createPageObjectProject(directory, host, {
    guidance: false,
    files: {
      ".agents/skills/other-skill/SKILL.md": "# Unrelated guidance\n",
      ".claude/skills/other-skill/SKILL.md": "# Unrelated guidance\n",
      ...files,
    },
  });
  const source = join(dirname(directory), "releases");
  await materializeLocalCheckout(
    undefined,
    makeMe.aRepository
      .withRevision("before page objects", {
        backlog: null,
        release: makeMe.aRelease
          .with({
            version: "0.1.1",
            taggedAt: "2026-09-01T00:00:00",
            marker: "before-page-objects",
            withheld: ["dough-page-objects/", "dough-makeme/"],
            removed: ["dough-page-objects", "dough-makeme"],
          })
          .please(),
      })
      .please(),
    { at: source },
  );
  const sourceUrl = `file://${source}`;
  const run = (...args) =>
    execFileSync("bash", args, { encoding: "utf8", maxBuffer: 4e6 });
  const installLog = join(dirname(directory), "install.txt");
  writeFileSync(
    installLog,
    run(
      join(source, "install.sh"),
      "--target",
      fixture.project,
      "--source",
      sourceUrl,
      "--platform",
      host,
    ),
  );
  const revision = makeMe.aRepository
    .withRevision("with page objects", {
      backlog: null,
      release: makeMe.aRelease
        .with({
          version: "0.1.2",
          taggedAt: "2026-09-02T00:00:00",
          marker: "with-page-objects",
        })
        .please(),
    })
    .please().revisions[0];
  await commitDeclaredRevision(source, revision);
  await tagRevision(source, revision);
  const updateLog = join(dirname(directory), "update.txt");
  writeFileSync(
    updateLog,
    run(
      join(source, "src/install/open-dough-release.sh"),
      "apply",
      "--target",
      fixture.project,
      "--platform",
      host,
      "--checkout",
      source,
    ),
  );
  execFileSync("git", ["-C", fixture.project, "add", "."]);
  execFileSync("git", [
    "-C",
    fixture.project,
    "commit",
    "-m",
    "update guidance",
  ]);
  return { ...fixture, source, sourceUrl, installLog, updateLog };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [directory, host] = process.argv.slice(2);
  console.log(
    JSON.stringify(await createPageObjectInstalledProject(directory, host)),
  );
}
