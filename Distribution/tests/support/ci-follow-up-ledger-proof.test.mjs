import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { followUpKey } from "../../../dashboard/server/ciFollowUpStore.ts";
import { repeatLedgerFacts } from "./ciFollowUpLedgerFacts.mjs";
import {
  holdLedgerBytes,
  repeatMachine,
  ledgerAction,
} from "./ciFollowUpMachineTest.mjs";

test("an invalid original summary preserves the request and spent allowance through a ledger update", async (t) => {
  const machine = repeatMachine(t);
  const facts = repeatLedgerFacts();
  const other = repeatLedgerFacts({ revision: "d".repeat(40) });
  await ledgerAction(machine.home, { ...facts, action: "register" });
  await ledgerAction(machine.home, { ...facts, action: "spend" });
  await ledgerAction(machine.home, { ...other, action: "register" });
  const key = followUpKey(facts.project, facts.landing);
  const otherKey = followUpKey(other.project, other.landing);
  const wire = JSON.parse(readFileSync(machine.file, "utf8"));
  wire.landings[key].request.original.proof = { kind: "summary" };
  holdLedgerBytes(machine, JSON.stringify(wire));

  const before = (await ledgerAction(machine.home, { action: "read" })).answer;
  assert.equal(before.kind, "document");
  const { proof, ...original } = before.document.landings[key].request.original;
  assert.deepEqual(original, facts.request.original);
  assert.equal(proof.kind, "unavailable");
  assert.equal(proof.reason, "invalid");
  assert.match(proof.detail, /summary is not a JSON object/);

  const updated = await ledgerAction(machine.home, {
    ...facts,
    action: "update",
  });
  assert.equal(updated.ok, true);
  const after = (await ledgerAction(machine.home, { action: "read" })).answer;
  const row = after.document.landings[key];
  assert.deepEqual(row.receipts, [facts.landing.receipt]);
  assert.deepEqual(row.request.original, { ...original, proof });
  assert.equal(row.request.outcome.explanation, "observer updated");
  assert.deepEqual(after.document.landings[otherKey], wire.landings[otherKey]);
  const repeat = await ledgerAction(machine.home, {
    ...facts,
    action: "spend",
  });
  assert.equal(repeat.answer, false);
});
