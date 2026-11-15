// Review warnings require successful independent link and local-state reads.
import { expect, test } from "../../tests/support/frontendApp.ts";
import { pausePageClockAt } from "../../tests/dashboardTest.ts";
import {
  adHoc,
  linked,
  openFrontendSelectionPage,
} from "../../tests/support/frontendRecentlyDoneSelection.ts";
import { expectSessionReviewCue } from "../../tests/recentlyDoneSessionsSidebarPage.ts";
import {
  holdPygardonCatalog,
  isPygardonCatalog,
} from "../../tests/pygardonCatalogReads.ts";
import { passCheckPace } from "../../tests/pageRequestNotes.ts";
import { expectProjectChoice } from "../../tests/projectChoice.ts";
import {
  installFrontendCompletedStoryAssociation,
  installFrontendStoryReviewState,
} from "../../tests/support/frontendServiceSubstitutes.ts";

for (const evidence of ["catalog", "review state", "association"] as const) {
  test(`failed ${evidence} supplies no warning; a later successful read supplies it without selection`, async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    const review = await installFrontendStoryReviewState(page);
    const association = await installFrontendCompletedStoryAssociation(page);
    let failing = true;
    if (evidence === "catalog") {
      await page.route(isPygardonCatalog, (route) =>
        failing
          ? route.fulfill({
              status: 502,
              json: { error: "Evidence unavailable." },
            })
          : route.fallback(),
      );
    } else if (evidence === "review state") {
      review.refuseNext("Evidence unavailable.", 502, "pygardon");
    } else {
      association.answer({ kind: "linked", identity: linked.identity });
      association.refuseNext("Evidence unavailable.", 502);
    }
    const failed = page.waitForResponse((response) => {
      const url = new URL(response.url());
      if (evidence === "catalog")
        return isPygardonCatalog(url) && response.status() === 502;
      if (evidence === "review state")
        return (
          url.pathname.includes("story-review-states") &&
          response.status() === 502
        );
      return (
        url.pathname.includes("completed-story") && response.status() === 502
      );
    });
    const { shown, row } = await openFrontendSelectionPage(
      page,
      frontendServices,
    );
    await failed;
    const name = evidence === "association" ? adHoc.title : linked.title;
    await expectSessionReviewCue(row(name), false);
    await expect(shown.select(name)).toBeEnabled();
    if (name === linked.title) await expect(shown.open(name)).toBeEnabled();
    await expect(shown.select(name)).toHaveAttribute("aria-pressed", "false");
    failing = false;
    const recovered = page.waitForResponse((response) => {
      const url = new URL(response.url());
      if (evidence === "catalog")
        return isPygardonCatalog(url) && response.ok();
      if (evidence === "review state")
        return url.pathname.includes("story-review-states") && response.ok();
      return url.pathname.includes("completed-story") && response.ok();
    });
    await passCheckPace(page);
    await recovered;
    await expectSessionReviewCue(row(name), true);
    await expect(shown.select(name)).toHaveAttribute("aria-pressed", "false");
    await expectProjectChoice(page, "Open Dough");
  });
}

for (const evidence of ["catalog", "association"] as const) {
  test(`pending ${evidence} shows no initial warning, then resolves without selecting`, async ({
    page,
    frontendServices,
  }) => {
    await pausePageClockAt(page, new Date());
    if (evidence === "catalog") {
      const held = await holdPygardonCatalog(page);
      const { shown, row } = await openFrontendSelectionPage(
        page,
        frontendServices,
      );
      await held.asked;
      await expectSessionReviewCue(row(linked.title), false);
      await expect(shown.select(linked.title)).toBeEnabled();
      const answered = page.waitForResponse((response) =>
        isPygardonCatalog(new URL(response.url())),
      );
      held.release();
      await answered;
      await expectSessionReviewCue(row(linked.title), true);
      await expect(shown.select(linked.title)).toHaveAttribute(
        "aria-pressed",
        "false",
      );
      await expectProjectChoice(page, "Open Dough");
      return;
    }
    const association = await installFrontendCompletedStoryAssociation(page);
    const held = association.holdNext();
    association.answerNext({ kind: "linked", identity: linked.identity });
    const { shown, row } = await openFrontendSelectionPage(
      page,
      frontendServices,
    );
    await held.received;
    await expectSessionReviewCue(row(adHoc.title), false);
    await expect(shown.select(adHoc.title)).toBeEnabled();
    held.release();
    await held.delivered;
    await expectSessionReviewCue(row(adHoc.title), true);
    await expect(shown.select(adHoc.title)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expectProjectChoice(page, "Open Dough");
  });
}
