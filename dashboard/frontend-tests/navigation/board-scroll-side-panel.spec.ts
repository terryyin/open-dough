import { expect, onTestFinished, test } from "vitest";
import { page } from "vitest/browser";
import { expectDocumentStill } from "./board-accessibility.ts";
import { reducedBoardMotion } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { scroller } from "./board-session-view.ts";
import { longBacklog } from "./board-work.ts";
import {
  banner,
  button,
  covering,
  divider,
  drag,
  measured,
  mountWidthReview,
  panel,
  withWidthStorage,
} from "./side-panel-width-view.ts";

const bounds = (element: Element) => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
};

test("the Board alone scrolls with an open Side panel at 1400×420", async () => {
  withWidthStorage();
  await reducedBoardMotion();
  const track = document.head.appendChild(document.createElement("style"));
  track.textContent = ".board-scroll::-webkit-scrollbar { width: 15px; }";
  onTestFinished(() => {
    track.remove();
  });
  const { story } = await mountWidthReview(
    { width: 1400, height: 420 },
    longBacklog,
  );
  const card = board
    .column("Taken")
    .getByRole("article", { name: story.title, exact: true })
    .element();
  const region = scroller(card);
  const initial = {
    panel: bounds(panel.element()),
    banner: bounds(banner.element()),
    region: bounds(region),
  };
  expect(initial.region.y).toBeCloseTo(
    initial.banner.y + initial.banner.height,
    0,
  );
  expect(document.documentElement.scrollHeight).toBe(innerHeight);
  expect(getComputedStyle(region).overflowY).toBe("auto");
  const cardTop = card.getBoundingClientRect().top;
  const readTo = board.position() + 600;
  await board.wheelTo(readTo);
  expect(card.getBoundingClientRect().top).toBeLessThan(cardTop - 500);
  const stationary = () => {
    expect(bounds(panel.element())).toEqual(initial.panel);
    expect(bounds(banner.element())).toEqual(initial.banner);
    expect(bounds(region)).toEqual(initial.region);
    expectDocumentStill();
  };
  stationary();

  const edge = region.getBoundingClientRect();
  const point = { x: edge.right - 3, y: edge.bottom - 24 };
  expect(
    document.elementFromPoint(point.x, point.y)?.closest(".panel-divider") ??
      null,
  ).toBeNull();
  expect(edge.right).toBeCloseTo(measured().panel.left, 0);
  expect(edge.right).toBeLessThanOrEqual(
    divider.element().getBoundingClientRect().left,
  );
  expect(region.offsetWidth - region.clientWidth).toBe(15);
  const position = board.position();
  await button("Maximize").click();
  await expect.element(banner).not.toBeInTheDocument();
  await button("Restore").click();
  await expect.element(banner).toBeVisible();
  await expect.poll(board.position).toBe(position);
  stationary();
  await drag(60);
  await expect
    .poll(() => Math.round(measured().panel.width))
    .toBe(Math.round(initial.panel.width) - 60);
  expect(board.position()).toBeGreaterThan(0);
  expect(bounds(banner.element())).toEqual({
    ...initial.banner,
    width: initial.banner.width + 60,
  });
  expectDocumentStill();
});

test("the Board alone scrolls after Close from a covering Side panel at 700×800", async () => {
  withWidthStorage();
  await reducedBoardMotion();
  await mountWidthReview({ width: 700, height: 800 }, longBacklog);
  await covering();
  const box = panel.element().getBoundingClientRect();
  expect(box.width).toBe(innerWidth);
  expect(box.height).toBe(innerHeight);
  await button("Close").click();
  await expect.element(panel).not.toBeInTheDocument();
  await expect.element(page.getByRole("banner")).toBeVisible();
  await board.control("Backlog").click();
  await board.shows(["Backlog"], ["Taken 1 entry"]);
  const first = board.column("Backlog").getByRole("article").first().element();
  const originalTop = first.getBoundingClientRect().top;
  await board.wheelTo(600);
  expect(first.getBoundingClientRect().top).toBeLessThan(originalTop - 500);
  expectDocumentStill();
});
