import { createElement } from "react";
import { expect, onTestFinished, test, vi } from "vitest";
import { page } from "vitest/browser";
import { useProjectConfiguration } from "../../src/projectList.tsx";
import { ReadProblem } from "../../src/readProblem.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  controlContrast,
  decorativeIcon,
  expectDocumentStill,
  narrowViewport,
  readsWhole,
  textContrast,
  zoomedViewport,
} from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { withBoardStorage } from "./board-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

vi.mock(import("../../src/projectList.tsx"), async (original) => ({
  ...(await original()),
  useProjectConfiguration: vi.fn(),
}));

const direction = () =>
  page.getByRole("heading", { name: "Near-future direction" });
const start = () =>
  page.getByRole("button", { name: "Start session in Open Dough" });
const settings = () =>
  page.getByRole("button", { name: "System settings", exact: true });

function expectPassiveProductMark(mark: Element) {
  if (!(mark instanceof HTMLImageElement))
    throw new Error("The product mark is missing.");
  const { left, top, width, height } = mark.getBoundingClientRect();
  const imagePixels = /^\/icon-(\d+)\.png$/.exec(
    mark.getAttribute("src") ?? "",
  )?.[1];
  expect(width).toBeCloseTo(height, 1);
  expect(width).toBeGreaterThanOrEqual(16);
  expect(width * 2).toBeLessThanOrEqual(Number(imagePixels));
  expect(mark.tabIndex).toBe(-1);
  expect(
    mark.closest("a, button, summary, label, [role], [tabindex]"),
  ).toBeNull();
  expect(document.elementFromPoint(left + width / 2, top + height / 2)).toBe(
    mark,
  );
}

test("the row below the banner and the Board read clearly in the frame's look", async () => {
  withBoardStorage("0");
  const purpose = "Make publishing easier to follow.";
  await mountBoardFrame(
    boardWork([story("Read the next work", 60)], { direction: purpose }),
    { width: 1440, height: 900 },
  );
  await board.shows(["Backlog", "Taken", "Recently done"], []);
  await expect
    .poll(() => start().element().textContent.trim())
    .toBe("Start session");
  const disclosure = direction().element().closest("summary");
  if (disclosure === null) throw new Error("Direction has no disclosure.");
  decorativeIcon(start().element());
  textContrast(start().element());
  controlContrast(start().element());
  decorativeIcon(disclosure);
  textContrast(direction().element());
  for (const column of ["Backlog", "Taken"] as const) {
    const group = board.column(column);
    textContrast(
      group.getByRole("heading", { name: column, exact: true }).element(),
    );
    textContrast(group.getByText(/^\d+ entr(y|ies)$/).element());
  }
  for (const { width, height } of [narrowViewport, zoomedViewport]) {
    await page.viewport(width, height);
    await board.shows(["Backlog"], ["Taken 1 entry"]);
    for (const part of [start(), direction()])
      expect(readsWhole(part.element())).toBe(true);
    expectDocumentStill();
  }
  await direction().click();
  const message = page.getByText(purpose, { exact: true });
  await expect.element(message).toBeVisible();
  expect(readsWhole(message.element())).toBe(true);
});

test("an empty column and a failed read are said in the frame's look, whole in a narrow window", async () => {
  withBoardStorage("0");
  const frame = await mountBoardFrame(
    boardWork([], { taken: [] }),
    narrowViewport,
  );
  const empty = board
    .column("Backlog")
    .getByText("No Backlog entries are recorded.", { exact: true });
  await expect.element(empty).toBeVisible();
  textContrast(empty.element());
  const message =
    "GitHub limited the rate of the local GitHub CLI's requests (HTTP 403).";
  frame.revisionCheckFailed(new ReadProblem(message, undefined, "transient"));
  const alert = page.getByRole("alert");
  const heading = alert.getByRole("heading", {
    name: "Published work could not be read",
    exact: true,
  });
  await expect.element(heading).toBeVisible();
  await expect.element(alert.getByText(message, { exact: true })).toBeVisible();
  decorativeIcon(heading.element());
  for (const { width, height } of [narrowViewport, zoomedViewport]) {
    await page.viewport(width, height);
    for (const text of alert.element().querySelectorAll("h2, p")) {
      textContrast(text);
      expect(readsWhole(text)).toBe(true);
    }
    expectDocumentStill();
  }
});

test("no projects configured reads clearly and whole in a narrow window", async () => {
  vi.mocked(useProjectConfiguration).mockReturnValue({
    projects: [],
    problem: undefined,
    replaceProjects: () => {},
  });
  const url = location.href;
  const state: unknown = history.state;
  onTestFinished(() => {
    history.replaceState(state, "", url);
  });
  const { App } = await import("../../src/App.tsx");
  await mountComponent(createElement(App), { viewport: narrowViewport });
  const heading = page.getByRole("heading", {
    name: "No projects configured",
    exact: true,
  });
  const guidance = page.getByText(
    "Open System settings → Projects to add a project and see its published work and start sessions.",
    { exact: true },
  );
  await expect.element(heading).toBeVisible();
  textContrast(heading.element());
  textContrast(guidance.element());
  for (const { width, height } of [narrowViewport, zoomedViewport]) {
    await page.viewport(width, height);
    const mark = page
      .getByRole("banner")
      .getByRole("img", { name: "Open Dough", exact: true });
    await expect.element(mark).toBeVisible();
    expectPassiveProductMark(mark.element());
    const rect = settings().element().getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(innerWidth);
    expect(rect.bottom).toBeLessThanOrEqual(innerHeight);
    expect(readsWhole(guidance.element())).toBe(true);
    expectDocumentStill();
  }
  await settings().click();
  await expect
    .element(
      page.getByRole("heading", { name: "System settings", exact: true }),
    )
    .toHaveFocus();
  const settingsMark = page
    .getByRole("main")
    .getByRole("img", { name: "Open Dough", exact: true });
  await expect.element(settingsMark).toBeVisible();
  expectPassiveProductMark(settingsMark.element());
  await page.getByRole("button", { name: "Back to dashboard" }).click();
  await expect.element(heading).toBeVisible();
  await expect
    .element(page.getByRole("banner").getByRole("img", { name: "Open Dough" }))
    .toBeVisible();
});
