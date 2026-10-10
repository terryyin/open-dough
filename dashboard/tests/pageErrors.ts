// The errors a page throws uncaught, collected as they happen, so a journey
// can say that what it did raised none.
import type { Page } from "@playwright/test";

export function watchPageErrors(page: Page): Error[] {
  const errors: Error[] = [];
  page.on("pageerror", (error) => errors.push(error));
  return errors;
}
