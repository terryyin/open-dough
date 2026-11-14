import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { execute } from "./blocked-execution-store.mjs";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";
import { heldCiFixture } from "./blocked-execution-attention-test-fixtures.mjs";

test("an ended native route retains actionable state without promising an undeliverable alert", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.native.failConnection();
  const lost = await h.until(
    (state) => state.phase === "attention" && state.worker.ended,
  );
  assert.match(lost.attention.reason, /Native delivery observation ended/);
  assert.equal(lost.attentionRoute.availability, "unavailable");
  assert.match(lost.attentionRoute.limitation, /No spontaneous alert/);
  assert.equal(lost.attention.delivery, "unavailable");
  assert.equal(lost.attention.owner, "consumer-agent");
  assert.deepEqual(lost.input.execution, h.input.execution);
  assert.deepEqual(lost.attention.proof, [
    "consumer integration and applicable CI receipt",
  ]);
  assert.equal(h.submissions().length, 0);
  assert.equal((await h.cli("recover")).phase, "held");
  h.signal({ status: "ready", checked: true });
  await h.until((state) => state.phase === "accepted");
  assert.equal(h.submissions().length, 1);
  h.complete();
  await h.until((state) => state.worker.ended);
});

test("a lost filesystem observation route reaches the owner through its still-live native route", async (t) => {
  const h = await heldFixture(t);
  const preload = join(h.root, "signal-loss.mjs");
  // This substitutes the filesystem's error event, without changing the real
  // CLI, retained record, native protocol or signal content under observation.
  writeFileSync(
    preload,
    `import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
const originalWatch=fs.watch;
fs.watch=(path,...args)=>{
 const watcher=originalWatch(path,...args);
 if(path===${JSON.stringify(dirname(h.input.condition.signalFile))})
  originalWatch(${JSON.stringify(h.root)},(...[,name])=>{
   if(name==='lose-signal') watcher.emit('error',new Error('fixture signal delivery ended'));
  }).unref();
 return watcher;
};
syncBuiltinESMExports();\n`,
  );
  h.commandEnvironment.NODE_OPTIONS =
    `${process.env.NODE_OPTIONS ?? ""} --import=${pathToFileURL(preload).href}`.trim();
  await h.start();
  writeFileSync(join(h.root, "lose-signal"), "closed");
  const noticed = await h.until((state) => state.phase === "accepted");
  assert.match(
    noticed.attention.reason,
    /signal observation was lost.*fixture signal delivery ended/,
  );
  assert.equal(noticed.attention.delivery, "accepted");
  assert.deepEqual(noticed.input.execution, h.input.execution);
  assert.equal(h.submissions().length, 1);
  assert.equal(h.partial(), "accepted partial work\n");
  h.complete();
  await h.until(
    (state) => state.phase === "attention-delivered" && state.worker.ended,
  );
});

test("unavailable CI observation is reported without inferring CI or supplier success", async (t) => {
  const h = await heldCiFixture(t, {
    directoryName: "unavailable-owned-observer",
    completionBoundary: "accepted revision completion",
  });
  const receipt = await h.start();
  assert.ok(receipt.attention);
  const noticed = await h.until((state) => state.phase === "accepted");
  assert.match(
    noticed.attention.reason,
    /CI observation is unavailable.*no CI completion receipt/,
  );
  assert.equal(noticed.attention.ci.owner, "ci-coordinator");
  assert.deepEqual(noticed.input.execution, h.input.execution);
  assert.equal(noticed.completionReceipt, undefined);
  assert.equal(h.submissions().length, 1);
  h.complete();
  await h.until((state) => state.worker.ended);
});

test("native observation lost after acceptance names history reconciliation, without a replacement writer", async (t) => {
  const h = await heldFixture(t);
  await h.start();
  h.signal({ status: "ready", checked: true });
  await h.until((state) => state.phase === "accepted");
  h.native.failConnection();
  const lost = await h.until(
    (state) => state.phase === "attention" && state.worker.ended,
  );
  assert.equal(lost.attention.recoveryCommand[2], "reconcile");
  assert.deepEqual(lost.input.execution, h.input.execution);
  h.native.history.at(-1).status = "completed";
  const [command, ...args] = lost.attention.recoveryCommand;
  const reconciled = JSON.parse((await execute(command, args)).stdout);
  assert.equal(reconciled.phase, "continued");
  const repeated = await h.cli("recover");
  assert.equal(repeated.phase, "continued");
  assert.equal(repeated.generation, reconciled.generation);
  assert.equal((await h.cli("recover")).generation, reconciled.generation);
  assert.equal(h.submissions().length, 1);
  assert.deepEqual(reconciled.input.execution, h.input.execution);
});
