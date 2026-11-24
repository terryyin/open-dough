import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { browserSession } from "../review/browser-session.ts";
import { boardReading, center, pointInBrowser } from "./board-reading-page.ts";
import { tapWhereShown } from "./board-touch-page.ts";
import { consumer, farDone } from "./story-reference-done-fixture.ts";

export const recent = boardReading.column("Recently done");
export const consumerCard = boardReading
  .column("Backlog")
  .getByRole("article", {
    name: consumer.title,
    exact: true,
  });
export const referenceNotice = page.getByRole("status", {
  name: "Story reference navigation",
  exact: true,
});
// A Recently done card named by its identity until its body is read, then by
// its title.
export const doneDestination = ({ identity, title }: typeof farDone) =>
  recent.getByRole("article", {
    name: new RegExp(`^(?:${identity}|${title})$`),
  });
export const farDestination = doneDestination(farDone);
export const farDestinationReading = farDestination.getByText(
  "Reading done story…",
  { exact: true },
);
export const farReferencePending = referenceNotice.getByText(
  `Reading Open Dough to find ${farDone.identity}…`,
  { exact: true },
);
export const destinationCues = () => [
  ...document.querySelectorAll(".story-card-destination-cue"),
];
export const dismissReference = referenceNotice.getByRole("button", {
  name: "Dismiss story reference",
});
export const latestDone = recent.getByRole("button", {
  name: "Show latest 10",
  exact: true,
});
export const ownAction = consumerCard.getByRole("button", {
  name: /^(Inspect story|Hide detail)$/,
});
export const ownDetail = consumerCard.getByRole("region", {
  name: `Detail for ${consumer.title}`,
});

export const reference = (name: string) =>
  consumerCard
    .getByRole("list", {
      name: "Story dependencies",
      exact: true,
    })
    .getByRole("link", { name, exact: true });

export const dependencySummary = (blocking: number) =>
  consumerCard.getByText(`Dependencies · ${blocking} blocking`, {
    exact: true,
  });

export async function openDependencies(
  using: "pointer" | "touch" = "pointer",
  blocking = 4,
) {
  const summary = dependencySummary(blocking);
  if (using === "pointer") await summary.click();
  else {
    await expect.element(summary).toBeVisible();
    await tapWhereShown(summary.element());
  }
}

export async function followLink(
  link: Locator,
  using: "pointer" | "keyboard" = "pointer",
) {
  if (using === "pointer") await link.click();
  else {
    await expect.element(link).toBeVisible();
    (link.element() as HTMLElement).focus();
    await userEvent.keyboard("{Enter}");
  }
}

export const followReference = (
  name: string,
  using: "pointer" | "keyboard" = "pointer",
) => followLink(reference(name), using);

export async function showsDoneEntries(names: readonly string[]) {
  await expect
    .poll(() =>
      recent
        .getByRole("article")
        .elements()
        .map((card) => card.querySelector("h3")?.textContent),
    )
    .toEqual(names);
}

export async function showsReached(card: Locator) {
  await expect.element(card).toHaveFocus();
  await expect
    .poll(() => {
      const area = card.element().getBoundingClientRect();
      const room = boardReading.room();
      const width = Math.max(
        0,
        Math.min(area.right, room.right) - Math.max(area.left, room.left),
      );
      const height = Math.max(
        0,
        Math.min(area.bottom, room.bottom) - Math.max(area.top, room.top),
      );
      return (width * height) / (area.width * area.height);
    })
    .toBeGreaterThanOrEqual(0.5);
}

export async function showsReadingTop(card: Locator) {
  await expect
    .poll(() => {
      const element = card.element();
      const room = element.closest(".board-scroll");
      const heading = recent.element().querySelector(".column-header");
      if (!room || !heading)
        throw new Error("Expected the Board reading room and heading.");
      const top = element.getBoundingClientRect().top;
      const edge =
        room.getBoundingClientRect().top +
        Number.parseFloat(getComputedStyle(room).scrollPaddingTop) +
        Number.parseFloat(getComputedStyle(element).scrollMarginTop);
      return (
        Math.abs(top - edge) <= 1 &&
        top >= heading.getBoundingClientRect().bottom
      );
    })
    .toBe(true);
}

export async function pointerDownOn(control: Locator) {
  await expect.element(control).toBeVisible();
  const element = control.element();
  element.scrollIntoView({ block: "nearest", inline: "nearest" });
  const point = pointInBrowser(center(element));
  const mouse = (type: "mousePressed" | "mouseReleased") =>
    browserSession().send("Input.dispatchMouseEvent", {
      type,
      button: "left",
      clickCount: 1,
      ...point,
    });
  await mouse("mousePressed");
  return () => mouse("mouseReleased");
}
