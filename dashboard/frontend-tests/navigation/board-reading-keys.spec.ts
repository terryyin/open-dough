import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { expectDocumentStill } from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { reducedBoardMotion } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, longBacklog } from "./board-work.ts";

const region = () => page.getByRole("region", { name: "Board", exact: true });
const legend = () =>
  page.getByRole("button", { name: "Preparation badge legend" });

async function longBoard() {
  await reducedBoardMotion();
  const work = boardWork(
    longBacklog.map((entry) => ({
      ...entry,
      preparation: { status: "not-recorded" },
    })),
  );
  await mountBoardFrame(work, { width: 1440, height: 700 });
  await board.shows(["Backlog", "Taken", "Recently done"], []);
}

test("body reading keys use native Board scrolling while focused controls and modal help keep their keys", async () => {
  await longBoard();
  expect(document.activeElement).toBe(document.body);
  await userEvent.keyboard("{End}");
  await expect.poll(board.position).toBe(board.bottom());
  await expect.element(region()).toHaveFocus();
  await userEvent.keyboard("{Home}");
  await expect.poll(board.position).toBe(0);
  await userEvent.keyboard("{PageDown}");
  await expect.poll(board.position).toBeGreaterThan(0);
  const down = board.position();
  await userEvent.keyboard("{PageUp}");
  await expect.poll(board.position).toBeLessThan(down);

  const control = board
    .column("Backlog")
    .getByRole("button", { name: "Inspect story" })
    .first();
  const button = control.element();
  if (!(button instanceof HTMLButtonElement))
    throw new Error("Inspect is missing.");
  button.focus();
  await userEvent.keyboard("{PageDown}");
  await expect.element(control).toHaveFocus();
  await board.wheelTo(40);
  await legend().click();
  const close = page
    .getByRole("dialog", { name: "Preparation badges" })
    .getByRole("button", { name: "Close", exact: true });
  await expect.element(close).toHaveFocus();
  const before = board.position();
  expect(before).toBeGreaterThan(0);
  await userEvent.keyboard("{End}");
  await expect.element(close).toHaveFocus();
  expect(board.position()).toBe(before);
  await userEvent.keyboard("{Escape}");
  await expect.element(legend()).toHaveFocus();
  expect(board.position()).toBe(before);
  expectDocumentStill();
});

test("native modified reading keys move an unfocused Board and preserve modal and app shortcuts", async () => {
  const mac = /Macintosh/.test(navigator.userAgent);
  const down = mac ? "{Meta>}{ArrowDown}{/Meta}" : "{Control>}{End}{/Control}";
  const up = mac ? "{Meta>}{ArrowUp}{/Meta}" : "{Control>}{Home}{/Control}";
  const filler = document.body.appendChild(document.createElement("main"));
  filler.style.height = "5000px";
  filler.textContent = "Native document reading";
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "visible";
  onTestFinished(() => {
    filler.remove();
    document.body.style.overflow = originalOverflow;
  });
  const end = document.documentElement.scrollHeight - innerHeight;
  expect(end).toBeGreaterThan(0);
  await userEvent.keyboard(down);
  await expect.poll(() => window.scrollY).toBe(end);
  await userEvent.keyboard(up);
  await expect.poll(() => window.scrollY).toBe(0);
  filler.remove();
  document.body.style.overflow = originalOverflow;

  await longBoard();
  await userEvent.keyboard(down);
  await expect.element(region()).toHaveFocus();
  await expect.poll(board.position).toBe(board.bottom());
  const current = region().element();
  if (!(current instanceof HTMLElement))
    throw new Error("The Board is missing.");
  current.blur();
  expect(document.activeElement).toBe(document.body);
  await userEvent.keyboard(up);
  await expect.element(region()).toHaveFocus();
  await expect.poll(board.position).toBe(0);
  expectDocumentStill();

  await legend().click();
  const close = page
    .getByRole("dialog")
    .getByRole("button", { name: "Close", exact: true });
  await expect.element(close).toHaveFocus();
  const before = board.position();
  await userEvent.keyboard(down);
  await expect.element(close).toHaveFocus();
  expect(board.position()).toBe(before);
  await userEvent.keyboard("{Escape}");
  const sidebar = page.getByRole("complementary", { name: "Sessions sidebar" });
  await userEvent.keyboard("{Meta>}b{/Meta}");
  await expect.element(sidebar).toBeVisible();
  await userEvent.keyboard("{Meta>}b{/Meta}");
  await expect.element(sidebar).not.toBeInTheDocument();
  expect(board.position()).toBe(before);
});
