import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { renderPublishedBacklog } from "./published-backlog.mjs";
import { materializeRepository } from "./repository-fixture.mjs";
import {
  renderPublishedRevisions,
  writeRevisionFiles,
} from "./repository-revision-files.mjs";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { parseDoneCatalog } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { readStoryState } from "../../src/skills/dough-product-backlog/scripts/product-backlog-story-state.mjs";

test("each revision a description renders without Git holds the same files and bytes as its materialized commit", async (t) => {
  const story = makeMe.aBacklogEntry
    .with({ identity: "SEED-A#a", href: "seeds/A.md#a", title: "Story A" })
    .please();
  const later = makeMe.aBacklogEntry
    .with({ identity: "SEED-B#b", href: "seeds/B.md#b", title: "Story B" })
    .please();
  const seed = (/** @type {typeof story} */ { identity, title }, anchor) =>
    `# Seed\n\n<a id="${anchor}"></a>\n\n### ${title}\n\n**Identity:** ${identity}\n\nDo it.\n`;
  const first = makeMe.aDoneRecord
    .completed({ identity: "SEED-D#first", title: "First done" })
    .please();
  const second = makeMe.aDoneRecord
    .completed({
      identity: "SEED-D#second",
      title: "Second done",
      completedAt: "2026-02-01T00:00:00.000Z",
    })
    .please();
  const profile = makeMe.anAgentProfile
    .executing({ name: "Yui", identity: story.identity })
    .please();
  const backlogB = {
    taken: [
      { ...story, plan: { label: "plan", target: "slice-plans/A/PLAN.md" } },
    ],
    queued: [later],
  };
  const description = makeMe.aRepository
    .withRevision("A", {
      backlog: { queued: [story] },
      files: {
        ".planning/seeds/A.md": seed(story, "a"),
        ".planning/slice-plans/A/PLAN.md": "# Story A plan\n\nDo it.\n",
        "trunk.txt": "base\n",
      },
      storyStates: [
        {
          identity: story.identity,
          href: story.href,
          refinement: "refined",
          approach: "planned",
          plan: "../slice-plans/A/PLAN.md",
          assessment: "ready",
        },
      ],
      doneRecords: [first, second],
    })
    .withRevision("B", {
      backlog: backlogB,
      files: { ".planning/seeds/B.md": seed(later, "b") },
      agentProfiles: [profile],
      remove: ["trunk.txt", ".planning/done/SEED-D_first.json"],
    })
    .please();
  const { origin, revisions, cleanup } =
    await materializeRepository(description);
  t.after(cleanup);

  const rendered = renderPublishedRevisions(description);
  for (const name of /** @type {const} */ (["A", "B"])) {
    const sha = revisions[name];
    const committed = execFileSync(
      "git",
      ["ls-tree", "-r", "--name-only", sha],
      { cwd: origin, encoding: "utf8" },
    )
      .trim()
      .split("\n")
      .sort();
    assert.deepEqual(Object.keys(rendered[name]).sort(), committed, name);
    for (const path of committed)
      assert.equal(
        Buffer.compare(
          Buffer.from(rendered[name][path]),
          execFileSync("git", ["show", `${sha}:${path}`], { cwd: origin }),
        ),
        0,
        `${name}: ${path}`,
      );
  }

  // Each fact is written by its product encoder, and B keeps A's files.
  const { A, B } = rendered;
  const text = (/** @type {string | Buffer | undefined} */ content) =>
    String(content);
  assert.equal(
    text(B[".planning/PRODUCT-BACKLOG.md"]),
    renderPublishedBacklog(backlogB),
  );
  const state = readStoryState(text(B[".planning/seeds/A.md"]), story.href, {
    planSource: text(B[".planning/slice-plans/A/PLAN.md"]),
  });
  assert.deepEqual(
    [state.status, state.approach?.kind, state.assessment.status],
    ["recorded", "planned", "ready"],
  );
  assert.equal(
    text(B[`.planning/${agentIdentity("Yui").path}`]),
    renderAgentProfile(profile),
  );
  assert.equal(
    text(A[".planning/done/SEED-D_first.json"]),
    renderDoneRecord(first),
  );
  const catalogued = (/** @type {typeof A} */ files) => {
    const read = parseDoneCatalog(text(files[".planning/done/.catalog.json"]));
    return read.ok ? read.catalog.records.map(({ identity }) => identity) : [];
  };
  assert.deepEqual(catalogued(A), ["SEED-D#second", "SEED-D#first"]);
  assert.deepEqual(catalogued(B), ["SEED-D#second"]);
  assert.equal(B["trunk.txt"], undefined);
});

test("a revision written into a checkout that does not exist yet starts from no files", (t) => {
  const story = makeMe.aBacklogEntry
    .with({ identity: "SEED-A#a", href: "seeds/A.md#a", title: "Story A" })
    .please();
  const description = makeMe.aRepository
    .withRevision("A", {
      backlog: { queued: [story] },
      files: { "trunk.txt": "base\n" },
    })
    .please();
  const parent = mkdtempSync(join(tmpdir(), "revision-files-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const checkout = join(parent, "git", "project");

  writeRevisionFiles(checkout, description.revisions[0]);

  const { A } = renderPublishedRevisions(description);
  for (const [path, content] of Object.entries(A))
    assert.equal(
      Buffer.compare(readFileSync(join(checkout, path)), Buffer.from(content)),
      0,
      path,
    );
});
