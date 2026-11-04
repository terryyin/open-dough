import { expect, test } from "../support/pageTest.ts";
import {
  removeSnapshotCheckouts,
  snapshotCheckout,
  startSnapshotRun,
} from "../support/proofSnapshotRun.ts";

test.afterAll(removeSnapshotCheckouts);

test("two projects selecting one file record project", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "shared.spec.ts",
    `import { test } from "@playwright/test";
test("shared case", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "shared.spec.ts",
    snapshot: true,
    config: {
      projects: [
        { name: "alpha", testMatch: "shared.spec.ts" },
        { name: "beta", testMatch: "shared.spec.ts" },
      ],
    },
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const proof = checkout.readProof();
  expect(proof?.observations).toHaveLength(2);
  expect(proof?.observations.map((row) => row.project).sort()).toEqual([
    "alpha",
    "beta",
  ]);
  expect(
    proof?.observations.every(
      (row) =>
        row.file === "specs/shared.spec.ts" && row.test[0] === "shared case",
    ),
  ).toBe(true);
});

test("disjoint projects record no project field", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "alpha.spec.ts",
    `import { test } from "@playwright/test";
test("alpha case", () => {});
`,
  );
  checkout.writeSpec(
    "beta.spec.ts",
    `import { test } from "@playwright/test";
test("beta case", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: ["alpha.spec.ts", "beta.spec.ts"],
    snapshot: true,
    config: {
      projects: [
        { name: "alpha", testMatch: "alpha.spec.ts" },
        { name: "beta", testMatch: "beta.spec.ts" },
      ],
    },
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const proof = checkout.readProof();
  expect(proof?.observations).toHaveLength(2);
  expect(proof?.observations.every((row) => row.project === undefined)).toBe(
    true,
  );
});

test("a helper-defined test is recorded under the spec's file suite path", async () => {
  const checkout = snapshotCheckout();
  checkout.writeHelper(
    "cases.ts",
    `import { test } from "@playwright/test";
export function registerCases(): void {
  test("from helper", () => {});
}
`,
  );
  checkout.writeSpec(
    "importer.spec.ts",
    `import { test } from "@playwright/test";
import { registerCases } from "./cases.ts";
test("own", () => {});
registerCases();
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "importer.spec.ts",
    snapshot: true,
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const proof = checkout.readProof();
  expect(proof?.observations).toEqual([
    expect.objectContaining({
      file: "specs/importer.spec.ts",
      test: ["from helper"],
    }),
    expect.objectContaining({
      file: "specs/importer.spec.ts",
      test: ["own"],
    }),
  ]);
  expect(
    proof?.observations.every((row) => row.file === "specs/importer.spec.ts"),
  ).toBe(true);
});
