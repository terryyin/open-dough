import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { heldFixture } from "./blocked-execution-test-fixtures.mjs";

// Keep CI coordinates and its executable recovery command together. The cases
// still control the observer result and independently assert retained context.
export function heldCiFixture(t, { directoryName, completionBoundary }) {
  return heldFixture(t, (builder, { root, workspace, revision }) =>
    builder.withCiObservation({
      directory: join(root, directoryName),
      owner: "ci-coordinator",
      repo: "owner/project",
      targetRef: "refs/heads/main",
      acceptedSha: revision,
      receiptOutstanding: true,
      completionBoundary,
      recoveryCommand: [
        process.execPath,
        fileURLToPath(
          new URL("./execution-completion-recovery.mjs", import.meta.url),
        ),
        "complete",
        "--workspace",
        workspace,
        "--accepted-sha",
        revision,
        "--target-ref",
        "refs/heads/main",
        "--repo",
        "owner/project",
        "--host",
        "claude",
        "--session-json",
        JSON.stringify({ session_id: "ci-coordinator" }),
      ],
    }),
  );
}

export function assertRetained(h, record) {
  assert.deepEqual(record.input.execution, h.input.execution);
  assert.equal(record.input.execution.owner, "consumer-agent");
  assert.equal(record.input.execution.acceptedProof[0].result, "passed");
  assert.equal(
    record.input.execution.acceptedProof[0].revision,
    h.input.execution.revision,
  );
  assert.deepEqual(record.input.execution.outstandingProof, [
    "consumer integration and applicable CI receipt",
  ]);
  assert.equal(h.partial(), "accepted partial work\n");
  assert.equal(record.completionReceipt, undefined);
}

// Control the product's observation interval and Date.now without waiting for
// wall-clock time. Filesystem events release the actual worker's next check.
export function heldClock(h, initial = 1000) {
  const clock = join(h.root, "attention-clock.json");
  const preload = join(h.root, "attention-clock.mjs");
  writeFileSync(clock, String(initial));
  writeFileSync(
    preload,
    `import fs from 'node:fs';
const callbacks=new Set();
Date.now=()=>Number(fs.readFileSync(${JSON.stringify(clock)},'utf8'));
globalThis.setInterval=(fn)=>{callbacks.add(fn);return fn;};
globalThis.clearInterval=(fn)=>callbacks.delete(fn);
fs.watch(${JSON.stringify(h.root)},(...[,name])=>{
 if(name==='attention-clock.json'||name==null) for(const callback of callbacks) callback();
}).unref();
`,
  );
  const { commandEnvironment } = h;
  commandEnvironment.NODE_OPTIONS =
    `${process.env.NODE_OPTIONS ?? ""} --import=${pathToFileURL(preload).href}`.trim();
  return (at) => writeFileSync(clock, String(at));
}
