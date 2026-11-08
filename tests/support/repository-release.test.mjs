import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeRepository } from "./repository-fixture.mjs";

test("a release revision states its version, tag date, payload marker and payload deltas", () => {
  const description = makeMe.aRepository
    .withRevision("release 0.1.1", {
      backlog: null,
      release: makeMe.aRelease
        .with({
          version: "0.1.1",
          taggedAt: "2026-06-01T00:00:00",
          marker: "payload-0.1.1",
          withheld: ["dough-pfe/"],
          removed: ["dough-pfe/SKILL.md"],
        })
        .please(),
    })
    .please();

  assert.deepEqual(description.revisions[0].release, {
    version: "0.1.1",
    taggedAt: "2026-06-01T00:00:00",
    marker: "payload-0.1.1",
    withheld: ["dough-pfe/"],
    removed: ["dough-pfe/SKILL.md"],
  });
  assert.deepEqual(
    makeMe.aRelease
      .with({ version: "0.1.2", taggedAt: "2026-09-01", marker: "m" })
      .please(),
    {
      version: "0.1.2",
      taggedAt: "2026-09-01",
      marker: "m",
      withheld: [],
      removed: [],
    },
  );
});

test("a local release checkout built in place tags its release annotated at the stated date and has no origin", async (t) => {
  const at = join(
    realpathSync(mkdtempSync(join(tmpdir(), "release-source-"))),
    "source",
  );
  const { integration, fixture, revisions, cleanup } =
    await materializeRepository(
      makeMe.aRepository
        .withRevision("release 0.1.10", {
          backlog: null,
          release: makeMe.aRelease
            .with({
              version: "0.1.10",
              taggedAt: "2020-01-01T00:00:00",
              marker: "payload-0.1.10",
            })
            .please(),
          tags: ["not-a-release"],
        })
        .please(),
      { at, withoutOrigin: true },
    );
  t.after(() => rmSync(dirname(at), { recursive: true, force: true }));
  t.after(cleanup);
  const read = async (...args) => (await git(at, ...args)).stdout.trim();

  assert.equal(integration, at);
  assert.equal(fixture, at);
  assert.equal(await read("remote"), "");
  assert.equal(
    await read(
      "for-each-ref",
      "--format=%(refname) %(objecttype) %(*objectname)",
      "refs/tags",
    ),
    [
      `refs/tags/not-a-release commit `,
      `refs/tags/v0.1.10 tag ${revisions["release 0.1.10"]}`,
    ].join("\n"),
  );
  assert.equal(
    await read(
      "for-each-ref",
      "--format=%(taggerdate:format:%Y-%m-%d %H:%M:%S)",
      "refs/tags/v0.1.10",
    ),
    "2020-01-01 00:00:00",
  );
  assert.equal(await read("show", "v0.1.10:VERSION"), "0.1.10");
  assert.equal(
    await read("show", "v0.1.10:CHANGELOG.md"),
    "## 0.1.10 - 2026-09-06\n\npayload-0.1.10",
  );
  assert.match(
    await read("show", "v0.1.10:src/skills/dough-update/SKILL.md"),
    /\n<!-- open-dough-payload payload-0\.1\.10 -->$/,
  );
});
