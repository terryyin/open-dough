import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { agentNames } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { expectDocumentStill } from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { mountBoard, positionKey, withBoardStorage } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, longBacklog } from "./board-work.ts";

test("the agent roster scrolls below its stationary banner without scrolling the document", async () => {
  const work = boardWork([], {
    roster: {
      status: "read",
      members: agentNames.map((name) => ({ name, profile: undefined })),
    },
  });
  await mountBoardFrame(work, { width: 700, height: 800 }, "roster");
  const roster = page.getByRole("region", { name: "Agent roster" });
  await expect
    .element(roster.getByText(/agent profiles published at revision aaaaaaa/))
    .toBeVisible();
  const last = roster.getByRole("listitem").last();
  await expect.element(last).toBeInTheDocument();
  const scrolling = roster.element().closest(".roster-scroll");
  if (!(scrolling instanceof HTMLElement))
    throw new Error("The roster has no scroll region.");
  const banner = page.getByRole("banner").element();
  const before: unknown = banner.getBoundingClientRect().toJSON();
  await userEvent.wheel(
    roster.getByRole("heading", { name: "Agent roster" }).element(),
    { delta: { y: 600 } },
  );
  await expect.poll(() => scrolling.scrollTop).toBeGreaterThan(0);
  expect(banner.getBoundingClientRect().toJSON()).toEqual(before);
  expectDocumentStill();
  last.element().scrollIntoView({ block: "nearest" });
  await expect
    .poll(() => {
      const part = last.element().getBoundingClientRect();
      const room = scrolling.getBoundingClientRect();
      return part.top >= room.top && part.bottom <= room.bottom;
    })
    .toBe(true);
  expectDocumentStill();
});

test("a classic Board scrollbar's width owns the Column boundary and keeps a saved position", async () => {
  withBoardStorage("1");
  const track = document.head.appendChild(document.createElement("style"));
  track.textContent = ".board-scroll::-webkit-scrollbar { width: 15px; }";
  onTestFinished(() => {
    track.remove();
  });
  const work = boardWork(longBacklog);
  const reading = await mountBoard([work], { width: 1152, height: 800 });
  const controls = [`Backlog ${longBacklog.length} entries`];
  await board.shows(["Taken", "Recently done"], controls);
  const scroller = board.view().closest(".board-scroll");
  if (!(scroller instanceof HTMLElement))
    throw new Error("The Board has no scroll region.");
  expect(scroller.offsetWidth - scroller.clientWidth).toBeGreaterThanOrEqual(
    15,
  );
  expect(scroller.clientWidth).toBeLessThan(1152);
  expect(localStorage.getItem(positionKey)).toBe("1");
  reading.restart(1);
  await board.shows(["Taken", "Recently done"], controls);
  expect(localStorage.getItem(positionKey)).toBe("1");
});
