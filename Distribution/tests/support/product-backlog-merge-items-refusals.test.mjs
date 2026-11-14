// Where the two branches change one work item's meaning differently, or a
// supplied version is not one this tool can read, the real backlog CLI hands
// the decision back: a diagnostic on standard error, a nonzero exit, and the
// destination left exactly as it was.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  architecture,
  backlog,
  backlogOf,
  queued,
  run,
  scratchProject,
  takenEntry,
} from "./product-backlog-fixture.mjs";
import { versionPath, versions } from "./product-backlog-merge-fixture.mjs";

const [trunk, retrospective, review] = queued;

test("merge items refuses two different changes to one work item", async (t) => {
  const project = scratchProject(t);
  const rename = (title) =>
    backlogOf(
      [takenEntry],
      [
        trunk,
        retrospective,
        review.replace(
          "Strengthen architectural review after using the lightweight guidance",
          title,
        ),
      ],
    );

  const refused = await run(
    project,
    versions(
      project,
      backlog,
      rename("Strengthen review one"),
      rename("Strengthen review two"),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    new RegExp(`"${architecture}": the versions give it different titles`),
  );
  assert.match(
    refused.stderr,
    /"Strengthen review one" and .* has "Strengthen review two"/,
  );
  assert.match(refused.stderr, /The backlog was not changed\./);
});

test("merge items refuses writing a version holds between the two lists", async (t) => {
  // A merge rewrites the run of sections from the direction to the end of the
  // queue, so a section wedged into that run is refused rather than dropped.
  const wedged = backlog.replace(
    "## Backlog list\n",
    "## Notes\n\nSomebody's working notes.\n\n## Backlog list\n",
  );
  const project = scratchProject(t);

  const refused = await run(
    project,
    versions(project, backlog, wedged, backlog),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    /do not come one after another, in that order\./,
  );
  assert.match(refused.stderr, /would not survive it/);
});

test("merge items refuses a closure against an explicit return to the queue", async (t) => {
  const project = scratchProject(t);

  const refused = await run(
    project,
    versions(
      project,
      backlog,
      // One branch closed the taken story.
      backlogOf([], queued),
      // The other returned it to the queue, carrying its line across.
      backlogOf([], [takenEntry, ...queued]),
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    refused.stderr,
    /removes it while .* changes it\. Removing work and changing it are different intentions/,
  );
});

test("merge items refuses a version it cannot read", async (t) => {
  const project = scratchProject(t);

  const prose = backlog.replace(
    "## Backlog list\n\n",
    "## Backlog list\n\nStories we might do next:\n\n",
  );
  const malformed = await run(
    project,
    versions(project, backlog, prose, backlog),
  );
  assert.equal(malformed.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    malformed.stderr,
    /the first branch version \(.*one\.md\) is not a backlog this tool can read/,
  );
  assert.match(malformed.stderr, /Unsupported text in "## Backlog list"/);

  const twice = backlogOf([takenEntry], [trunk, retrospective, trunk]);
  const duplicate = await run(
    project,
    versions(project, backlog, twice, backlog),
  );
  assert.equal(duplicate.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(duplicate.stderr, /already lists the same work twice/);

  const absent = await run(project, [
    "merge",
    "--ancestor",
    versionPath("nowhere"),
    "--branch",
    versionPath("one"),
    "--branch",
    versionPath("other"),
  ]);
  assert.equal(absent.code, 1);
  assert.equal(project.read(), backlog, "the destination was written");
  assert.match(
    absent.stderr,
    /Not found: .*nowhere\.md \(the ancestor version\)/,
  );
});

test("merge items refuses one branch saying two things about one work item", async (t) => {
  // The entry is listed once on each side, but the branch's refreshed link and
  // its re-added old home are the same work: across the versions they chain
  // together, and no merge rule establishes which of the two it meant.
  const home =
    "seeds/SEED-002-release-the-guidance.md#publish-the-release-notes";
  const moved =
    "seeds/SEED-009-release-the-guidance.md#publish-the-release-notes";
  const ancestor = backlogOf([takenEntry], [`- [Notes](${home}) — SEED-002`]);
  const project = scratchProject(t, ancestor);

  const refused = await run(
    project,
    versions(
      project,
      ancestor,
      backlogOf(
        [takenEntry],
        [`- [Notes](${moved}) — SEED-002`, `- [Notes](${home})`],
      ),
      ancestor,
    ),
  );

  assert.equal(refused.code, 1);
  assert.equal(project.read(), ancestor, "the destination was written");
  assert.match(
    refused.stderr,
    /separately, but across the supplied versions they name one work item/,
  );
});

test("merge items requires the ancestor and exactly two branch versions", async (t) => {
  const project = scratchProject(t);
  const written = versions(project, backlog, backlog, backlog);

  const unanchored = await run(
    project,
    written.slice(0, 1).concat(written.slice(3)),
  );
  assert.equal(unanchored.code, 1);
  assert.match(unanchored.stderr, /Missing ancestor: supply --ancestor\./);
  assert.match(
    unanchored.stderr,
    /names the version both branches started from/,
  );

  const alone = await run(project, written.slice(0, 5));
  assert.equal(alone.code, 1);
  assert.match(
    alone.stderr,
    /Supply --branch <path> exactly twice, once for each branch's version of the backlog; found 1\./,
  );
  assert.equal(project.read(), backlog, "the destination was written");
});
