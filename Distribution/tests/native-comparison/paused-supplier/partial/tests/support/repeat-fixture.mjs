// The repeat checks' one fixture: runs read through the supplier's
// in-process fake GitHub reader, without a process per read.
import { createFakeGhReader } from "../../src/fake-gh.mjs";

export const eligible = { eligible: true, runId: 7 };

export function runs(...list) {
  return createFakeGhReader({ runs: list }).read(["run", "list"]);
}

export function run(fields) {
  return runs({
    id: 7,
    status: "completed",
    conclusion: null,
    attempt: 1,
    ...fields,
  });
}
