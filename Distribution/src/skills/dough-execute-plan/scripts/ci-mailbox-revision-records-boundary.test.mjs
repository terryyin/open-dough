import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as coverage from "./ci-mailbox-revision-coverage.mjs";

const recordsApi = [
  "effectiveRevisionState",
  "listRegisteredRevisions",
  "readRevisionCoverage",
  "registerPushedRevision",
  "revisionVerdicts",
];

test("revision records stay independent of the integrated-state rule", () => {
  const source = readFileSync(
    new URL("./ci-mailbox-revision-records.mjs", import.meta.url),
    "utf8",
  );
  const specifiers = [
    ...source.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+"([^"]+)"/gms),
  ].map(([, specifier]) => specifier);
  assert.ok(specifiers.includes("./ci-mailbox-json-file.mjs"));
  assert.deepEqual(
    specifiers.filter((specifier) => /ci-integrated-state/.test(specifier)),
    [],
  );
});

test("revision coverage leaves the records API to its owner", () => {
  assert.deepEqual(
    recordsApi.filter((name) => Object.hasOwn(coverage, name)),
    [],
  );
});
