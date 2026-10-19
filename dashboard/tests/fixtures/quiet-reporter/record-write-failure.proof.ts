import { expect, test } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { DashboardProofRecord } from "../../support/proofRecordTypes.ts";

test("passes while its next snapshot cannot be written", async () => {
  const file = process.env["PROOF_WRITE_FAILURE_PATH"];
  if (!file) throw new Error("missing controlled recording-failure path");
  const snapshot = () =>
    JSON.parse(readFileSync(file, "utf8")) as DashboardProofRecord;
  // The worker can enter this body before the runner finishes its begin
  // snapshot. Wait for that event, so only the following end snapshot meets
  // the obstruction and the fixture never collides with a write in progress.
  await expect.poll(() => snapshot().tests[0]?.attempts.length).toBe(1);
  const record = snapshot();
  // A directory forces a real exclusive-open error at the next reporter
  // event. The begin snapshot's final nonrecursive temporary-file cleanup
  // cannot remove it even if that cleanup is still finishing after rename.
  const obstruction = `${file}.${record.run.id}.tmp`;
  mkdirSync(obstruction);
  writeFileSync(
    path.join(obstruction, "fixture-marker"),
    "reserved by the fixture",
  );
});
