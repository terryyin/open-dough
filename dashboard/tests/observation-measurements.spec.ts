// Regression proof for test observations whose inputs span browser/server turns.
// These supply only real DOM geometry or raw gh argv, never dashboard facts.

import { expect, githubFor, test } from "./dashboardTest.ts";
import type { Locator, Page } from "@playwright/test";
import {
  expectInReadingOrder,
  expectInside,
  expectOnOneLine,
  expectStackedInOrder,
} from "./partArrangement.ts";
import { expectHeldGroups } from "./publishedFactsIsolationAssertions.ts";
import {
  canonicalPath,
  factsAt,
  revisionA,
} from "./publishedFactsIsolation.ts";
import { profilePath, repository } from "./sliceClockRecords.ts";
import type { GhCall } from "./support/fakeGitHub.ts";
import { parseRequest } from "./support/ghRequest.ts";

function scrollBetweenIndividualReads(
  page: Page,
  first: Locator,
  next: Locator,
) {
  // The platform can finish two independent observations on different turns.
  // Keep both locators real, but deterministically move the viewport between
  // those replies; the DOM's relative order never changes.
  let sampled: () => void = () => undefined;
  const firstSample = new Promise<void>((resolve) => {
    sampled = resolve;
  });
  const firstBox = first.boundingBox.bind(first);
  const nextBox = next.boundingBox.bind(next);
  const firstObservation = first;
  firstObservation.boundingBox = async () => {
    const found = await firstBox();
    sampled();
    return found;
  };
  const nextObservation = next;
  nextObservation.boundingBox = async () => {
    await firstSample;
    await page.evaluate(() => {
      scrollTo(0, 200);
    });
    return nextBox();
  };
}

test("relative arrangement samples the same visible layout even when individual viewport reads cross a scroll", async ({
  page,
}) => {
  await page.setContent(`<style>
    body { height: 2000px; margin: 0; padding-top: 600px; }
    p { height: 40px; margin: 0; }
    div { height: 80px; margin-top: 10px; }
  </style><p>Startup needs reconciliation</p><div>Launch actions</div>`);
  const note = page.getByText("Startup needs reconciliation");
  const launches = page.getByText("Launch actions");
  scrollBetweenIndividualReads(page, note, launches);
  await expectStackedInOrder([note, launches]);
  // A real overlap still fails the same ordering contract.
  await launches.evaluate((element) => {
    const style = element.style;
    style.marginTop = "-20px";
  });
  await expect(expectStackedInOrder([note, launches])).rejects.toThrow(
    "part 1 ends before part 2 begins",
  );
  await launches.evaluate((element) => {
    const style = element.style;
    style.display = "none";
  });
  await expect(expectStackedInOrder([note, launches])).rejects.toThrow(
    "No visible box",
  );
});

for (const relationship of [
  "same line",
  "reading order",
  "containment",
] as const) {
  test(`${relationship} compares parts from the same visible layout`, async ({
    page,
  }) => {
    await page.setContent(`<style>
      body { height: 2000px; margin: 0; padding-top: 600px; }
      section { width: 300px; height: 80px; }
      span { display: inline-block; width: 80px; height: 40px; }
    </style><section><span>Execute</span><span>Refine</span></section>`);
    const first = page.getByText("Execute");
    const next = page.getByText("Refine");
    const area = page.locator("section");
    scrollBetweenIndividualReads(
      page,
      first,
      relationship === "containment" ? area : next,
    );
    if (relationship === "same line") await expectOnOneLine([first, next]);
    else if (relationship === "reading order")
      await expectInReadingOrder(area, [first, next]);
    else await expectInside(first, area);
  });
}

test("a held group has reached its raw handlers only after every listed profile arrives", async ({
  page,
}) => {
  const facts = factsAt(revisionA, "A");
  const calls = githubFor(page).calls as GhCall[];
  const appendRead = (path: string) => {
    const argv = [
      "api",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${repository}/contents/${path}?ref=${revisionA}`,
    ];
    calls.push({ argv, request: parseRequest(argv) });
  };
  const done = Object.keys(facts.files).find((path) =>
    path.startsWith(".planning/done/"),
  );
  expect(done).toBeDefined();
  if (done === undefined) throw new Error("The fixture has no done record");
  appendRead(canonicalPath);
  appendRead(done);
  appendRead(profilePath(facts.owner));
  const held = expectHeldGroups(page, facts, [
    "preparation",
    "profiles",
    "done",
  ]);
  // A browser turn is an observable checkpoint; no elapsed wait establishes
  // completion of the sibling raw gh invocation.
  const boundary = await Promise.race([
    held.then(() => "finished"),
    page.evaluate(() => "browser turn"),
  ]);
  appendRead(profilePath(facts.preparer));
  await held;
  expect(boundary).toBe("browser turn");
});
