import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";

for (const eventDelivery of ["missing", "unnamed"]) {
  test(`a ${eventDelivery} filesystem event still reconciles the held condition without model polling`, async (t) => {
    const h = await heldFixture(t);
    const clock = join(h.root, "clock.json");
    const preload = join(h.root, "observation-preload.mjs");
    writeFileSync(clock, "0");
    // This is a host observation substitute and controlled clock. The product
    // still enrolls through its actual CLI and reads its actual retained files.
    writeFileSync(
      preload,
      `import fs from 'node:fs';
import {syncBuiltinESMExports} from 'node:module';
const originalWatch=fs.watch;
const callbacks=new Set();
globalThis.setInterval=(fn)=>{callbacks.add(fn);return fn;};
globalThis.clearInterval=(fn)=>{callbacks.delete(fn);};
originalWatch(${JSON.stringify(h.root)},(_,name)=>{
 if(name==='clock.json'||name==null)for(const callback of callbacks)callback();
}).unref();
fs.watch=(path,listener)=>path===${JSON.stringify(dirname(h.input.condition.signalFile))}
 ?originalWatch(path,(event)=>{${eventDelivery === "unnamed" ? "listener(event,undefined);" : ""}})
 :originalWatch(path,listener);
syncBuiltinESMExports();\n`,
    );
    h.commandEnvironment.NODE_OPTIONS =
      `${process.env.NODE_OPTIONS ?? ""} --import=${pathToFileURL(preload).href}`.trim();
    await h.start();
    assert.equal(h.submissions().length, 0);
    const checked = h.signal({ status: "ready", checked: true });
    if (eventDelivery === "missing") writeFileSync(clock, "1");
    const accepted = await h.until((state) => state.phase === "accepted");
    assert.equal(accepted.pending.observation, checked);
    assert.equal(
      accepted.lastObservationSource,
      eventDelivery === "missing" ? "reconciliation" : "file-event",
    );
    assert.equal(h.submissions().length, 1);
    const replay = h.signal({
      status: "ready",
      checked: true,
      notice: "same checked outcome",
    });
    if (eventDelivery === "missing") writeFileSync(clock, "2");
    await h.until((state) => state.lastSignal === replay);
    assert.equal(h.submissions().length, 1);
    h.complete();
    await h.until((state) => state.worker.ended);
  });
}
