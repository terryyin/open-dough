import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { ReadProblem } from "../../src/readProblem.ts";
import { expectDocumentStill, readsWhole } from "./board-accessibility.ts";
import {
  development,
  intent,
  intentChoice,
  mountPerspectiveFrame,
  params,
  perspective,
  project,
  showsProjectBoard,
  showsUnconfiguredIntent,
} from "./development-intent-frame-page.ts";

test("Development and Intent keep their names, marks and selected project's published work", async () => {
  await mountPerspectiveFrame();
  await showsProjectBoard("Open Dough");
  const marks = perspective.element().querySelectorAll("svg");
  expect(marks).toHaveLength(2);
  expect(
    [...marks].map((mark) => mark.getAttribute("data-perspective-mark")),
  ).toEqual(["development", "intent"]);
  expect([...marks].map((mark) => mark.getAttribute("aria-hidden"))).toEqual([
    "true",
    "true",
  ]);
  expect(marks.item(0).innerHTML).not.toBe(marks.item(1).innerHTML);
  expect(
    [
      ...perspective
        .element()
        .querySelectorAll("label > span:not(.frame-tooltip)"),
    ].map((mark) => mark.textContent),
  ).toEqual(["", ""]);
  await expect
    .element(page.getByRole("radio", { name: "Structure", exact: true }))
    .not.toBeInTheDocument();
  const before = history.length;

  await intentChoice.click();
  await showsUnconfiguredIntent("Open Dough");
  await expect.element(project("Open Dough")).toBeChecked();
  expect(history.length).toBe(before + 1);
  expect(params().get("project")).toBeNull();
  expect(params().get("perspective")).toBe("intent");

  await project("Doughnut").click();
  await expect.element(project("Doughnut")).toBeChecked();
  await showsUnconfiguredIntent("Doughnut");
  await expect
    .element(
      page.getByText(/Published work read at revision d7d7d7d, retrieved/),
    )
    .toBeInTheDocument();
  expect(params().get("project")).toBe("doughnut");
  expect(params().get("perspective")).toBe("intent");

  await development.click();
  await showsProjectBoard("Doughnut");
  expect(params().get("project")).toBe("doughnut");
  expect(params().get("perspective")).toBeNull();
});

test("at a phone width the perspective stays reachable under the compact title, and choosing a project there keeps Intent", async () => {
  const height = 844;
  await mountPerspectiveFrame({ width: 390, height });
  const compact = page.getByRole("button", { name: "Project", exact: true });
  await expect.element(compact).toHaveTextContent("Open Dough");
  await intentChoice.click();
  await showsUnconfiguredIntent("Open Dough");
  await compact.click();
  await page.getByRole("option", { name: "Doughnut", exact: true }).click();
  await expect.element(compact).toHaveTextContent("Doughnut");
  await expect.element(compact).toHaveFocus();
  const explanation = await showsUnconfiguredIntent("Doughnut");
  expect(params().get("project")).toBe("doughnut");
  expect(params().get("perspective")).toBe("intent");
  const banner = page.getByRole("banner").element().getBoundingClientRect();
  const choice = perspective.element().getBoundingClientRect();
  expect(banner.top).toBe(0);
  expect(banner.height).toBeLessThan(height / 4);
  expect(choice.left).toBeGreaterThanOrEqual(0);
  expect(choice.right).toBeLessThanOrEqual(innerWidth);
  expect(choice.top).toBeGreaterThanOrEqual(banner.top);
  expect(choice.bottom).toBeLessThanOrEqual(banner.bottom);
  const content = intent.element().getBoundingClientRect();
  expect(content.top).toBeGreaterThanOrEqual(banner.bottom);
  expect(content.top).toBeLessThan(height);
  expect(readsWhole(explanation.element())).toBe(true);
  expectDocumentStill();
});

test("with the published read failed, Intent still says only that no intent locations are configured, and Development keeps the read problem", async () => {
  const message =
    "The published backlog (.planning/PRODUCT-BACKLOG.md) is missing or inaccessible in Open Dough (HTTP 404).";
  await mountPerspectiveFrame(undefined, { failure: new ReadProblem(message) });
  const problem = page.getByRole("alert").filter({ hasText: message });
  async function expectFailedDevelopmentRead() {
    await expect
      .element(
        problem.getByRole("heading", {
          name: "Published work could not be read",
        }),
      )
      .toBeVisible();
    await expect
      .element(problem.getByText(message, { exact: true }))
      .toBeVisible();
    await expect
      .element(
        problem.getByText(
          /No published work is shown, because none has been read\./,
        ),
      )
      .toBeVisible();
    await expect
      .element(
        problem.getByText("Reload the page to read again.", { exact: true }),
      )
      .toBeVisible();
    await expect.element(project("Open Dough")).toBeChecked();
    for (const snapshot of [
      page.getByRole("region", { name: "Board", exact: true }),
      page.getByRole("article"),
      page.getByText(
        /\d+ entr(y|ies)|entries are recorded|Reading published work/,
      ),
      page.getByRole("heading", { name: "Near-future direction" }),
    ])
      await expect.element(snapshot).not.toBeInTheDocument();
  }
  await expectFailedDevelopmentRead();

  await intentChoice.click();
  await showsUnconfiguredIntent("Open Dough");
  await expect
    .element(problem.getByText(message, { exact: true }))
    .toBeVisible();
  await development.click();
  await expectFailedDevelopmentRead();
});
