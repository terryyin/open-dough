// Intent's CI status homepage in the production page layout
// (../../src/perspectiveScroll.tsx, ../../src/intent-perspective.css): at a
// short viewport Intent fills the page body's scroll region without scrolling
// it, and CI status scrolls inside its pane.

import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { mountJudgedRunProof } from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

test("at a short viewport Intent fills the page body's scroll region without scrolling it, and CI status scrolls inside its pane", async () => {
  await mountJudgedRunProof([]);
  const ci = intentCiStatus();
  await ci.answers("Passed at a1b2c3d (Add login)");
  await page.viewport(700, 360);
  await expect.poll(() => ci.scrollsWithinIntent()).toBe(true);
});
