// An unavailable published-session listing shows as Recently done's own
// assignment-gap beside any done-catalog gap, never as an empty listed set
// (../../src/recentlyDoneView.ts, ../../src/publishedSessions.ts).
import { expect, test } from "../../test-support/support/frontendApp.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { showColumn } from "../../test-support/boardPage.ts";
import { parts } from "../../test-support/dashboardParts.ts";
import { publishedSessionEntry } from "../../test-support/recentlyDoneColumn.ts";
import {
  putFrontendDonePublication,
  putFrontendPublishedSessions,
} from "../../test-support/support/frontendServiceState.ts";

const listingRefused = "The origin listing failed.";
const listingGap = `Published sessions could not be read. ${listingRefused}`;

test("an unavailable published listing shows its problem as a gap", async ({
  page,
  frontendServices,
}) => {
  await test.step("refuse the published listing for Open Dough", () => {
    putFrontendPublishedSessions(frontendServices, "open-dough", {
      status: 502,
      error: listingRefused,
    });
  });

  await test.step("open Recently done", async () => {
    await page.goto("/");
    await showColumn(page, "Recently done");
  });

  await test.step("the listing gap shows and no published session is listed", async () => {
    const recent = parts(page).recentlyDone;
    await expect(recent.locator(".assignment-gap")).toHaveText(listingGap);
    await expect(
      recent.getByRole("article", { name: /^Published session/ }),
    ).toHaveCount(0);
  });
});

test("an unavailable published listing stands beside a done-catalog gap", async ({
  page,
  frontendServices,
}) => {
  const catalogGap = "done catalog is not published beside the done records";

  await test.step("refuse the done catalog and the published listing", () => {
    putFrontendDonePublication(frontendServices, "open-dough", {
      catalog: { gap: catalogGap },
    });
    putFrontendPublishedSessions(frontendServices, "open-dough", {
      status: 502,
      error: listingRefused,
    });
  });

  await test.step("open Recently done", async () => {
    await page.goto("/");
    await showColumn(page, "Recently done");
  });

  await test.step("two assignment-gaps appear", async () => {
    await expect(
      parts(page).recentlyDone.locator(".assignment-gap"),
    ).toHaveCount(2);
  });

  await test.step("the first gap is the done-catalog problem", async () => {
    const first = parts(page).recentlyDone.locator(".assignment-gap").nth(0);
    await expect(first).toContainText("Done stories could not be read.");
    await expect(first).toContainText(catalogGap);
  });

  await test.step("the second gap is the published listing problem", async () => {
    await expect(
      parts(page).recentlyDone.locator(".assignment-gap").nth(1),
    ).toHaveText(listingGap);
  });
});

test("a listed published session still appears in Recently done", async ({
  page,
  frontendServices,
}) => {
  const published = publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord.please(),
  );

  await test.step("list one published session for Open Dough", () => {
    putFrontendPublishedSessions(frontendServices, "open-dough", {
      sessions: [published],
    });
  });

  await test.step("open Recently done", async () => {
    await page.goto("/");
    await showColumn(page, "Recently done");
  });

  await test.step("the published session shows without a listing gap", async () => {
    const recent = parts(page).recentlyDone;
    await expect(
      publishedSessionEntry(recent, published.sessionId),
    ).toBeVisible();
    await expect(recent.locator(".assignment-gap")).toHaveCount(0);
  });
});
