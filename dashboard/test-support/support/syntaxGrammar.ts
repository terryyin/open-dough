// A language's syntax grammar module as the page loads it: held once asked
// until released, or failed outright, so a reading shows its plain code first.

import type { Page } from "@playwright/test";

const grammarModule = (language: string) =>
  new RegExp(`/assets/${language}-[^/]+\\.js$`);

export async function holdGrammar(page: Page, language: string) {
  let asked: () => void = () => undefined;
  const requested = new Promise<void>((resolve) => {
    asked = resolve;
  });
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(grammarModule(language), async (route) => {
    asked();
    await released;
    await route.continue();
  });
  return { requested, release };
}

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
