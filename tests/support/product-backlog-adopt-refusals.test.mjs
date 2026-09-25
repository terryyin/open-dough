// Establishes what identity adoption refuses: a conflicting mapping, a
// missing canonical home, genuinely ambiguous legacy work, and a collision
// with a run that allocated first. Every case inspects the real project's
// files afterwards, not just the exit code.
import assert from "node:assert/strict";
import { mkdirSync, rmSync } from "node:fs";
import { test } from "node:test";
import {
  adopt,
  headings,
  identities,
  legacyBacklog,
  legacyProject,
  seedEight,
  seedOne,
  takenLink,
} from "./product-backlog-adoption-fixture.mjs";
import { run } from "./product-backlog-fixture.mjs";
import { runBlockedOnLock } from "./product-backlog-lock-fixture.mjs";

const oldCopy = "seeds/SEED-008-old-copy.md";

const cases = [
  {
    why: "a canonical home already records a different identity",
    replace: (source) =>
      source.replace(
        headings.taken,
        `${headings.taken}\n\n**Identity:** SEED-999#somewhere-else`,
      ),
    home: seedEight,
    expect: /already records identity "SEED-999#somewhere-else"/,
  },
  {
    why: "the canonical home is missing",
    backlog: legacyBacklog.replace(
      `(${seedEight}#same-machine-merge-queue)`,
      "(seeds/SEED-099-not-here.md#same-machine-merge-queue)",
    ),
    expect: /canonical home not found: seeds\/SEED-099-not-here\.md/,
  },
  {
    why: "the linked story anchor is not in the seed",
    backlog: legacyBacklog.replace(
      "#default-skip-process-retrospective)",
      "#a-story-that-moved)",
    ),
    expect: /has no story anchored at "a-story-that-moved"/,
  },
  {
    why: "the Taken entry's active plan is missing",
    backlog: legacyBacklog.replace(
      `([plan](${takenLink}))`,
      "([plan](quick/999-gone/PLAN.md))",
    ),
    expect: /canonical home not found: quick\/999-gone\/PLAN\.md/,
  },
  {
    why: "the entry's token disagrees with the home's own ID",
    backlog: legacyBacklog.replace(
      "#default-skip-process-retrospective) — SEED-001",
      "#default-skip-process-retrospective) — SEED-002",
    ),
    expect:
      /reads as identity "SEED-002#default-skip-process-retrospective" but seeds\/SEED-001\S* names "SEED-001#/,
  },
  {
    why: "two entries would be combined under one identity",
    backlog: legacyBacklog.replace(
      "- [Complete hook",
      `- [Queue trunk integration for agents on the same machine (old copy)](${oldCopy}#same-machine-merge-queue)\n- [Complete hook`,
    ),
    extra: {
      [oldCopy]: `---\nid: SEED-008\n---\n\n# SEED-008, an older copy\n\n## Stories\n\n<a id="same-machine-merge-queue"></a>\n\n${headings.queue}\n\n**Status:** Captured.\n`,
    },
    expect:
      /identity "SEED-008#same-machine-merge-queue" is already being adopted by line \d+/,
  },
  {
    why: "the seed carries no ID of its own",
    extra: {
      [seedOne]: `# SEED-001: Install and update Open Dough in a project\n\n## Stories\n\n<a id="default-skip-process-retrospective"></a>\n\n${headings.retrospective}\n\n**Status:** Captured.\n`,
    },
    expect: /carries no "id:" of its own.*without a human decision/s,
  },
];

test("adopt identity: conflicts, missing homes, and ambiguous work record nothing", async (t) => {
  for (const document of cases) {
    const project = legacyProject(t, {
      backlog: document.backlog,
      extra: document.extra,
    });
    if (document.replace) {
      project.write(
        document.home,
        document.replace(project.readHome(document.home)),
      );
    }
    const before = project.snapshot();

    const result = await run(project, adopt);
    assert.equal(result.code, 1, `${document.why}: expected a refusal`);
    assert.match(result.stderr, document.expect, document.why);
    assert.match(
      result.stderr,
      /Adoption was refused and no identity was recorded/,
      document.why,
    );
    assert.match(
      result.stderr,
      /A human decides how each of these is resolved/,
      document.why,
    );
    assert.match(result.stderr, /The backlog was not changed\./, document.why);
    assert.deepEqual(project.snapshot(), before, `${document.why}: changed`);
  }
});

test("adopt identity: a concurrent allocation collision is reported, not combined", async (t) => {
  const project = legacyProject(t);
  mkdirSync(`${project.file}.lock`);

  // This run waits for the lock, so it reads the canonical homes only after
  // the other writer has already allocated an identity of its own.
  const waiting = runBlockedOnLock(project, adopt, {
    DOUGH_BACKLOG_LOCK_TIMEOUT_MS: "20000",
  });
  await waiting.blocked;
  project.write(
    seedEight,
    project
      .readHome(seedEight)
      .replace(
        headings.taken,
        `${headings.taken}\n\n**Identity:** SEED-008#allocated-by-another-run`,
      ),
  );
  const competitor = project.snapshot();
  rmSync(`${project.file}.lock`, { recursive: true });

  const result = await waiting.completed;
  assert.equal(result.code, 1, result.stdout);
  assert.match(
    result.stderr,
    /already records identity "SEED-008#allocated-by-another-run"/,
  );
  assert.match(result.stderr, new RegExp(`names "${identities.taken}"`));
  assert.deepEqual(project.snapshot(), competitor);
});
