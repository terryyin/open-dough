import { expect, test } from "../support/pageTest.ts";
import {
  removeSnapshotCheckouts,
  snapshotCheckout,
  startSnapshotRun,
} from "../support/proofSnapshotRun.ts";

test.afterAll(removeSnapshotCheckouts);

async function seedPasses(
  checkout: ReturnType<typeof snapshotCheckout>,
  spec: string,
  source: string,
): Promise<void> {
  checkout.writeSpec(spec, source);
  const seed = startSnapshotRun({ checkout, spec, snapshot: true });
  expect(await seed.result).toMatchObject({ status: 0 });
}

test("skipped, fixme and body skip keep earlier proof", async () => {
  const checkout = snapshotCheckout();
  await seedPasses(
    checkout,
    "keep.spec.ts",
    `import { test } from "@playwright/test";
test("skipped later", () => {});
test("fixme later", () => {});
test("body skip later", () => {});
test("stays", () => {});
`,
  );
  expect(checkout.readProof()?.observations).toHaveLength(4);

  checkout.writeSpec(
    "keep.spec.ts",
    `import { test } from "@playwright/test";
test.skip("skipped later", () => {});
test.fixme("fixme later", () => {});
test("body skip later", ({}, testInfo) => {
  testInfo.skip(true, "body");
});
test("stays", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "keep.spec.ts",
    snapshot: true,
  });
  expect(await run.result).toMatchObject({ status: 0, stdout: "", stderr: "" });
  const names = checkout.readProof()?.observations.map((row) => row.test[0]);
  expect(names?.sort()).toEqual([
    "body skip later",
    "fixme later",
    "skipped later",
    "stays",
  ]);
});

test("timeout, assertion failure, test.fail and printed-output pass clear only themselves", async () => {
  const checkout = snapshotCheckout();
  await seedPasses(
    checkout,
    "clear.spec.ts",
    `import { test } from "@playwright/test";
test("times out later", () => {});
test("asserts later", () => {});
test("fail marker later", () => {});
test("prints later", () => {});
test("kept", () => {});
`,
  );
  expect(checkout.readProof()?.observations).toHaveLength(5);

  checkout.writeSpec(
    "clear.spec.ts",
    `import { expect, test } from "@playwright/test";
test("times out later", async () => {
  await new Promise(() => {});
});
test("asserts later", () => {
  expect(1).toBe(2);
});
test.fail("fail marker later", () => {
  expect(1).toBe(2);
});
test("prints later", () => {
  console.log("printed");
});
test("kept", () => {});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "clear.spec.ts",
    snapshot: true,
    config: { timeout: 500 },
  });
  expect((await run.result).status).not.toBe(0);
  expect(checkout.readProof()?.observations).toEqual([
    expect.objectContaining({ test: ["kept"] }),
  ]);
});

test("--grep and --project exclusion keep unselected proof", async () => {
  const checkout = snapshotCheckout();
  await seedPasses(
    checkout,
    "select.spec.ts",
    `import { test } from "@playwright/test";
test("selected", () => {});
test("excluded by grep", () => {});
`,
  );
  checkout.writeSpec(
    "other.spec.ts",
    `import { test } from "@playwright/test";
test("other project file", () => {});
`,
  );
  const seedOther = startSnapshotRun({
    checkout,
    spec: "other.spec.ts",
    snapshot: true,
  });
  expect(await seedOther.result).toMatchObject({ status: 0 });
  expect(checkout.readProof()?.observations).toHaveLength(3);

  const grepRun = startSnapshotRun({
    checkout,
    spec: "select.spec.ts",
    snapshot: true,
    args: ["--grep", "selected"],
  });
  expect(await grepRun.result).toMatchObject({ status: 0 });
  expect(
    checkout
      .readProof()
      ?.observations.map((row) => row.test[0])
      .sort(),
  ).toEqual(["excluded by grep", "other project file", "selected"]);

  const projectRun = startSnapshotRun({
    checkout,
    spec: ["select.spec.ts", "other.spec.ts"],
    snapshot: true,
    config: {
      projects: [
        { name: "alpha", testMatch: "select.spec.ts" },
        { name: "beta", testMatch: "other.spec.ts" },
      ],
    },
    args: ["--project=alpha"],
  });
  expect(await projectRun.result).toMatchObject({ status: 0 });
  expect(
    checkout
      .readProof()
      ?.observations.map((row) => row.test[0])
      .sort(),
  ).toEqual(["excluded by grep", "other project file", "selected"]);
});

test("a killed run keeps completed proof updates", async () => {
  test.setTimeout(60_000);
  const checkout = snapshotCheckout();
  checkout.writeSpec(
    "ordered.spec.ts",
    `import { test } from "@playwright/test";
test.describe.configure({ mode: "serial" });
test("first", async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
});
test("hangs", async () => {
  await new Promise(() => {});
});
`,
  );
  const run = startSnapshotRun({
    checkout,
    spec: "ordered.spec.ts",
    snapshot: true,
    config: { workers: 1, fullyParallel: false },
  });
  try {
    await expect
      .poll(() => checkout.readProof()?.observations.length ?? 0, {
        timeout: 45_000,
      })
      .toBe(1);
    const pid = run.child.pid;
    if (pid === undefined) throw new Error("snapshot runner did not start");
    process.kill(-pid, "SIGKILL");
    await run.result;
    expect(checkout.readProof()?.observations).toEqual([
      expect.objectContaining({ test: ["first"] }),
    ]);
  } finally {
    await run.stop();
  }
});
