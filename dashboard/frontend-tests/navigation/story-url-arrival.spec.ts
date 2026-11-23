import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { emulateMedia } from "../review/browser-session.ts";
import { boardReading } from "./board-reading-page.ts";
import { boardWork, longBacklog, story } from "./board-work.ts";
import {
  coldStoryUrl,
  destination,
  doughnut,
  doughnutStory,
  holdStorySnapshot,
  mountStoryUrl,
  openDoughStory,
  projectChoice,
  revealsOnPage,
  storyCard,
  storyInAddress,
  wide,
} from "./story-url-frame.ts";

test("a cold story URL waits for the named project's read, then reveals and focuses its encoded story", async () => {
  const held = holdStorySnapshot(doughnut);
  coldStoryUrl(doughnut.source.id, doughnutStory.identity);
  const reveals = revealsOnPage();
  const frame = await mountStoryUrl(wide, {
    otherWork: [doughnut],
    initialSnapshot: held.snapshot,
  });
  const card = storyCard(doughnutStory.title);
  await expect.element(projectChoice("Doughnut")).toBeChecked();
  await expect
    .element(destination.getByRole("status"))
    .toHaveTextContent(
      `Waiting to read Doughnut's published work for story ${doughnutStory.identity}.`,
    );
  await expect
    .poll(() => frame.snapshotAsks.map(({ sourceId }) => sourceId))
    .toEqual(["doughnut"]);
  expect(card.query()).toBeNull();
  expect(reveals()).toEqual([]);

  held.release();
  await expect.element(card).toHaveFocus();
  await expect
    .poll(() => boardReading.inReadingRoom(card.element()))
    .toBe(true);
  expect(storyCard(openDoughStory.title).query()).toBeNull();
  expect(storyInAddress()).toBe(doughnutStory.identity);
  expect(location.hash).toBe("");
  await userEvent.keyboard("{Tab}");
  await expect
    .poll(() => card.element().contains(document.activeElement))
    .toBe(true);
  await expect
    .element(page.getByText("Reading preparation…"))
    .not.toBeInTheDocument();

  const beforeInspect = reveals().length;
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect
    .element(card.getByRole("button", { name: "Hide detail" }))
    .toBeVisible();
  // The expansion has passed layout, including any reveal keeper's resize read.
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => setTimeout(resolve, 0)),
  );
  expect(reveals()).toHaveLength(beforeInspect);
  frame.expectNoHostAction();
});

test("a hidden Taken card arrives with reduced motion and useful keyboard focus", async () => {
  await emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const taken = boardWork(longBacklog, {
    id: doughnut.source.id,
    label: doughnut.source.label,
    taken: [doughnutStory],
  });
  coldStoryUrl(taken.source.id, doughnutStory.identity);
  const reveals = revealsOnPage();
  const frame = await mountStoryUrl(
    { width: 650, height: 750 },
    { otherWork: [taken] },
  );
  const card = storyCard(doughnutStory.title);
  await expect.element(card).toHaveFocus();
  await expect
    .poll(() => boardReading.inReadingRoom(card.element()))
    .toBe(true);
  await expect
    .element(
      page
        .getByRole("region", { name: "Board", exact: true })
        .getByRole("region", { name: "Taken" }),
    )
    .toBeVisible();
  expect(
    document.querySelector(".board-row")?.getAttribute("data-hidden"),
  ).toBe("1 3");
  expect(reveals()).toContainEqual({
    title: doughnutStory.title,
    behavior: "auto",
  });
  frame.expectNoHostAction();
});

test("opening a portrait's roster leaves its story target and Back restores the card's keyboard", async () => {
  const taken = story("Read the active story's roster", 402);
  const work = boardWork([], {
    taken: [taken],
    roster: {
      status: "read",
      members: [
        {
          name: "Akiho",
          profile: {
            activity: "execution",
            identity: taken.identity,
            title: taken.title,
            name: "Akiho",
            agent: "Akiho",
            profilePath: ".planning/agents/akiho.md",
            mode: "trunk",
            branch: "origin/main",
            host: "claude",
            model: undefined,
            human: { status: "no-addition" },
          },
        },
      ],
    },
  });
  coldStoryUrl(work.source.id, taken.identity);
  const frame = await mountStoryUrl(wide, {}, work);
  const card = storyCard(taken.title);
  await expect.element(card).toHaveFocus();
  await card
    .getByRole("button", { name: "Show Akiho-chan in the agent roster" })
    .click();
  await expect
    .element(page.getByRole("heading", { name: "Agent roster" }))
    .toBeVisible();
  expect(storyInAddress()).toBeNull();
  history.back();
  await expect.element(card).toBeVisible();
  await expect
    .poll(() => boardReading.inReadingRoom(card.element()))
    .toBe(true);
  await expect
    .poll(() => card.element().contains(document.activeElement))
    .toBe(true);
  expect(storyInAddress()).toBe(taken.identity);
  frame.expectNoHostAction();
});
