// The browser knows the dashboard as Open Dough: the page declares the supplied
// icon exports (../../assets/brand/favicon/) for its tab, bookmarks and touch
// icon, and the built preview answers each declared URL with that canonical
// file's exact bytes. Dev serves the same exports through the one serving
// configuration's brand asset plugin (../../dashboard/server/brandAssetPlugin.ts,
// checked in ../../dashboard/backend-tests/runtime/serving-modes.spec.ts).

import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectSuppliedIcon } from "../../dashboard/test-support/support/brandIcons.ts";

test("the dashboard's tab, bookmark and touch icons are Open Dough's supplied exports", async ({
  page,
}) => {
  await page.goto("/");
  const declared = await page
    .locator("head link[rel='icon'], head link[rel='apple-touch-icon']")
    .evaluateAll((links) =>
      links.map((link) => ({
        rel: link.getAttribute("rel"),
        href: (link as HTMLLinkElement).href,
      })),
    );
  expect(declared.some(({ rel }) => rel === "icon")).toBe(true);
  expect(declared.some(({ rel }) => rel === "apple-touch-icon")).toBe(true);
  // Browser identity only: the dashboard is not offered as an installable app.
  await expect(page.locator("head link[rel='manifest']")).toHaveCount(0);
  for (const { href } of declared) {
    await expectSuppliedIcon(href);
  }
});
