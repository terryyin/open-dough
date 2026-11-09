// Reading-place observations for a visit between story and project evidence.

import type { Locator, Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import { expect } from "./dashboardTest.ts";

// The page's reads, from now on, of the candidates record and of published
// test text.
export function projectReads(page: Page) {
  const reads: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== authenticatedReadEndpoint) return;
    const path = url.searchParams.get("path") ?? "";
    if (url.searchParams.get("intent") === "test-optimization-candidates")
      reads.push("candidates");
    else if (path.startsWith("dashboard/tests/")) reads.push(`text ${path}`);
  });
  return reads;
}

const readingPane = (intent: Locator) => intent.locator(".intent-reading");
export const scrollOf = (intent: Locator) =>
  readingPane(intent).evaluate((element) => element.scrollTop);

export async function scrollHalfway(intent: Locator) {
  const offset = await readingPane(intent).evaluate(
    (element) =>
      new Promise<number>((resolve) => {
        element.addEventListener(
          "scroll",
          () => {
            resolve(element.scrollTop);
          },
          { once: true },
        );
        element.scrollTo({
          top: Math.floor((element.scrollHeight - element.clientHeight) / 2),
        });
      }),
  );
  expect(offset).toBeGreaterThan(20);
  return offset;
}
