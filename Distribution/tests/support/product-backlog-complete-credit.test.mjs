// Runs the real backlog CLI to complete work in a scratch Git project,
// observing whom the done record written beside the backlog credits: the
// developer the checkout's configuration names and the executing agent.
import { makeMe } from "./makeMe.mjs";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  arrangedBacklogFacts,
  backlog,
  run,
  scratchProject,
  takenEntry,
  takenStory,
  trunkQueue,
} from "./product-backlog-fixture.mjs";
import {
  at,
  catalogFile,
  completedAt,
  doneFiles,
  readRecord,
} from "./product-backlog-done-fixture.mjs";
import { checkoutOf } from "./product-backlog-git-fixture.mjs";

// The developer the checkout's Git configuration names, whom `complete`
// credits in the record.
const terryYin = { name: "Terry Yin", email: "terry@example.com" };

test("complete credits the execution agent even when a released preparation profile sorts first", async (t) => {
  const project = await checkoutOf(
    t,
    makeMe.aRepository
      .withCheckoutIdentity(terryYin)
      .withRevision("Take the story", {
        backlog: arrangedBacklogFacts,
        agentProfiles: [
          makeMe.anAgentProfile
            .preparing({
              name: "Ai",
              identity: takenStory,
              host: "cursor",
              model: "preparation-model",
            })
            .please(),
          makeMe.anAgentProfile
            .executing({
              name: "Akiho",
              identity: takenStory,
              host: "claude",
              model: "claude-opus-5-5",
            })
            .please(),
        ],
      })
      .please(),
  );

  const result = await run(
    project,
    ["complete", "--identity", takenStory],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), backlog.replace(`${takenEntry}\n\n`, ""));
  assert.equal(
    existsSync(join(project.directory, ".planning/agents/akiho-chan.json")),
    false,
  );
  assert.equal(
    existsSync(join(project.directory, ".planning/agents/ai-chan.json")),
    false,
  );
  const fileName = "SEED-008_script-product-backlog-list-updates.json";
  assert.deepEqual(doneFiles(project), [catalogFile, fileName]);
  assert.deepEqual(readRecord(project, fileName), {
    schemaVersion: 1,
    identity: takenStory,
    title: "Update the product backlog without hand-editing the shared list",
    completedAt,
    developer: "Terry Yin",
    agent: "Akiho-chan",
    host: "claude",
    model: "claude-opus-5-5",
  });
  assert.match(
    result.stdout,
    new RegExp(`Wrote done record done/${fileName} beside the backlog\\.`),
  );
});

test("complete on a queued entry with only a preparation profile releases it without recording execution credit", async (t) => {
  const project = await checkoutOf(
    t,
    makeMe.aRepository
      .withCheckoutIdentity(terryYin)
      .withRevision("Prepare the queued story", {
        backlog: arrangedBacklogFacts,
        agentProfiles: [
          makeMe.anAgentProfile
            .preparing({
              name: "Ai",
              identity: trunkQueue,
              host: "cursor",
              model: "preparation-model",
            })
            .please(),
        ],
      })
      .please(),
  );

  const result = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.equal(
    existsSync(join(project.directory, ".planning/agents/ai-chan.json")),
    false,
  );
  assert.deepEqual(
    readRecord(project, "SEED-008_same-machine-merge-queue.json"),
    {
      schemaVersion: 1,
      identity: trunkQueue,
      title: "Queue trunk integration for agents on the same machine",
      completedAt,
      developer: "Terry Yin",
    },
  );
});

test("complete in a workspace that names no developer records none", async (t) => {
  const project = scratchProject(t);

  const result = await run(
    project,
    ["complete", "--identity", trunkQueue],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  const record = readRecord(project, "SEED-008_same-machine-merge-queue.json");
  assert.equal(Object.hasOwn(record, "developer"), false);
  assert.equal(Object.hasOwn(record, "intentCoverage"), false);
  assert.equal(record.identity, trunkQueue);
});

test("a Taken profile recording no host or model leaves a record naming the agent only", async (t) => {
  const project = await checkoutOf(
    t,
    makeMe.aRepository
      .withCheckoutIdentity(terryYin)
      .withRevision("Take the story", {
        backlog: arrangedBacklogFacts,
        agentProfiles: [
          makeMe.anAgentProfile
            .executing({ name: "Akiho", identity: takenStory })
            .please(),
        ],
      })
      .please(),
  );

  const result = await run(
    project,
    ["complete", "--identity", takenStory],
    at(completedAt),
  );
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(
    readRecord(project, "SEED-008_script-product-backlog-list-updates.json"),
    {
      schemaVersion: 1,
      identity: takenStory,
      title: "Update the product backlog without hand-editing the shared list",
      completedAt,
      developer: "Terry Yin",
      agent: "Akiho-chan",
    },
  );
});
