// Instant wording in the page's browser locale, not Node's (they can disagree
// on en-* forms).
import type { Page } from "@playwright/test";

export async function browserLocaleString(
  page: Page,
  at: string | number,
): Promise<string> {
  return page.evaluate((value) => new Date(value).toLocaleString(), at);
}
