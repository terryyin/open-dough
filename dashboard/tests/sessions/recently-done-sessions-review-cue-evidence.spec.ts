// Review warnings require successful independent link and local-state reads.
import { expect, test, pausePageClockAt } from "../dashboardTest.ts";
import {
  linked,
  adHoc,
  openSelectionPage,
} from "../recentlyDoneSelectionJourney.ts";
import { expectSessionReviewCue } from "../recentlyDoneSessionsSidebarPage.ts";
import { isPygardonCatalog } from "../pygardonCatalogReads.ts";
import { completedStoryAssociationEndpoint } from "../../src/completedStoryAssociation.ts";
import { storyReviewStateEndpoint } from "../../src/storyReviewState.ts";
import { passCheckPace } from "../pageRequestNotes.ts";
import { expectProjectChoice } from "../projectChoice.ts";

test.use({ projectFolders: ["open-dough", "doughnut", "pygardon"] });
const releases: (() => void)[] = [];
test.afterEach(() => {
  for (const release of releases.splice(0)) release();
});

for (const evidence of ["catalog", "review state", "association"] as const) {
  test(`failed ${evidence} supplies no warning; a later successful read supplies it without selection`, async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    let failing = true;
    const matches = (url: URL) =>
      evidence === "catalog"
        ? isPygardonCatalog(url)
        : evidence === "review state"
          ? url.pathname === storyReviewStateEndpoint &&
            url.searchParams.get("id") === "pygardon"
          : url.pathname === completedStoryAssociationEndpoint &&
            url.searchParams.get("source") === "doughnut";
    await page.route(matches, (route) =>
      failing
        ? route.fulfill({
            status: 502,
            json: { error: "Evidence unavailable." },
          })
        : evidence === "association"
          ? route.fulfill({
              json: { kind: "linked", identity: linked.identity },
            })
          : route.fallback(),
    );
    const failed = page.waitForResponse(
      (response) =>
        matches(new URL(response.url())) && response.status() === 502,
    );
    const { shown, row } = await openSelectionPage(page, dashboard);
    await failed;
    const name = evidence === "association" ? adHoc.title : linked.title;
    await expectSessionReviewCue(row(name), false);
    await expect(shown.entry(name)).toBeEnabled();
    if (name === linked.title) await expect(shown.open(name)).toBeEnabled();
    await expect(shown.entry(name)).toHaveAttribute("aria-pressed", "false");
    failing = false;
    const recovered = page.waitForResponse(
      (response) => matches(new URL(response.url())) && response.ok(),
    );
    await passCheckPace(page);
    await recovered;
    await expectSessionReviewCue(row(name), true);
    await expect(shown.entry(name)).toHaveAttribute("aria-pressed", "false");
    await expectProjectChoice(page, "Open Dough");
    expect(dashboard.claudeAttaches()).toEqual([]);
  });
}

for (const evidence of ["catalog", "association"] as const) {
  test(`pending ${evidence} shows no initial warning, then resolves without selecting`, async ({
    page,
    dashboard,
  }) => {
    await pausePageClockAt(page, new Date());
    let asked = () => {};
    let release = () => {};
    const received = new Promise<void>((resolve) => {
      asked = resolve;
    });
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    releases.push(release);
    const matches = (url: URL) =>
      evidence === "catalog"
        ? isPygardonCatalog(url)
        : url.pathname === completedStoryAssociationEndpoint &&
          url.searchParams.get("source") === "doughnut";
    await page.route(matches, async (route) => {
      asked();
      await pending;
      if (evidence === "catalog") await route.fallback();
      else
        await route.fulfill({
          json: { kind: "linked", identity: linked.identity },
        });
    });
    const { shown, row } = await openSelectionPage(page, dashboard);
    await received;
    const name = evidence === "catalog" ? linked.title : adHoc.title;
    await expectSessionReviewCue(row(name), false);
    await expect(shown.entry(name)).toBeEnabled();
    const answered = page.waitForResponse((response) =>
      matches(new URL(response.url())),
    );
    release();
    await answered;
    await expectSessionReviewCue(row(name), true);
    await expect(shown.entry(name)).toHaveAttribute("aria-pressed", "false");
    await expectProjectChoice(page, "Open Dough");
  });
}
