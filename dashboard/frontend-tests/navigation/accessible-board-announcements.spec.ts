import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { ReadProblem } from "../../src/readProblem.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import {
  expectDocumentStill,
  readsWhole,
  tabTo,
  zoomedViewport,
} from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

const earlierStory = story("Read the earlier work", 10);
const updatedStory = story("Read the updated work", 11);
const before = boardWork([earlierStory], {
  retrievedAt: new Date("2026-11-21T10:00:00Z"),
});
const after = boardWork([updatedStory], {
  revision: "b".repeat(40),
  retrievedAt: new Date("2026-11-21T11:00:00Z"),
});
const limited =
  "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403).";
const missing =
  "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).";
const currentStatus = () =>
  page.getByRole("status").filter({
    has: page.getByText(
      /Published work read at revision|Reading published work/,
    ),
  });
const settings = () =>
  page.getByRole("button", { name: "System settings", exact: true });
const card = (title: string) =>
  board.column("Backlog").getByRole("article", { name: title, exact: true });

test("accessible Board announces reading, the read result, and a failure while focus stays where it is", async () => {
  const mounted = await mountBoardFrame(before, { width: 1440, height: 900 });
  await expect.element(card(earlierStory.title)).toBeVisible();
  await expect
    .poll(() => currentStatus().element().textContent.trim())
    .toMatch(/^Published work read at revision aaaaaaa, retrieved .+\.$/);
  const status = currentStatus().element();
  const notice = status.parentElement?.querySelector(
    ".announcement[aria-live='polite']",
  );
  for (const region of [status, notice]) {
    if (region === null || region === undefined)
      throw new Error("An announcement region is missing.");
    expect(region.isConnected).toBe(true);
    for (
      let element: Element | null = region;
      element !== null;
      element = element.parentElement
    ) {
      const style = getComputedStyle(element);
      expect(style.display).not.toBe("none");
      expect(style.visibility).toBe("visible");
      expect(element.getAttribute("aria-hidden")).not.toBe("true");
    }
  }
  expect(notice).toBeEmptyDOMElement();
  const firstRetrieved = status.querySelector("time")?.getAttribute("datetime");
  expect(firstRetrieved).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(
    status.querySelector(".visually-hidden")?.getBoundingClientRect(),
  ).toMatchObject({ width: 1, height: 1 });
  await tabTo(settings().element());
  await expect.element(settings()).toHaveFocus();

  let answer: (work: PublishedWork) => void = () => {
    throw new Error("The refresh was not prepared.");
  };
  const next = new Promise<PublishedWork>((resolve) => {
    answer = resolve;
  });
  mounted.queueSnapshot(next);
  const asksBefore = mounted.snapshotAsks.length;
  await expect.poll(() => mounted.subscriptionCount()).toBeGreaterThan(0);
  mounted.revisionChanged(after.revision);
  await expect
    .poll(() => currentStatus().element().textContent.trim())
    .toBe(
      "Reading published work… What is shown is still the snapshot retrieved earlier.",
    );
  expect(currentStatus().element()).toBe(status);
  expect(status.getBoundingClientRect().height).toBeGreaterThanOrEqual(16);
  await expect.element(card(earlierStory.title)).toBeVisible();
  await expect.element(settings()).toHaveFocus();
  await expect
    .poll(() => mounted.snapshotAsks.length)
    .toBeGreaterThan(asksBefore);
  expect(mounted.snapshotAsks.at(-1)).toEqual({
    sourceId: before.source.id,
    revision: after.revision,
  });

  answer(after);
  await expect.element(card(updatedStory.title)).toBeVisible();
  await expect.element(card(earlierStory.title)).not.toBeInTheDocument();
  await expect
    .poll(() => currentStatus().element().textContent.trim())
    .toMatch(/^Published work read at revision bbbbbbb, retrieved .+\.$/);
  expect(currentStatus().element()).toBe(status);
  expect(
    status.parentElement?.querySelector(".announcement[aria-live='polite']"),
  ).toBe(notice);
  expect(notice).toBeEmptyDOMElement();
  const secondRetrieved = status
    .querySelector("time")
    ?.getAttribute("datetime");
  expect(secondRetrieved).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  expect(secondRetrieved).not.toBe(firstRetrieved);
  expect(
    status.querySelector(".visually-hidden")?.getBoundingClientRect(),
  ).toMatchObject({ width: 1, height: 1 });
  await expect.element(settings()).toHaveFocus();

  const asks = mounted.snapshotAsks.length;
  await expect.poll(() => mounted.subscriptionCount()).toBeGreaterThan(0);
  mounted.revisionCheckFailed(new ReadProblem(limited, undefined, "transient"));
  await expect
    .element(page.getByRole("alert").getByText(limited, { exact: true }))
    .toBeVisible();
  expect(mounted.snapshotAsks).toHaveLength(asks);
  expect(status).toBeEmptyDOMElement();
  expect(status.isConnected).toBe(true);
  await expect.element(settings()).toHaveFocus();
});

test("accessible Board keeps a read problem and the retained work reachable in a narrow window", async () => {
  const mounted = await mountBoardFrame(before, zoomedViewport);
  await expect.element(card(earlierStory.title)).toBeVisible();
  await tabTo(settings().element());
  mounted.queueSnapshot(new ReadProblem(missing));
  mounted.revisionChanged("f".repeat(40));
  const problem = page.getByRole("alert");
  await expect
    .element(problem.getByText(missing, { exact: true }))
    .toBeVisible();
  await expect
    .element(
      problem.getByText(/What is shown is the earlier snapshot, retrieved at/),
    )
    .toBeVisible();
  expect(problem.element().querySelectorAll("time")).toHaveLength(2);
  const region = problem.element();
  const retained = card(earlierStory.title).element();
  expect(region.getBoundingClientRect().bottom).toBeLessThan(
    retained.getBoundingClientRect().top,
  );
  expect(
    readsWhole(problem.getByText(missing, { exact: true }).element(), region),
  ).toBe(true);
  expectDocumentStill();
  const problemText = problem.getByText(missing, { exact: true }).element();
  problemText.scrollIntoView({ block: "nearest" });
  await expect.poll(() => board.inReadingRoom(problemText)).toBe(true);
  const inspect = card(earlierStory.title)
    .getByRole("button", { name: "Inspect story" })
    .element();
  inspect.scrollIntoView({ block: "nearest" });
  await expect.poll(() => board.inReadingRoom(inspect)).toBe(true);
  expectDocumentStill();
  await expect.element(settings()).toHaveFocus();
});
