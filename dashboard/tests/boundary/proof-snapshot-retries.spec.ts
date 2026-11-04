import { expect, test } from "../support/pageTest.ts";
import {
  removeSnapshotCheckouts,
  snapshotCheckout,
  startSnapshotRun,
} from "../support/proofSnapshotRun.ts";

test.afterAll(removeSnapshotCheckouts);

test("--retries=1 folds to attempts 2 with the summed duration", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "retry.spec.ts",
    `import { expect, test } from "@playwright/test";
test("passes on retry", ({}, testInfo) => {
  expect(testInfo.retry).toBe(1);
});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "retry.spec.ts",
    snapshot: true,
    config: { retries: 1 },
  });
  // The quiet reporter treats a flaky final pass as a strict failure, as the
  // run-record retry coverage does; proof still records the plain final pass.
  expect((await run.result).status).toBe(1);
  const proof = checkout.readProof();
  expect(proof?.observations).toHaveLength(1);
  expect(proof?.observations[0]).toMatchObject({
    file: "specs/retry.spec.ts",
    test: ["passes on retry"],
    attempts: 2,
  });
  expect(proof?.observations[0]?.durationMs).toBeGreaterThan(0);
});

test("--repeat-each=2 records one observation", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "repeat.spec.ts",
    `import { test } from "@playwright/test";
test("repeated", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "repeat.spec.ts",
    snapshot: true,
    args: ["--repeat-each=2"],
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const proof = checkout.readProof();
  expect(proof?.observations).toHaveLength(1);
  expect(proof?.observations[0]).toMatchObject({
    test: ["repeated"],
    attempts: 1,
  });
  expect(proof?.observations[0]?.durationMs).toBeGreaterThanOrEqual(0);
});

test("a test failing twice is cleared", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "always-fail.spec.ts",
    `import { expect, test } from "@playwright/test";
test("always fails", () => {
  expect(1).toBe(2);
});
test("keeps", () => {});
`,
  );
  // First, record both as passes is impossible for always-fail; seed by
  // recording a prior pass through a temporary success, then replace the file.
  checkout.writeSpec(
    "always-fail.spec.ts",
    `import { test } from "@playwright/test";
test("always fails", () => {});
test("keeps", () => {});
`,
  );
  const seed = startSnapshotRun({
    checkout,
    spec: "always-fail.spec.ts",
    snapshot: true,
  });
  expect(await seed.result).toMatchObject({ status: 0 });
  expect(checkout.readProof()?.observations).toHaveLength(2);

  checkout.writeSpec(
    "always-fail.spec.ts",
    `import { expect, test } from "@playwright/test";
test("always fails", () => {
  expect(1).toBe(2);
});
test("keeps", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "always-fail.spec.ts",
    snapshot: true,
    config: { retries: 1 },
  });
  expect((await run.result).status).not.toBe(0);
  const proof = checkout.readProof();
  expect(proof?.observations).toEqual([
    expect.objectContaining({
      file: "specs/always-fail.spec.ts",
      test: ["keeps"],
      attempts: 1,
    }),
  ]);
});
