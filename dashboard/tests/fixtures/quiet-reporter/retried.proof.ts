import { expect, test } from "@playwright/test";

// eslint-disable-next-line no-empty-pattern -- Playwright requires a fixture destructuring parameter before testInfo
test("passes only on its retry", ({}, testInfo) => {
  expect(testInfo.retry).toBe(1);
});
