// Published record/text read accounting during a project evidence visit.

import type { Page } from "@playwright/test";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

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
