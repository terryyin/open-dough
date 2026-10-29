import { expect, test } from "@playwright/test";

// Real serial-file hooks are excluded from test durations. Test-scoped hooks
// are included already; the timing artifact must not count those twice.
test.describe.configure({ mode: "serial" });
test.beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
});
test.afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
});
test.beforeEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});
test.afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
});

test("first test with shared hooks", () => {
  expect(1 + 1).toBe(2);
});
test("second test with shared hooks", () => {
  expect(2 + 2).toBe(4);
});
