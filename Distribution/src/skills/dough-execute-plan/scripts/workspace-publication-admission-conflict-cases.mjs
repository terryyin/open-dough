// The same story section changed both on trunk and in the admission draft.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import {
  queuedReadyRepository,
  readyStoryState,
  storyB,
  storySeed,
} from "../../../../tests/support/queued-repository.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";
import { lsRemoteSha } from "./publication-test-fixtures.mjs";
import {
  admitArgs,
  pushFromElsewhere,
  remoteText,
  storySection,
} from "./workspace-publication-admission-fixtures.mjs";
import { startCliResult } from "./workspace-publication-fixtures.mjs";

test("a story edited both on trunk and in the draft stops with both versions intact", async (t) => {
  const seedPath = ".planning/seeds/B.md";
  const storyC = makeMe.aBacklogEntry
    .with({ identity: "SEED-B#c", href: "seeds/B.md#c", title: "Story C" })
    .please();
  const trunk = await materializeRepository(
    queuedReadyRepository()
      .withRevision("unlisted-c", {
        message: "story c",
        files: {
          [seedPath]: `${storySeed(storyB, "Execute B.")}\n${storySection("c", storyC.identity, storyC.title, "Deliver C.")}`,
        },
        storyStates: [
          readyStoryState(storyB),
          {
            identity: storyC.identity,
            href: storyC.href,
            ...makeMe.aStoryPreparation
              .with({ refinement: "refined", approach: "unselected" })
              .please(),
          },
        ],
      })
      .please(),
  );
  t.after(trunk.cleanup);
  const original = readFileSync(join(trunk.integration, seedPath), "utf8");
  const tip = await pushFromElsewhere(trunk, seedPath, (text) =>
    text.replace("Deliver C.", "Deliver C on trunk."),
  );
  const draft = original.replace("Deliver C.", "Deliver C locally.");
  writeFileSync(join(trunk.integration, seedPath), draft);
  const { receipt, workspace } = await startCliResult(
    trunk,
    "trunk",
    admitArgs(storyC.identity, storyC.href, storyC.title),
  );
  assert.equal(receipt.status, "source-conflict", JSON.stringify(receipt));
  assert.equal(receipt.path, seedPath);
  assert.equal(existsSync(workspace), false);
  assert.equal(await lsRemoteSha(trunk.origin, "refs/heads/main"), tip);
  assert.match(await remoteText(trunk, tip, seedPath), /Deliver C on trunk\./);
  assert.equal(readFileSync(join(trunk.integration, seedPath), "utf8"), draft);
});
