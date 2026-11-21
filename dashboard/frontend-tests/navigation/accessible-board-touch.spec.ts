import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { openSessionStartReason } from "../../src/agentLaunch.ts";
import type { MachineSessions } from "../../src/agentLaunches.ts";
import { readDoneRecordBodiesAt } from "../../src/authenticatedDoneRead.ts";
import {
  mountBoard,
  reducedBoardMotion,
  withBoardStorage,
} from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import {
  landscape,
  portrait,
  tapWhereShown,
  useTouchScreen,
} from "./board-touch-page.ts";
import { boardWork, cataloguedDone, story } from "./board-work.ts";

vi.mock(import("../../src/authenticatedDoneRead.ts"), async (original) => ({
  ...(await original()),
  readDoneRecordBodiesAt: vi.fn(),
}));

const identity = `SEED-090#${"a-long-anchor-".repeat(6)}end`;
const title = `Keep a title with ${"Uninterruptedlyconcatenated".repeat(5)} and ordinary words readable across the Board`;
const plan = `slice-plans/090-${"readable-".repeat(12)}overview/PLAN.md`;
const longStory = story(title, 90, {
  identity,
  plan: {
    kind: "external",
    recorded: plan,
    url: `https://example.test/${plan}`,
  },
});
const otherStories = [
  story("Read a hosting note", 91),
  story("Keep a source target readable", 92),
];
const blockedStory = story(
  "Queue trunk integration for agents on the same machine",
  8,
  {
    dependencies: { status: "not-recorded", entries: [], blocking: [] },
  },
);

function donePublication() {
  const newest = makeMe.aDoneRecord
    .completed({
      identity: "SEED-038#card-shows-avatar",
      title: "Card shows avatar",
      completedAt: new Date(Date.now() - 120_000).toISOString(),
    })
    .please();
  const older = makeMe.aDoneRecord
    .completed({
      identity: "SEED-039#done-last-week",
      title: "Finish something last week",
      completedAt: new Date(Date.now() - 240_000).toISOString(),
    })
    .please();
  const { done, readBodies } = cataloguedDone([newest, older]);
  vi.mocked(readDoneRecordBodiesAt).mockImplementation(readBodies);
  return done;
}

function textFitsInCard(part: Element, card: Element) {
  const bounds = card.getBoundingClientRect();
  const range = new Range();
  range.selectNodeContents(part);
  const lines = [...range.getClientRects()];
  return (
    lines.length > 0 &&
    lines.every(
      ({ left, right, height }) =>
        height > 0 && left >= bounds.left - 0.5 && right <= bounds.right + 0.5,
    )
  );
}

const project = () =>
  page.getByRole("button", { name: "Project", exact: true });
async function chooseProject(label: string) {
  await expect.element(project()).toBeVisible();
  await tapWhereShown(project().element());
  const option = page.getByRole("option", { name: label, exact: true });
  await expect.element(option).toBeVisible();
  await tapWhereShown(option.element());
}

test.beforeEach(async () => {
  withBoardStorage("0");
  await useTouchScreen();
  await reducedBoardMotion();
});

test("project and column navigation keep a long story readable and its detail open through rotation", async () => {
  const openDough = boardWork([...otherStories, blockedStory], {
    taken: [longStory, story("Repair the installer's update report", 59)],
    done: donePublication(),
  });
  const doughnut = boardWork([], {
    id: "doughnut",
    label: "Doughnut",
    taken: [],
  });
  const another = boardWork([], {
    id: "read-another",
    label: "Another configured project",
    taken: [],
  });
  await mountBoard([openDough, doughnut, another], portrait);
  await board.shows(["Backlog"], ["Taken 2 entries"]);
  await chooseProject("Doughnut");
  await expect
    .element(
      board
        .column("Backlog")
        .getByText("No Backlog entries are recorded.", { exact: true }),
    )
    .toBeVisible();
  await chooseProject("Open Dough");
  await expect
    .poll(() => board.column("Backlog").getByRole("article").elements().length)
    .toBe(3);

  await tapWhereShown(board.control("Taken").element());
  await board.shows(
    ["Taken"],
    ["Backlog 3 entries", "Recently done 2 entries"],
  );
  const card = board
    .column("Taken")
    .getByRole("article", { name: title, exact: true });
  const heading = card.getByRole("heading", { name: title, exact: true });
  await expect.element(heading).toBeVisible();
  expect(textFitsInCard(heading.element(), card.element())).toBe(true);
  const inspect = card.getByRole("button", { name: "Inspect story" }).element();
  inspect.scrollIntoView({ block: "nearest" });
  await tapWhereShown(inspect);
  const detail = card.getByRole("region", { name: `Detail for ${title}` });
  await expect.element(detail).toBeVisible();
  const parts = [
    heading,
    detail.getByText(identity, { exact: true }),
    detail.getByText(plan, { exact: true }),
  ];
  for (const part of parts) {
    const rendered = part.element();
    rendered.scrollIntoView({ block: "center" });
    await expect.poll(() => board.inReadingRoom(rendered)).toBe(true);
  }
  const hide = card.getByRole("button", { name: "Hide detail" });
  for (const size of [
    portrait,
    landscape,
    { width: 768, height: 1024 },
    portrait,
  ]) {
    await page.viewport(size.width, size.height);
    if (size.width >= 768)
      await board.shows(["Taken", "Recently done"], ["Backlog 3 entries"]);
    else
      await board.shows(
        ["Taken"],
        ["Backlog 3 entries", "Recently done 2 entries"],
      );
    await expect.element(hide).toHaveAttribute("aria-expanded", "true");
    for (const part of parts)
      await expect
        .poll(() => textFitsInCard(part.element(), card.element()))
        .toBe(true);
  }
  const show = hide.element();
  show.scrollIntoView({ block: "nearest" });
  await tapWhereShown(show);
  await expect.element(detail).not.toBeInTheDocument();
  await expect.element(card).toHaveFocus();

  await tapWhereShown(board.control("Recently done").element());
  await board.shows(["Recently done"], ["Taken 2 entries"]);
  const done = board
    .column("Recently done")
    .getByRole("article", { name: "Card shows avatar" });
  await expect.element(done).toBeVisible();
  expect(
    textFitsInCard(done.getByRole("heading").element(), done.element()),
  ).toBe(true);
  await tapWhereShown(board.control("Taken").element());
  await board.shows(
    ["Taken"],
    ["Backlog 3 entries", "Recently done 2 entries"],
  );
  await expect
    .poll(() => project().element().textContent.trim())
    .toBe("Open Dough");
});

test("an open session's disabled Start reason is readable without hover and does not start another session", async () => {
  const { records } = makeMe.aMachineAnswer
    .observingOpen(
      makeMe.aLaunchRecord
        .executing({
          identity: blockedStory.identity,
          title: blockedStory.title,
        })
        .inClaudeSession({ sessionId: "aaaaaaaa-0000-4000-8000-000000000001" })
        .please(),
    )
    .please();
  const start = vi.fn<MachineSessions["start"]>();
  await mountBoard([boardWork([blockedStory])], portrait, {
    records,
    launched: records,
    start,
  });
  await board.shows(["Backlog"], ["Taken 1 entry"]);
  const card = board
    .column("Backlog")
    .getByRole("article", { name: blockedStory.title, exact: true });
  const reason = card.getByText(openSessionStartReason, { exact: true });
  const explanation = reason.element();
  explanation.scrollIntoView({ block: "nearest" });
  expect(matchMedia("(hover: none)").matches).toBe(true);
  await expect.element(reason).toBeVisible();
  expect(board.inReadingRoom(explanation)).toBe(true);
  expect(textFitsInCard(explanation, card.element())).toBe(true);
  for (const name of ["Start execution", "Start refinement"]) {
    const button = card.getByRole("button", { name });
    await expect.element(button).toBeDisabled();
    await expect
      .element(button)
      .toHaveAccessibleDescription(new RegExp(openSessionStartReason));
    button.element().scrollIntoView({ block: "nearest" });
    await tapWhereShown(button.element());
  }
  await expect.element(page.getByRole("dialog")).not.toBeInTheDocument();
  expect(start).not.toHaveBeenCalled();
});
