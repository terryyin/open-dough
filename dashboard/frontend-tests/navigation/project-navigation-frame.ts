import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

export const projectViewport = { width: 1440, height: 900 };

function projectWork(
  id: string,
  label: string,
  number: number,
  revision: string,
) {
  return boardWork([story(`${label}'s own queued story`, number)], {
    id,
    label,
    revision,
    direction: `Show ${label}'s own published direction.`,
    taken: [story(`${label}'s own taken story`, number + 10)],
  });
}

export const openDough = projectWork(
  "open-dough",
  "Open Dough",
  301,
  "0d".repeat(20),
);
export const doughnut = projectWork(
  "doughnut",
  "Doughnut",
  302,
  "d7".repeat(20),
);
export const pygardon = projectWork(
  "pygardon",
  "Pygardon",
  303,
  "c1".repeat(20),
);
export const terryTalks = projectWork(
  "terry-talks",
  "Terry Talks",
  304,
  "a4".repeat(20),
);

export function mountProjectCatalog(
  view: "stories" | "roster" = "stories",
  viewport = projectViewport,
) {
  return mountBoardFrame(
    openDough,
    viewport,
    view,
    {},
    {
      otherWork: [doughnut, pygardon, terryTalks],
    },
  );
}

export const projectRadio = (label: string) =>
  page
    .getByRole("radiogroup", { name: "Project", exact: true })
    .getByRole("radio", {
      name: label,
      exact: true,
    });
export const route = () => new URL(location.href).searchParams;

export function focus(control: Locator) {
  const element = control.element();
  if (!(element instanceof HTMLElement))
    throw new Error("Expected a focusable HTML control.");
  element.focus();
}

export async function showsProjectBoard(work: PublishedWork) {
  await expect.element(projectRadio(work.source.label)).toBeChecked();
  await readsProjectBoard(work);
}

export async function readsProjectBoard(work: PublishedWork) {
  await expect
    .element(
      page.getByRole("button", {
        name: `Start session in ${work.source.label}`,
        exact: true,
      }),
    )
    .toBeVisible();
  await expect
    .element(
      page.getByText(
        `Published work read at revision ${work.revision.slice(0, 7)},`,
        { exact: false },
      ),
    )
    .toBeVisible();
  for (const [column, entries] of [
    ["Backlog", work.backlog],
    ["Taken", work.taken],
  ] as const) {
    const stories = board.column(column).getByRole("article");
    await expect
      .poll(() =>
        stories.elements().map((card) => card.getAttribute("aria-label")),
      )
      .toEqual(entries.map(({ title }) => title));
  }
}

export async function readsDirection(direction: string) {
  await page
    .getByRole("heading", { name: "Near-future direction", exact: true })
    .click();
  await expect
    .element(page.getByText(direction, { exact: true }))
    .toBeVisible();
}
