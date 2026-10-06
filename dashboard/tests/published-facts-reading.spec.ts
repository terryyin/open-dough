// Independent raw GitHub fact groups enrich the built preview while a developer
// reads a still-present Taken story. The real edge control and inspection open
// its detail; the focused pinned link stays visible after useful arrivals and
// an ordinary read gap, with natural reflow rather than fixed pixel offsets.

import type { Locator, Page } from "@playwright/test";
import { inspectedDetail } from "./cardControls.ts";
import { expectView, rem, showColumn } from "./dashboardColumnsPage.ts";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { heldFactGroups, takenCanonicalPath } from "./publishedFactsArrival.ts";
import { expectDoneFacts } from "./publishedFactsAssertions.ts";
import { expectVisibleReadingFocus } from "./readingPlace.ts";
import { repository, revision } from "./sliceClockRecords.ts";

async function expectReadingPlace(
  page: Page,
  card: Locator,
  detail: Locator,
  link: Locator,
) {
  await expectView(page, ["Taken", "Recently done"], ["Backlog 1 entry"]);
  await expect(
    card.getByRole("button", { name: "Hide detail" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(detail).toBeVisible();
  await expect(detail.locator(".card-identity")).toHaveText(
    "SEED-091#just-taken",
  );
  await expect(link).toHaveAttribute(
    "href",
    `https://github.com/${repository}/blob/${revision}/${takenCanonicalPath}#just-taken`,
  );
  await expectVisibleReadingFocus(page, link);
}

async function openReadingPlace(page: Page) {
  await page.setViewportSize({ width: 54 * rem, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const held = await heldFactGroups(page);
  const { trunkCard, doneCard } = held;
  await test.step("the reader pages and actually scrolls to a story while all groups are held", async () => {
    await expect(trunkCard).toContainText("Reading preparation…");
    await expect(trunkCard).toContainText("Reading agent profile…");
    await expect(doneCard).toHaveCount(0);
    await showColumn(page, "Recently done");
    await expectView(page, ["Taken", "Recently done"], ["Backlog 1 entry"]);
    const before = await page.evaluate(() => scrollY);
    await trunkCard
      .getByRole("button", { name: "Inspect story" })
      .scrollIntoViewIfNeeded();
    await expect
      .poll(() => page.evaluate(() => scrollY))
      .toBeGreaterThan(before);
  });
  const detail = await inspectedDetail(trunkCard);
  const link = detail.getByRole("link", { name: /^Canonical record/ });
  await link.scrollIntoViewIfNeeded();
  await link.focus();
  await expectReadingPlace(page, trunkCard, detail, link);
  return { ...held, detail, link };
}

for (const doneOutcome of ["success", "failure"] as const) {
  test(`arriving facts keep the scrolled inspection and focus, including done ${doneOutcome}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const {
      branchCard,
      trunkCard,
      queuedCard,
      doneCard,
      problem,
      release,
      fail,
      detail,
      link,
    } = await openReadingPlace(page);

    await test.step("available assignments keep the chosen reading context while preparation and done remain held", async () => {
      release("profiles");
      await expect(trunkCard.locator(".card-owner")).toContainText(
        "Yuma-chan · Fixture Committer · Claude Code",
      );
      await expect(branchCard.locator(".card-owner")).toContainText(
        "Akiho-chan",
      );
      await expect(queuedCard.locator(".card-preparing")).toContainText(
        "Kirara-chan",
      );
      await expect(trunkCard).toContainText("Reading preparation…");
      await expect(doneCard).toHaveCount(0);
      await expectReadingPlace(page, trunkCard, detail, link);
    });

    await test.step(`the independent done ${doneOutcome} leaves the same inspection, focus, and visible link`, async () => {
      if (doneOutcome === "success") {
        release("done");
        await expectDoneFacts(doneCard);
      } else {
        fail("done");
        await expect(parts(page).recentlyDone).toContainText(
          "Done stories could not be read.",
        );
        await expect(doneCard).toHaveCount(0);
      }
      await expect(trunkCard).toContainText("Yuma-chan");
      await expect(trunkCard).toContainText("Reading preparation…");
      await expectReadingPlace(page, trunkCard, detail, link);
    });

    await test.step("preparation, dependent progress, and clocks enrich the open inspection without taking the reader back to the top", async () => {
      release("preparation");
      await expect(trunkCard.locator(".card-progress")).toContainText(
        "1 of 2 slices recorded complete",
      );
      await expect(detail).toContainText("Approach: Slice planned");
      await expect(detail).toContainText("1 of 2 slices recorded complete");
      await expect(trunkCard).toContainText("Current slice started 5 min ago");
      await expect(trunkCard).toContainText("Yuma-chan");
      if (doneOutcome === "success") {
        await expectDoneFacts(doneCard);
      } else {
        await expect(parts(page).recentlyDone).toContainText(
          "Done stories could not be read.",
        );
      }
      await expectReadingPlace(page, trunkCard, detail, link);
      await expect(trunkCard).not.toContainText("Reading preparation…");
      await expect(problem).toHaveCount(0);
    });
    expect(errors).toEqual([]);
  });
}

test("arriving facts respect a reader who scrolls away while the inspected link keeps keyboard focus", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const { trunkCard, doneCard, release, link } = await openReadingPlace(page);
  // A real wheel movement returns to the overview without changing focus.
  await page.mouse.wheel(0, -(await page.evaluate(() => scrollY)));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(link).toBeFocused();
  await expect(link).not.toBeInViewport();
  const overviewControl = page.getByRole("button", {
    name: "Start session in Open Dough",
  });

  for (const group of ["preparation", "profiles", "done"] as const) {
    release(group);
    if (group === "preparation") {
      await expect(
        trunkCard.getByText("Slice planned", { exact: true }),
      ).toBeVisible();
    } else if (group === "profiles") {
      await expect(trunkCard.locator(".card-owner")).toContainText("Yuma-chan");
    } else {
      await expectDoneFacts(doneCard);
    }
    await expect(link).toBeFocused();
    await expect(link).not.toBeInViewport();
    await expect(overviewControl).toBeInViewport({ ratio: 1 });
    await expectView(page, ["Taken", "Recently done"], ["Backlog 1 entry"]);
  }
  expect(errors).toEqual([]);
});
