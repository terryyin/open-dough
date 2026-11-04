import { expect, test } from "../support/pageTest.ts";
import { existsSync } from "node:fs";
import {
  removeSnapshotCheckouts,
  snapshotCheckout,
  startSnapshotRun,
} from "../support/proofSnapshotRun.ts";

test.afterAll(removeSnapshotCheckouts);

test("option off leaves no proof file", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "plain.spec.ts",
    `import { test } from "@playwright/test";
test("plain", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "plain.spec.ts",
    snapshot: false,
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expect(checkout.readProof()).toBeUndefined();
  expect(existsSync(checkout.proof)).toBe(false);
});

test("a describe path is recorded as the title path", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "describe.spec.ts",
    `import { test } from "@playwright/test";
test.describe("outer", () => {
  test.describe("inner", () => {
    test("case", () => {});
  });
});
test.describe(() => {
  test("anonymous parent", () => {});
});
`,
  );
  const head = checkout.head();
  const run = startSnapshotRun({
    checkout,
    spec: "describe.spec.ts",
    snapshot: true,
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const proof = checkout.readProof();
  expect(proof?.version).toBe(1);
  // Ordered by test title path: "anonymous parent" before "outer"….
  expect(proof?.observations).toEqual([
    expect.objectContaining({
      file: "specs/describe.spec.ts",
      test: ["anonymous parent"],
      outcome: "passed",
      attempts: 1,
      commit: head,
    }),
    expect.objectContaining({
      file: "specs/describe.spec.ts",
      test: ["outer", "inner", "case"],
      outcome: "passed",
      attempts: 1,
      commit: head,
      fileBlob: checkout.fileBlob("specs/describe.spec.ts"),
    }),
  ]);
  expect(proof?.observations.every((row) => row.project === undefined)).toBe(
    true,
  );
});

test("stdout, stderr and exit are identical with and without the option", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "quiet.spec.ts",
    `import { test } from "@playwright/test";
test("quiet", () => {});
`,
  );
  const off = startSnapshotRun({
    checkout,
    spec: "quiet.spec.ts",
    snapshot: false,
  });
  const without = await off.result;
  const on = startSnapshotRun({
    checkout,
    spec: "quiet.spec.ts",
    snapshot: true,
  });
  const withOption = await on.result;
  expect(withOption).toEqual(without);
  expect(withOption).toMatchObject({ status: 0, stdout: "", stderr: "" });
});
