import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading as board, storyCard } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";
import {
  projectRadio,
  projectViewport,
  readsDirection,
  showsProjectBoard,
} from "./project-navigation-frame.ts";

const identity = "SEED-777#shared-story";
const canonicalPath = "seeds/SEED-777-shared.md#shared-story";
const openDoughTitle = "Open Dough's telling of the shared story";
const doughnutTitle = "Doughnut's telling of the shared story";

function projectWithSharedStory({
  id,
  label,
  repository,
  revision,
  title,
  number,
}: {
  id: string;
  label: string;
  repository: string;
  revision: string;
  title: string;
  number: number;
}) {
  const source = makeMe.aPublishedSource
    .with({ id, label, repository })
    .please();
  const shared = story(title, 777, {
    identity,
    canonical: {
      kind: "snapshot",
      recorded: canonicalPath,
      revision,
      url: `https://github.com/${repository}/blob/${revision}/.planning/${canonicalPath}`,
    },
  });
  return boardWork([shared, story(`${label}'s own queued story`, number)], {
    source,
    revision,
    taken: [story(`${label}'s own taken story`, number + 10)],
    direction: `Show ${label}'s own published direction.`,
  });
}

const openDough = projectWithSharedStory({
  id: "open-dough",
  label: "Open Dough",
  repository: "terryyin/open-dough",
  revision: "d0".repeat(20),
  title: openDoughTitle,
  number: 301,
});
const doughnut = projectWithSharedStory({
  id: "doughnut",
  label: "Doughnut",
  repository: "nerds-odd-e/doughnut",
  revision: "9f".repeat(20),
  title: doughnutTitle,
  number: 302,
});

async function showsOwnCanonicalRecord(work: PublishedWork, title: string) {
  const card = storyCard(title);
  await card
    .getByRole("button", { name: "Inspect story", exact: true })
    .click();
  const link = card
    .getByRole("region", { name: `Detail for ${title}` })
    .getByRole("link", { name: /^Canonical record/ });
  await expect
    .element(link)
    .toHaveAttribute(
      "href",
      `https://github.com/${work.source.repository}/blob/${work.revision}/.planning/${canonicalPath}`,
    );
  await expect.element(card.getByText(identity, { exact: true })).toBeVisible();
}

test("choosing a project shows its own Board, keeps shared identities separate, and re-asks the ref on return", async () => {
  const frame = await mountBoardFrame(
    openDough,
    projectViewport,
    "stories",
    {},
    {
      otherWork: [doughnut],
    },
  );
  const openCard = storyCard(openDoughTitle);
  const doughnutCard = storyCard(doughnutTitle);
  await showsProjectBoard(openDough);
  await readsDirection(openDough.direction);
  expect(frame.snapshotAsks).toEqual([
    { sourceId: "open-dough", revision: undefined },
  ]);
  await openCard.getByRole("heading", { name: openDoughTitle }).click();
  await board.expectStorySelection(openCard, true);

  await projectRadio("Doughnut").click();
  await showsProjectBoard(doughnut);
  await readsDirection(doughnut.direction);
  await board.expectStorySelection(doughnutCard, false);
  expect(frame.snapshotAsks).toEqual([
    { sourceId: "open-dough", revision: undefined },
    { sourceId: "doughnut", revision: undefined },
  ]);
  await doughnutCard.getByRole("heading", { name: doughnutTitle }).click();
  await board.expectStorySelection(doughnutCard, true);
  await showsOwnCanonicalRecord(doughnut, doughnutTitle);

  await projectRadio("Open Dough").click();
  await showsProjectBoard(openDough);
  await readsDirection(openDough.direction);
  await board.expectStorySelection(openCard, false);
  await showsOwnCanonicalRecord(openDough, openDoughTitle);
  expect(frame.snapshotAsks).toEqual([
    { sourceId: "open-dough", revision: undefined },
    { sourceId: "doughnut", revision: undefined },
    { sourceId: "open-dough", revision: undefined },
  ]);
});

test("choosing an empty project announces both empty columns and no near-future direction", async () => {
  const empty = makeMe.aPublishedWork
    .of(doughnut.source)
    .at(doughnut.revision)
    .please();
  await mountBoardFrame(
    openDough,
    projectViewport,
    "stories",
    {},
    {
      otherWork: [empty],
    },
  );
  await showsProjectBoard(openDough);
  await projectRadio("Doughnut").click();
  await showsProjectBoard(empty);
  for (const column of ["Taken", "Backlog"] as const) {
    const region = board.column(column);
    await expect
      .element(
        region.getByText(`No ${column} entries are recorded.`, { exact: true }),
      )
      .toBeVisible();
    await expect
      .element(region.getByText("0 entries", { exact: true }))
      .toBeVisible();
  }
  await readsDirection("No near-future direction is recorded.");
  await expect.element(page.getByRole("alert")).not.toBeInTheDocument();
});
