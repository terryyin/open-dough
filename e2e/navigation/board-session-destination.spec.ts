import type { Page } from "@playwright/test";
import { materializeRepository } from "../../Distribution/tests/support/repository-fixture.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { expectDocumentStill } from "../../dashboard/test-support/boardReading.ts";
import { boardView } from "../../dashboard/test-support/boardView.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectReadingTop } from "../../dashboard/test-support/readingPlace.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";

const identity = "SEED-18#story";
const title = `Read this published story from its beginning ${"before reading the rest of the story ".repeat(132)}at the pinned Board edge`;
const destination = `/?${new URLSearchParams({ project: "open-dough", story: identity })}`;
const readingViewports = [
  { width: 1400, height: 360 },
  { width: 700, height: 800 },
];

test.use({ reducedMotion: "reduce" });

test("a direct story URL reveals the tall card's top below its sticky column heading", async ({
  page,
  afterGitHubStops,
}) => {
  await test.step("Given the project publishes a card taller than the Board", async () => {
    const { origin, trunkSha, cleanup } =
      await materializeRepository(publishedBacklog());
    afterGitHubStops(cleanup);
    await publishCommittedOrigin(page, {
      repoDir: origin,
      revision: trunkSha,
      repository: "terryyin/open-dough",
    });
  });

  for (const viewport of readingViewports) {
    await test.step(`When I open the direct story URL at ${viewport.width}×${viewport.height}`, async () => {
      await page.setViewportSize(viewport);
      await page.goto(destination);
    });
    await test.step("Then the focused card starts at the sticky reading edge", async () => {
      await expect(tallCard(page)).toBeFocused();
      await expectReadingTop(tallCard(page));
    });
    await test.step("And the card is taller than the Board while the document stays still", async () => {
      const room = await boardView(page)
        .scrollRegion()
        .evaluate((scroll) => scroll.clientHeight);
      await expect
        .poll(async () => (await tallCard(page).boundingBox())?.height ?? 0)
        .toBeGreaterThan(room);
      await expectDocumentStill(page);
    });
    await test.step("When I increase only the window height", async () => {
      await page.setViewportSize({
        ...viewport,
        height: viewport.height + 200,
      });
    });
    await test.step("Then the card stays clear of the sticky column heading", () =>
      expectReadingTop(tallCard(page)));
    await test.step("When I restore the original height", async () => {
      await page.setViewportSize(viewport);
    });
    await test.step("Then the card still starts at the reading edge", () =>
      expectReadingTop(tallCard(page)));
  }
});

function tallCard(page: Page) {
  return storyCard(parts(page).backlog, title);
}

function publishedBacklog() {
  const queued = Array.from(Array<undefined>(16).keys(), (index) => {
    const id = `SEED-${index + 11}#story`;
    return makeMe.aBacklogEntry
      .with({
        identity: id,
        title: id === identity ? title : `Queued work number ${index + 1}`,
        href: `seeds/SEED-${index + 11}.md#story`,
      })
      .please();
  });
  return makeMe.aRepository
    .withRevision("tall destination", { backlog: { queued } })
    .please();
}
