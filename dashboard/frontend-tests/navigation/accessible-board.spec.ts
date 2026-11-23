import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import dashboardDocument from "../../index.html?raw";
import {
  expectDocumentStill,
  readsWhole,
  zoomedViewport,
} from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { reducedBoardMotion } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

const direction = () =>
  page.getByRole("heading", { name: "Near-future direction" });
const longIdentity = `SEED-090#${"a-long-anchor-".repeat(8)}end`;
const longTitle = `Keep ${"Uninterruptedlyconcatenated".repeat(5)} readable across the Board`;
const longPlan = `slice-plans/090-${"readable-".repeat(12)}overview/PLAN.md`;
const longAddress = `https://example.test/${"unbrokenaddress".repeat(9)}`;
// Backlog markdown cannot carry spaces in hrefs; an anchor-only target stays
// unusable after typed snapshot interpretation and keeps a long unbroken name.
const unusableTarget = `#${"unbrokentarget".repeat(9)}`;
const longPlanUrl = `https://example.test/${longPlan}`;
const longStory = story(longTitle, 90, {
  identity: longIdentity,
  plan: {
    kind: "external",
    recorded: longPlanUrl,
    url: longPlanUrl,
  },
});
const external = story("Read the hosting provider's note", 91, {
  canonical: { kind: "external", recorded: longAddress, url: longAddress },
});
const unusable = story("Keep an unusable target readable", 92, {
  canonical: {
    kind: "unusable",
    recorded: unusableTarget,
    reason: "This is not a complete web address.",
  },
});

test.beforeEach(async () => {
  await reducedBoardMotion();
});

test("accessible Board reflows long published work for a narrow window and page zoom", async () => {
  const directionText = "Derive it solely from Git state.";
  await mountBoardFrame(
    boardWork([external, unusable], {
      direction: directionText,
      taken: [longStory],
    }),
    { width: 1440, height: 900 },
  );
  await board.shows(["Backlog", "Taken", "Recently done"], []);
  const columns = ["Backlog", "Taken", "Recently done"] as const;
  const boxes = columns.map((name) =>
    board.column(name).element().getBoundingClientRect(),
  );
  for (let index = 1; index < boxes.length; index += 1) {
    const previous = boxes[index - 1];
    const current = boxes[index];
    if (previous === undefined || current === undefined)
      throw new Error("The Board is missing a column.");
    expect(current.left - previous.right).toBeGreaterThanOrEqual(0);
    expect(current.left - previous.right).toBeLessThanOrEqual(24);
    expect(current.top).toBe(previous.top);
  }
  expectDocumentStill();

  for (const size of [zoomedViewport, { width: 360, height: 740 }]) {
    await page.viewport(size.width, size.height);
    await board.shows(["Backlog"], ["Taken 1 entry"]);
    expect(direction().element().getBoundingClientRect().bottom).toBeLessThan(
      board.column("Backlog").element().getBoundingClientRect().top,
    );
    await board.control("Taken").click();
    await board.shows(
      ["Taken"],
      ["Backlog 2 entries", "Recently done 0 entries"],
    );
    expect(direction().element().getBoundingClientRect().bottom).toBeLessThan(
      board.column("Taken").element().getBoundingClientRect().top,
    );

    const card = board
      .column("Taken")
      .getByRole("article", { name: longTitle });
    const heading = card.getByRole("heading", { name: longTitle });
    await expect.element(heading).toBeVisible();
    expect(readsWhole(heading.element(), card.element())).toBe(true);
    const inspect = card
      .getByRole("button", { name: "Inspect story" })
      .element();
    if (!(inspect instanceof HTMLButtonElement))
      throw new Error("Inspect is missing.");
    inspect.focus();
    await userEvent.keyboard("{Enter}");
    const detail = card.getByRole("region", {
      name: `Detail for ${longTitle}`,
    });
    const identity = detail.getByText(longIdentity, { exact: true });
    const plan = detail.getByRole("link", {
      name: `Slice plan ${longPlanUrl}`,
      exact: true,
    });
    await expect.element(plan).toHaveAttribute("href", longPlanUrl);
    expect(readsWhole(identity.element(), card.element())).toBe(true);
    expect(readsWhole(plan.element(), card.element())).toBe(true);
    await card.getByRole("button", { name: "Hide detail" }).click();
    await expect.element(detail).not.toBeInTheDocument();

    await board.wheelTo(0);
    await board.control("Backlog").click();
    await board.shows(["Backlog"], ["Taken 1 entry"]);
    for (const [entry, target] of [
      [external, longAddress],
      [unusable, unusableTarget],
    ] as const) {
      const item = board
        .column("Backlog")
        .getByRole("article", { name: entry.title });
      await item.getByRole("button", { name: "Inspect story" }).click();
      const record = item.getByText(target, { exact: true });
      await expect.element(record).toBeVisible();
      expect(readsWhole(record.element(), item.element())).toBe(true);
      if (entry === external) {
        await expect
          .element(
            item.getByRole("link", {
              name: `Canonical record ${target}`,
              exact: true,
            }),
          )
          .toHaveAttribute("href", target);
      } else {
        await expect
          .element(
            item.getByRole("link", {
              name: `Canonical record ${target}`,
              exact: true,
            }),
          )
          .not.toBeInTheDocument();
      }
      await item.getByRole("button", { name: "Hide detail" }).click();
    }
    expectDocumentStill();
    await board.wheelTo(0);
  }

  await direction().click();
  await expect
    .element(page.getByText(directionText, { exact: true }))
    .toBeVisible();
  await expect
    .element(page.getByText(/Published work read at revision aaaaaaa/))
    .toBeInTheDocument();
  const document = new DOMParser().parseFromString(
    dashboardDocument,
    "text/html",
  );
  const viewport = document
    .querySelector("meta[name='viewport']")
    ?.getAttribute("content");
  expect(viewport).toContain("width=device-width");
  expect(viewport).not.toMatch(/user-scalable|maximum-scale|minimum-scale/);
});

test("accessible Board keeps empty groups readable in a narrow window", async () => {
  await mountBoardFrame(boardWork([], { taken: [] }), {
    width: 360,
    height: 740,
  });
  const backlog = board
    .column("Backlog")
    .getByText("No Backlog entries are recorded.", { exact: true });
  await expect.element(backlog).toBeVisible();
  await direction().click();
  const directionText = page.getByText(
    "No near-future direction is recorded.",
    { exact: true },
  );
  await expect.element(directionText).toBeVisible();
  expect(directionText.element().getBoundingClientRect().bottom).toBeLessThan(
    backlog.element().getBoundingClientRect().top,
  );
  await board.control("Taken").click();
  await board.shows(
    ["Taken"],
    ["Backlog 0 entries", "Recently done 0 entries"],
  );
  const taken = board
    .column("Taken")
    .getByText("No Taken entries are recorded.", { exact: true });
  await expect.element(taken).toBeVisible();
  expect(directionText.element().getBoundingClientRect().bottom).toBeLessThan(
    taken.element().getBoundingClientRect().top,
  );
  expect(readsWhole(backlog.element())).toBe(true);
  expect(readsWhole(taken.element())).toBe(true);
  await expect
    .element(page.getByText(/Published work read at revision aaaaaaa/))
    .toBeInTheDocument();
  expectDocumentStill();
});
