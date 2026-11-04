import { expect, test } from "../support/pageTest.ts";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  nongitCheckout,
  removeSnapshotCheckouts,
  snapshotCheckout,
  startSnapshotRun,
} from "../support/proofSnapshotRun.ts";
import { startProofRun } from "../support/proofRecordRun.ts";

test.afterAll(removeSnapshotCheckouts);

test("two concurrent recording runs land every pass in one latest.json without a json lock", async () => {
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "a.spec.ts",
    `import { test } from "@playwright/test";
test("a", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});
`,
  );
  checkout.writeSpec(
    "b.spec.ts",
    `import { test } from "@playwright/test";
test("b", async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});
`,
  );
  const first = startSnapshotRun({
    checkout,
    spec: "a.spec.ts",
    snapshot: true,
  });
  const second = startSnapshotRun({
    checkout,
    spec: "b.spec.ts",
    snapshot: true,
  });
  expect(await first.result).toMatchObject({
    status: 0,
    stdout: "",
    stderr: "",
  });
  expect(await second.result).toMatchObject({
    status: 0,
    stdout: "",
    stderr: "",
  });
  const proof = checkout.readProof();
  expect(proof?.observations.map((row) => row.test[0]).sort()).toEqual([
    "a",
    "b",
  ]);
  expect(existsSync(`${checkout.proof}.lock`)).toBe(false);
  expect(
    readdirSync(checkout.proof).filter((name) => name.endsWith(".json")),
  ).toEqual(["latest.json"]);
  expect(
    readdirSync(checkout.proof).some((name) => name.includes(".lock")),
  ).toBe(false);
});

test("outside a Git checkout recording is a no-op", async () => {
  const root = nongitCheckout();
  const run = startProofRun({
    cwd: root,
    testDir: path.join(root, "specs"),
    spec: "plain.spec.ts",
    snapshot: true,
    recordPath: false,
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  expect(existsSync(path.join(root, "proof"))).toBe(false);
});
