// The same story section changed both on trunk and in the admission draft.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { git, lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  admitArgs,
  pushFromElsewhere,
  remoteText,
  storySection,
  withFacts,
} from "./workspace-publication-admission-fixtures.mjs";
import {
  createQueuedTrunk,
  startCliResult,
} from "./workspace-publication-fixtures.mjs";

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
