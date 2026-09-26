// Admission that must not publish, or that continues an existing claim:
// another claim, refused sources, missing authority, and a story edited both on
// trunk and in the draft. Driven through the real startup CLI against a local
// bare remote; nothing is written and every draft survives.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  createQueuedTrunk,
  identityA,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";
import {
  admitArgs,
  pushFromElsewhere,
  remoteText,
  storySection,
  withFacts,
  writeDraft,
} from "./workspace-publication-admission-fixtures.mjs";
import { startExecution } from "./execution-start.mjs";

test("the same publisher continues its admitted claim; another publisher is refused", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const identity = "SEED-N#fix";
  const link = "seeds/N.md#fix";
  writeDraft(
    trunk,
    ".planning/seeds/N.md",
    withFacts(
      `---\nid: SEED-N\n---\n\n# Seed N\n\n${storySection("fix", identity, "Fix N", "Repair N.")}`,
      link,
      identity,
      "planless",
    ),
  );
  const args = admitArgs(identity, link, "Fix N");
  const first = await startCliResult(trunk, "trunk", args);
  assert.equal(
    first.receipt.status,
    "published",
    JSON.stringify(first.receipt),
  );
  const again = await startCliResult(trunk, "trunk", args);
  assert.equal(again.receipt.status, "existing", JSON.stringify(again.receipt));
  assert.equal(again.receipt.publishedSha, first.receipt.publishedSha);
  const rival = await startCliResult(trunk, "rival", [
    ...args,
    "--mode",
    "trunk",
  ]);
  assert.equal(rival.receipt.status, "conflict", JSON.stringify(rival.receipt));
  assert.equal(rival.receipt.ownership, "other");
  assert.equal(existsSync(rival.workspace), false);
  assert.equal(
    await lsRemoteSha(trunk.origin, "refs/heads/main"),
    first.receipt.publishedSha,
  );
});

test("refused admissions write nothing and keep every draft", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seedPath = ".planning/seeds/A.md";
  const identity = "SEED-A#n";
  const link = "seeds/A.md#n";
  const section = storySection("n", identity, "Story N", "Deliver N.");
  const local = readFileSync(join(trunk.integration, seedPath), "utf8");
  const cases = [
    [
      "missing preparation",
      `${local}\n${section}`,
      link,
      "source-refused",
      /preparation facts/,
    ],
    [
      "missing goal",
      withFacts(
        `${local}\n${section.replace(/\*\*Goal:.*\n/, "Text.\n")}`,
        link,
        identity,
        "unselected",
      ),
      link,
      "source-refused",
      /Goal/,
    ],
    [
      "already queued",
      local,
      "seeds/A.md#a",
      "source-refused",
      /already queued/,
    ],
  ];
  for (const [name, draft, href, status, error] of cases) {
    writeFileSync(join(trunk.integration, seedPath), draft);
    const id = href === link ? identity : identityA;
    const { receipt, workspace } = await startCliResult(
      trunk,
      "trunk",
      admitArgs(id, href, "Story N"),
    );
    assert.equal(receipt.status, status, `${name}: ${JSON.stringify(receipt)}`);
    assert.match(receipt.error, error, name);
    assert.equal(existsSync(workspace), false, name);
    assert.equal(
      await lsRemoteSha(trunk.origin, "refs/heads/main"),
      trunk.trunkSha,
    );
    assert.equal(
      readFileSync(join(trunk.integration, seedPath), "utf8"),
      draft,
    );
  }
  // Without publication authority nothing is fetched or created.
  const refused = await startExecution({
    integration: trunk.integration,
    workspace: join(trunk.fixture, "unauthorized"),
    branch: "exec/unauthorized",
    identity,
    publisherId: "unauthorized",
    mode: "trunk",
    target: "main",
    admit: true,
    link,
    title: "Story N",
    workspaceAuthorized: true,
  });
  assert.equal(refused.status, "authority-required");
  assert.equal(existsSync(join(trunk.fixture, "unauthorized")), false);
});

test("a story edited both on trunk and in the draft stops with both versions intact", async (t) => {
  const trunk = await createQueuedTrunk();
  t.after(trunk.cleanup);
  const seedPath = ".planning/seeds/B.md";
  const identity = "SEED-B#c";
  const link = "seeds/B.md#c";
  const original = readFileSync(join(trunk.integration, seedPath), "utf8");
  const facts = (goal) =>
    withFacts(
      `${original}\n${storySection("c", identity, "Story C", goal)}`,
      link,
      identity,
      "unselected",
    );
  // The unlisted story is published, then edited on trunk and locally.
  writeFileSync(join(trunk.integration, seedPath), facts("Deliver C."));
  await git(trunk.integration, "commit", "-qam", "story c");
  await git(trunk.integration, "push", "-q", "origin", "main");
  const tip = await pushFromElsewhere(trunk, seedPath, (text) =>
    text.replace("Deliver C.", "Deliver C on trunk."),
  );
  const draft = facts("Deliver C locally.");
  writeFileSync(join(trunk.integration, seedPath), draft);
  const { receipt, workspace } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(identity, link, "Story C"),
  );
  assert.equal(receipt.status, "source-conflict", JSON.stringify(receipt));
  assert.equal(receipt.path, seedPath);
  assert.equal(existsSync(workspace), false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.match(await remoteText(trunk, tip, seedPath), /Deliver C on trunk\./);
  assert.equal(readFileSync(join(trunk.integration, seedPath), "utf8"), draft);
});
