// A language's syntax grammar module as the page loads it, failed outright, so
// a reading shows its plain code.

import type { Page } from "@playwright/test";

const grammarModule = (language: string) =>
  new RegExp(`/assets/${language}-[^/]+\\.js$`);

export async function failGrammar(page: Page, language: string) {
  let abandoned: () => void = () => undefined;
  const failed = new Promise<void>((resolve) => {
    abandoned = resolve;
  });
  await page.route(grammarModule(language), async (route) => {
    await route.abort("failed");
    abandoned();
  });
  return { failed };
}
