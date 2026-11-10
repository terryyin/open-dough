import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, writeFileSync } from "node:fs";
import { hostname } from "node:os";
import { repeatLedgerFacts } from "./ciFollowUpLedgerFacts.mjs";
import { makeMe } from "./makeMe.mjs";
import {
  repeatMachine,
  ledgerAction,
  ledgerProcess,
} from "./ciFollowUpMachineTest.mjs";

const inputs = repeatLedgerFacts;
const setting = (enabled, prior = []) => ({
  action: "setting",
  project: "project",
  enabled,
  prior,
});

test("default off, pre-enable receipts and disable/re-enable never renew eligibility", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, { ...facts, action: "register" });
  await ledgerAction(machine.home, setting(true, [facts.landing]));
  assert.equal(
    (await ledgerAction(machine.home, { ...facts, action: "spend" })).answer,
    false,
  );
  const read = await ledgerAction(machine.home, { action: "read" });
  assert.equal(read.answer.document.projects.project.authority, hostname());
  // An alias prepared after enable still belongs to the old landing.
  const alias = {
    ...facts,
    landing: {
      ...facts.landing,
      receipt: "00000000-0000-4000-8000-000000000001",
    },
  };
  await ledgerAction(machine.home, { ...alias, action: "register" });
  assert.equal(
    (await ledgerAction(machine.home, { ...alias, action: "spend" })).answer,
    false,
  );
});

test("two independent processes serialize spend; restart, duplicate aliases and workflow changes share one cap", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  await ledgerAction(machine.home, { ...facts, action: "register" });
  const answers = await Promise.all(
    [1, 2].map(() => ledgerAction(machine.home, { ...facts, action: "spend" })),
  );
  assert.deepEqual(answers.map((answer) => answer.answer).sort(), [
    false,
    true,
  ]);
  await ledgerAction(machine.home, setting(false));
  await ledgerAction(machine.home, setting(true));
  const alias = {
    ...facts,
    landing: {
      ...facts.landing,
      receipt: "00000000-0000-4000-8000-000000000002",
    },
    request: makeMe.aCiRepeatRequest
      .with({ ...facts.request, workflow: "changed.yml" })
      .please(),
  };
  await ledgerAction(machine.home, { ...alias, action: "register" });
  assert.equal(
    (await ledgerAction(machine.home, { ...alias, action: "spend" })).answer,
    false,
  );
  const read = await ledgerAction(machine.home, { action: "read" });
  assert.equal(
    Object.values(read.answer.document.landings)[0].request.workflow,
    "ci.yml",
  );
});

test("interruption after durable spend and before submission never resends", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  await ledgerAction(machine.home, { ...facts, action: "register" });
  const interrupted = ledgerProcess(machine.home, {
    ...facts,
    action: "crash-before-send",
  });
  assert.equal((await interrupted.message).answer, true);
  assert.equal(
    Object.values(JSON.parse(readFileSync(machine.file, "utf8")).landings)[0]
      .request.submission.kind,
    "intent",
  );
  interrupted.child.kill("SIGKILL");
  assert.equal((await interrupted.terminal).signal, "SIGKILL");
  assert.equal(
    (await ledgerAction(machine.home, { ...facts, action: "spend" })).answer,
    false,
  );
});

test("disable between candidate read and atomic spend stops admission; another designated machine cannot spend", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  await ledgerAction(machine.home, { ...facts, action: "register" });
  await ledgerAction(machine.home, { action: "read" });
  await ledgerAction(machine.home, setting(false));
  assert.equal(
    (await ledgerAction(machine.home, { ...facts, action: "spend" })).answer,
    false,
  );
  await ledgerAction(machine.home, setting(true));
  assert.equal(
    (await ledgerAction(machine.home, { ...facts, action: "spend" })).answer,
    false,
  );
  const fresh = {
    ...facts,
    landing: makeMe.aLaunchLanding
      .comparing({ base: "a".repeat(40), revision: "c".repeat(40) })
      .please(),
  };
  await ledgerAction(machine.home, { ...fresh, action: "register" });
  const raw = JSON.parse(readFileSync(machine.file, "utf8"));
  raw.projects.project = {
    enabled: true,
    authority: "other-production-machine",
  };
  writeFileSync(machine.file, JSON.stringify(raw));
  assert.equal(
    (await ledgerAction(machine.home, { ...fresh, action: "spend" })).answer,
    false,
  );
});

test("unreadable allowance/settings bytes survive observer and setting updates plus restart without reset", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  await ledgerAction(machine.home, { ...facts, action: "register" });
  await ledgerAction(machine.home, { ...facts, action: "spend" });
  const corrupt = '{"spent":';
  writeFileSync(machine.file, corrupt);
  for (const action of [
    { ...facts, action: "update" },
    setting(false),
    setting(true),
    { ...facts, action: "spend" },
  ]) {
    assert.equal((await ledgerAction(machine.home, action)).ok, false);
    assert.equal(readFileSync(machine.file, "utf8"), corrupt);
  }
  assert.equal(
    (await ledgerAction(machine.home, { action: "read" })).answer.kind,
    "unreadable",
  );
});

test("history eviction and faster workflow representation restore the original once without another baseline sample", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  await ledgerAction(machine.home, { ...facts, action: "register" });
  await ledgerAction(machine.home, { ...facts, action: "spend" });
  const rebuilt = makeMe.aLandedCiHistory
    .recording(facts.landing, "run/72/2", {
      ...facts.request.original,
      runId: 72,
      runAttempt: 2,
      completedAt: "2026-11-10T00:01:40Z",
    })
    .please();
  const answer = await ledgerAction(machine.home, {
    ...facts,
    action: "samples",
    history: rebuilt,
  });
  assert.equal(
    answer.answer.landings[facts.landing.receipt].observed.build,
    "run/71/1",
  );
  assert.deepEqual(answer.answer.builds["run/71/1"], facts.request.original);
  assert.equal(
    Object.values(answer.answer.landings).filter(
      (landing) => landing.observed.build === "run/72/2",
    ).length,
    0,
  );
});

test("unreadable follow-up evidence blocks a rebuilt later attempt from replacing an original sample", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  const repeat = {
    ...facts.request.original,
    runAttempt: 2,
    completedAt: "2026-11-10T00:01:40Z",
  };
  const resolution = makeMe.aLandedCiResolution.measuring(repeat).please();
  writeFileSync(machine.file, "{unreadable");
  const answer = await ledgerAction(machine.home, {
    ...facts,
    action: "resolution",
    resolution,
    order: [facts.landing.revision],
  });
  assert.equal(
    answer.answer.landings[facts.landing.receipt].observed.kind,
    "gap",
  );
  assert.match(
    answer.answer.landings[facts.landing.receipt].observed.explanation,
    /original attempt selection is unavailable/,
  );
  assert.equal(Object.keys(answer.answer.builds).length, 0);
});

test("an already retained exact original at attempt2 remains readable when the follow-up ledger is unreadable", async (t) => {
  const machine = repeatMachine(t),
    facts = inputs();
  await ledgerAction(machine.home, setting(true));
  const original = { ...facts.request.original, runAttempt: 2 };
  const resolution = makeMe.aLandedCiResolution.measuring(original).please();
  await ledgerAction(machine.home, {
    ...facts,
    action: "resolution",
    resolution,
    order: [facts.landing.revision],
  });
  writeFileSync(machine.file, "{unreadable");
  const retained = await ledgerAction(machine.home, {
    ...facts,
    action: "history",
  });
  assert.equal(
    retained.answer.landings[facts.landing.receipt].observed.build,
    "run/71/2",
  );
  assert.equal(
    retained.answer.builds["run/71/2"].completedAt,
    original.completedAt,
  );
});
