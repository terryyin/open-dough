import { expect, vi } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import type { PublishedObservationReadSource } from "../../src/publishedObservationReadSource.ts";
import type { PublishedWork } from "../../src/publishedWork.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import {
  mountBoardFrame,
  type BoardFrameMachine,
} from "./board-frame-mount.ts";
import { boardReading, storyCard } from "./board-reading-page.ts";
import { tapWhereShown } from "./board-touch-page.ts";
import { focus, projectViewport } from "./project-navigation-frame.ts";
import { consumer } from "./story-reference-publication.ts";

export async function mountReferences(
  work: PublishedWork,
  {
    viewport = projectViewport,
    otherWork = [],
    detailFile,
    machine = {},
  }: {
    viewport?: { width: number; height: number };
    otherWork?: readonly PublishedWork[];
    detailFile: PublishedObservationReadSource["readDetailFile"];
    machine?: BoardFrameMachine;
  },
) {
  const { sessions } = pageReadsSupplying({});
  const accept = vi
    .fn<NonNullable<BoardFrameMachine["accept"]>>()
    .mockRejectedValue(
      new Error("Following a story reference does not start an agent."),
    );
  const attach = vi.fn<typeof sessions.openTerminal>(() => {
    throw new Error("Following a story reference does not attach a terminal.");
  });
  const frame = await mountBoardFrame(
    work,
    viewport,
    "stories",
    { ...machine, accept },
    { otherWork, detailFile, sessions: { ...sessions, openTerminal: attach } },
  );
  return {
    ...frame,
    expectNoHostAction() {
      expect(accept).not.toHaveBeenCalled();
      expect(attach).not.toHaveBeenCalled();
    },
  };
}

export const consumerCard = storyCard(consumer.title);
export const referenceNotice = page.getByRole("status", {
  name: "Story reference navigation",
  exact: true,
});
export const retryReference = referenceNotice.getByRole("button", {
  name: "Retry story reference",
  exact: true,
});
export const detail = (title: string) =>
  storyCard(title).getByRole("region", {
    name: `Detail for ${title}`,
    exact: true,
  });
export const inspection = (card: Locator) =>
  card.getByRole("button", { name: /^(Inspect story|Hide detail)$/ });
export const canonicalRecord = (card: Locator) =>
  card.getByRole("link", { name: /^Canonical record / });
export const reference = (name: string) =>
  consumerCard
    .getByRole("list", { name: "Story dependencies", exact: true })
    .getByRole("link", { name, exact: true });

async function tap(control: Locator) {
  await expect.element(control).toBeVisible();
  const element = control.element();
  element.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: "instant",
  });
  await tapWhereShown(element);
}

export async function openDependencies(
  blocking = 2,
  using: "pointer" | "touch" = "pointer",
) {
  const summary = consumerCard.getByText(
    `Dependencies · ${blocking} blocking`,
    { exact: true },
  );
  if (using === "touch") await tap(summary);
  else await summary.click();
}

export async function followReference(
  name: string,
  using: "pointer" | "keyboard" | "touch" = "pointer",
) {
  const link = reference(name);
  if (using === "touch") await tap(link);
  else if (using === "keyboard") {
    await expect.element(link).toBeVisible();
    focus(link);
    await userEvent.keyboard("{Enter}");
  } else await link.click();
}

export async function showsReached(card: Locator, portion = 0.5) {
  await expect.element(card).toHaveFocus();
  await expect
    .poll(() => {
      const box = card.element().getBoundingClientRect();
      const room = boardReading.room();
      const width = Math.max(
        0,
        Math.min(box.right, room.right) - Math.max(box.left, room.left),
      );
      const height = Math.max(
        0,
        Math.min(box.bottom, room.bottom) - Math.max(box.top, room.top),
      );
      return (width * height) / (box.width * box.height);
    })
    .toBeGreaterThanOrEqual(portion);
}
