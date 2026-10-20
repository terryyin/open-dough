// The browser knows the dashboard as Open Dough: the page declares the supplied
// icon exports (../../assets/brand/favicon/) for its tab, bookmarks and touch
// icon, and the built preview answers each declared URL with that canonical
// file's exact bytes. The dev server's same answer is proved beside the other
// serving-mode facts (./boundary/serving-modes.spec.ts).

import { expect, test } from "./dashboardTest.ts";
import { expectSuppliedIcon } from "./support/brandIcons.ts";

test("the dashboard's tab, bookmark and touch icons are Open Dough's supplied exports", async ({
  page,
}) => {
  await page.goto("/");
  const declared = await page
    .locator("head link[rel='icon'], head link[rel='apple-touch-icon']")
    .evaluateAll((links) =>
      links.map((link) => ({
        rel: link.getAttribute("rel"),
        type: link.getAttribute("type"),
        sizes: link.getAttribute("sizes"),
        href: (link as HTMLLinkElement).href,
      })),
    );
  const origin = new URL(page.url()).origin;
  expect(declared).toEqual([
    { rel: "icon", type: null, sizes: "any", href: `${origin}/favicon.ico` },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `${origin}/icon-32.png`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: `${origin}/icon-16.png`,
    },
    {
      rel: "apple-touch-icon",
      type: null,
      sizes: "180x180",
      href: `${origin}/icon-180.png`,
    },
  ]);
  // Browser identity only: the dashboard is not offered as an installable app.
  await expect(page.locator("head link[rel='manifest']")).toHaveCount(0);
  for (const { href } of declared) {
    await expectSuppliedIcon(await page.request.get(href));
  }
});
