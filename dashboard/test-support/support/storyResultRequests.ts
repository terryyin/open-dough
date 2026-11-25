import type { Page } from "@playwright/test";
import { storyReviewResultEndpoint } from "../../src/storyReviewResult.ts";

export function trackStoryResultReads(page: Page, file?: string) {
  const inventory: string[] = [];
  const text: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname !== storyReviewResultEndpoint) return;
    const pin =
      url.searchParams.get("completion") ??
      url.searchParams.get("publishedHead") ??
      url.searchParams.get("reference") ??
      "";
    const path = url.searchParams.get("path");
    if (path === null) inventory.push(pin);
    else if (path === file) text.push(pin);
  });
  return { inventory, text };
}
