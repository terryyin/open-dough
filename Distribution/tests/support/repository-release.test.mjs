import assert from "node:assert/strict";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { git } from "../../src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";

test("a local release checkout built in place tags its release annotated at the stated date and has no origin", async (t) => {
  const at = join(
    realpathSync(mkdtempSync(join(tmpdir(), "release-source-"))),
    "source",
  );
  const { integration, fixture, revisions } = await materializeLocalCheckout(
    t,
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
    { at },
  );
  t.after(() => rmSync(dirname(at), { recursive: true, force: true }));
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
    await read("show", "v0.1.10:Distribution/src/skills/dough-update/SKILL.md"),
    /\n<!-- open-dough-payload payload-0\.1\.10 -->$/,
  );
});

test("a release ships and declares the payload it adds, and a later release whose revision removes it neither ships nor declares it", async (t) => {
  const at = join(
    realpathSync(mkdtempSync(join(tmpdir(), "release-source-"))),
    "source",
  );
  await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("release 0.1.0", {
        backlog: null,
        release: makeMe.aRelease
          .with({
            version: "0.1.0",
            taggedAt: "2026-08-31T00:00:00",
            marker: "payload-0.1.0",
            added: { "dough-retired/a.md": "a from 0.1.0\n" },
          })
          .please(),
      })
      .withRevision("release 0.1.1", {
        backlog: null,
        remove: ["Distribution/src/skills/dough-retired"],
        release: makeMe.aRelease
          .with({
            version: "0.1.1",
            taggedAt: "2026-09-01T00:00:00",
            marker: "payload-0.1.1",
          })
          .please(),
      })
      .please(),
    { at },
  );
  t.after(() => rmSync(dirname(at), { recursive: true, force: true }));
  const read = async (...args) => (await git(at, ...args)).stdout.trim();

  assert.equal(
    await read("show", "v0.1.0:Distribution/src/skills/dough-retired/a.md"),
    "a from 0.1.0",
  );
  assert.match(
    await read("show", "v0.1.0:install.sh"),
    /^managed_files=\(\n {2}dough-retired\/a\.md\n/m,
  );
  assert.equal(
    await read("ls-tree", "v0.1.1", "Distribution/src/skills/dough-retired"),
    "",
  );
  assert.doesNotMatch(await read("show", "v0.1.1:install.sh"), /dough-retired/);
});
