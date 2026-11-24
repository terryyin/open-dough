import { locators, type Locator } from "vitest/browser";

declare module "vitest/browser" {
  interface LocatorSelectors {
    getByCSS(selector: string): Locator;
  }
}

locators.extend({
  getByCSS: (selector) => `css=${selector}`,
});
