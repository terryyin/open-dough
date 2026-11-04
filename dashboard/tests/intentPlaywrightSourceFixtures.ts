// Published files of an Open Dough-like project for the Playwright Proof
// journey (`./intentPlaywrightProofFixtures.ts`): a `dashboard/tests`
// location with a named describe, a serial describe, a top-level test, a
// loop-generated title, and a helper-defined case that the snapshot may hold
// without a row; beside a `shell` script for the other-kinds sentence.

export const locationPath = "dashboard/tests";
export const boundaryPath = `${locationPath}/boundary`;
export const boardPath = `${locationPath}/accessible-board-touch.spec.ts`;
export const quietPath = `${locationPath}/agent-completion-quiet.spec.ts`;
export const helperCasePath = `${boundaryPath}/helper-defined.spec.ts`;
export const scriptPath = "scripts/check.sh";

const boardSource = `import { expect, test } from "@playwright/test";

test.describe("touch reading", () => {
  test("keeps a long story readable", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
  });
  test("selects detail through rotation", async ({ page }) => {
    await expect(page.getByRole("list")).toBeVisible();
  });
});

test.describe.serial("rotation order", () => {
  test("visits the first column", async ({ page }) => {
    await expect(page.getByRole("columnheader").first()).toBeVisible();
  });
});

test("opens the board from the tree", async ({ page }) => {
  await expect(page.getByRole("tree")).toBeVisible();
});

test("needs a later pass", async ({ page }) => {
  await expect(page.getByRole("status")).toBeVisible();
});
`;

const quietSource = `import { expect, test } from "@playwright/test";

const labels = ["alpha", "beta"];
for (const label of labels) {
  test(\`quiet pass for \${label}\`, async ({ page }) => {
    await expect(page.getByText(label)).toBeVisible();
  });
}

test("listed quiet check", async ({ page }) => {
  await expect(page.getByRole("status")).toBeVisible();
});
`;

const helperCaseSource = `import { expect, test } from "@playwright/test";

test("boundary keeps helper proof unlisted", async ({ page }) => {
  await expect(page.getByRole("region")).toBeVisible();
});
`;

const shellSource = `#!/usr/bin/env bash
echo ok
`;

export const sources = {
  [boardPath]: boardSource,
  [quietPath]: quietSource,
  [helperCasePath]: helperCaseSource,
  [scriptPath]: shellSource,
};
