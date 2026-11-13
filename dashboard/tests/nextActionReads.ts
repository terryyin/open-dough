// Routes the reads a Recently done journey's next action sends, apart from
// the reads the shown rows send on their own (../src/recentlyDoneShownLinks.ts):
// those read each linked story's done catalog and each ad hoc row's
// completed-story association on opening, and again each check interval of
// page time. So page time must stand still (`pausePageClockAt` before the
// page opens), and the page's requests are answered before the route is
// taken: none of the rows' own reads is then mistaken for one the next action
// sent. Used by ./pygardonCatalogReads.ts,
// ./sessions/recently-done-sessions-select-ad-hoc-check.spec.ts and
// ./sessions/recently-done-sessions-select-check.spec.ts.

import type { Page, Route } from "@playwright/test";
import { untilPageRequestsAnswered } from "./pageRequestNotes.ts";

// Answers the page's later reads matching `which` with `answer`.
export async function routeNextReads(
  page: Page,
  which: (url: URL) => boolean,
  answer: (route: Route) => Promise<void>,
) {
  if (!(await pageTimeStandsStill(page))) {
    throw new Error(
      "Routing the next action's reads needs page time paused before the page opens (pausePageClockAt).",
    );
  }
  await untilPageRequestsAnswered(page);
  await page.route(which, async (route) => {
    if (route.request().method() === "GET") await answer(route);
    else await route.fallback();
  });
}

// Holds the page's later reads matching `which`, after letting the first
// `passing` through: `asked` resolves once a held one reaches the page's
// boundary, and `release` lets every held one through.
export async function holdNextReads(
  page: Page,
  which: (url: URL) => boolean,
  passing = 0,
) {
  let passed = 0;
  let asked: () => void = () => undefined;
  const askedOnce = new Promise<void>((resolve) => {
    asked = resolve;
  });
  let release: () => void = () => undefined;
  const released = new Promise<void>((resolve) => {
    release = resolve;
  });
  await routeNextReads(page, which, async (route) => {
    if (passed < passing) {
      passed += 1;
      await route.fallback();
      return;
    }
    asked();
    await released;
    // The page may have abandoned the read meanwhile.
    await route.fallback().catch(() => undefined);
  });
  return { asked: askedOnce, release };
}

// Whether the page's clock stays where it was across two separate asks.
async function pageTimeStandsStill(page: Page) {
  const at = () => performance.now();
  return (await page.evaluate(at)) === (await page.evaluate(at));
}
