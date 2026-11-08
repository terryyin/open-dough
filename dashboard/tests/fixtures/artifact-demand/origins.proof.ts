import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../support/pageTest.ts";
import { requestRunArtifact } from "../../support/runArtifacts.ts";
import { startOrigin } from "../../support/startOrigin.ts";
import { fixtureFiles } from "../../support/startOriginObservation.ts";
import { startOriginArtifactKey } from "../../support/startOriginPreparation.ts";

test("a completed Claude layout remains usable after the Codex pack fails", async () => {
  const first = await startOrigin();
  try {
    const key = startOriginArtifactKey("claude");
    const prepared = await requestRunArtifact(key);
    assert(prepared);
    const before = fixtureFiles(prepared);
    const baseline = await first.originGit("rev-parse", "main");
    await expect(startOrigin(undefined, { host: "codex" })).rejects.toThrow(
      /Could not prepare dashboard artifact start-origin-codex:.*already exists and is not an empty directory/s,
    );
    const brokenRecord = process.env["DOUGH_ARTIFACT_PROOF_BROKEN_ORIGIN"];
    assert(brokenRecord);
    const broken = path.dirname(readFileSync(brokenRecord, "utf8").trim());
    expect(existsSync(broken)).toBe(false);
    expect(await requestRunArtifact(key)).toBe(prepared);
    expect(fixtureFiles(prepared)).toEqual(before);
    const later = await startOrigin();
    try {
      expect(await later.originGit("rev-parse", "main")).toBe(baseline);
      await later.originGit("fsck", "--full");
    } finally {
      later.cleanup();
    }
  } finally {
    first.cleanup();
  }
});
