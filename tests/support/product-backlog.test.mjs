// Runs the real backlog CLI against a scratch project's backlog file.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  added,
  addArguments,
  addedLine,
  backlog,
  queued,
  run,
  scratchProject,
  withEntry,
} from "./product-backlog-fixture.mjs";

test("add places one identified entry and preserves every other byte", async (t) => {
  const placements = [
    { placement: ["--position", "first"], index: 0 },
    {
      placement: ["--before", "SEED-001#default-skip-process-retrospective"],
      index: 1,
    },
    {
      placement: ["--after", "SEED-001#default-skip-process-retrospective"],
      index: 2,
    },
    { placement: ["--position", "last"], index: 3 },
  ];

  for (const { placement, index } of placements) {
    const project = scratchProject(t);
    const result = await run(project, addArguments(added, placement));
    assert.equal(result.code, 0, `${placement.join(" ")}: ${result.stderr}`);
    assert.equal(project.read(), withEntry(index), placement.join(" "));
  }
});

test("add fills an empty queue and honors an explicit file path", async (t) => {
  const empty = scratchProject(
    t,
    backlog.replace(`${queued.join("\n")}\n`, ""),
  );
  const result = await run(empty, addArguments(added, ["--position", "last"]));
  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    empty.read(),
    backlog.replace(`${queued.join("\n")}\n`, `${addedLine}\n`),
  );

  const elsewhere = scratchProject(t);
  const moved = join(elsewhere.directory, "docs", "BACKLOG.md");
  mkdirSync(dirname(moved), { recursive: true });
  writeFileSync(moved, backlog, "utf8");
  const relocated = await run(elsewhere, [
    ...addArguments(added, ["--position", "first"]),
    "--file",
    "docs/BACKLOG.md",
  ]);
  assert.equal(relocated.code, 0, relocated.stderr);
  assert.equal(readFileSync(moved, "utf8"), withEntry(0));
  assert.equal(elsewhere.read(), backlog);
});

test("add refuses missing identity, collisions, and ambiguous homes unchanged", async (t) => {
  const project = scratchProject(t);
  const first = ["--position", "first"];
  const refusals = [
    {
      why: "missing identity",
      arguments_: [
        "add",
        "--title",
        added.title,
        "--link",
        added.link,
        "--after",
        "SEED-001#default-skip-process-retrospective",
      ],
      expect:
        /Missing identity: supply --identity\..*identity-adoption operation/s,
    },
    {
      why: "identity already queued",
      arguments_: addArguments(
        {
          identity: "SEED-004#proudly-found-elsewhere-design",
          title:
            "Strengthen architectural review after using the lightweight guidance",
          link: "seeds/SEED-004-extract-and-adopt-project-guidance.md#proudly-found-elsewhere-design",
        },
        first,
      ),
      expect: /already listed in "## Backlog list"/,
    },
    {
      why: "identity already taken",
      arguments_: addArguments(
        {
          identity: "SEED-008#script-product-backlog-list-updates",
          title:
            "Update the product backlog without hand-editing the shared list",
          link: "seeds/SEED-008-worktree-branch-trunk-sync.md#script-product-backlog-list-updates",
        },
        first,
      ),
      expect: /already listed in "## Taken"/,
    },
    {
      why: "identity anchor disagrees with the canonical home",
      arguments_: addArguments(
        { ...added, identity: "SEED-002#a-different-anchor" },
        first,
      ),
      expect: /Ambiguous canonical home: identity .* names anchor/,
    },
    {
      why: "canonical home already listed under another identity",
      arguments_: addArguments(
        {
          identity: "SEED-004-extract#proudly-found-elsewhere-design",
          title: "Strengthen architectural review",
          link: "seeds/SEED-004-extract-and-adopt-project-guidance.md#proudly-found-elsewhere-design",
        },
        first,
      ),
      expect: /the canonical home .* is already listed in "## Backlog list"/,
    },
    {
      why: "identity is not named by the canonical home",
      arguments_: addArguments(
        { ...added, identity: "SEED-999#publish-the-release-notes" },
        first,
      ),
      expect: /Ambiguous canonical home: identity .* does not/,
    },
    {
      why: "unknown relative anchor",
      arguments_: addArguments(added, ["--after", "SEED-777#nowhere"]),
      expect: /Anchor identity "SEED-777#nowhere" is not in "## Backlog list"/,
    },
    {
      why: "anchor is a taken entry",
      arguments_: addArguments(added, [
        "--after",
        "SEED-008#script-product-backlog-list-updates",
      ]),
      expect: /Anchor identity .* is in "## Taken"/,
    },
    {
      why: "no relative position",
      arguments_: addArguments(added, []),
      expect: /Supply exactly one of --after, --before, or --position/,
    },
    {
      why: "two relative positions",
      arguments_: addArguments(added, [
        ...first,
        "--after",
        "SEED-001#default-skip-process-retrospective",
      ]),
      expect: /Supply exactly one of --after, --before, or --position/,
    },
  ];

  for (const refusal of refusals) {
    const result = await run(project, refusal.arguments_);
    assert.equal(result.code, 1, `${refusal.why}: expected a refusal`);
    assert.match(result.stderr, refusal.expect, refusal.why);
    assert.match(result.stderr, /The backlog was not changed\./, refusal.why);
    assert.equal(project.read(), backlog, `${refusal.why}: file changed`);
  }
});

test("add refuses a repeated request without listing the work twice", async (t) => {
  const project = scratchProject(t);
  const first = await run(project, addArguments());
  assert.equal(first.code, 0, first.stderr);
  const applied = project.read();

  const again = await run(project, addArguments());
  assert.equal(again.code, 1);
  assert.match(again.stderr, /already listed in "## Backlog list"/);
  assert.equal(project.read(), applied);
  assert.equal(applied.split(addedLine).length - 1, 1);
});

test("add refuses a malformed or already duplicated backlog unchanged", async (t) => {
  const malformed = [
    {
      why: "two queue headings",
      source: `${backlog}\n## Backlog list\n\n- [Other](seeds/SEED-005-x.md#other) — SEED-005\n`,
      expect: /Expected exactly one "## Backlog list" section; found 2\./,
    },
    {
      why: "missing Taken section",
      source: backlog.replace(/## Taken\n\n- \[Update[^\n]*\n\n/, ""),
      expect: /Expected exactly one "## Taken" section; found 0\./,
    },
    {
      why: "prose inside the queue",
      source: `${backlog}\nUnexpected note about priority.\n`,
      expect: /Unsupported text in "## Backlog list" at line \d+/,
    },
    {
      why: "unsupported bullet shape",
      source: `${backlog}- not a linked entry\n`,
      expect: /Unsupported entry in "## Backlog list" at line \d+/,
    },
    {
      why: "the same work already listed twice",
      source: `${backlog}${queued[0]}\n`,
      expect: /already lists the same work twice: lines \d+ and \d+/,
    },
  ];

  for (const document of malformed) {
    const project = scratchProject(t, document.source);
    const result = await run(project, addArguments());
    assert.equal(result.code, 1, `${document.why}: expected a refusal`);
    assert.match(result.stderr, document.expect, document.why);
    assert.equal(project.read(), document.source, `${document.why}: changed`);
  }
});
