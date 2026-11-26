import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { expect } from "vitest";
import { page } from "vitest/browser";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import {
  mountBoardFrame,
  type BoardFrameMachine,
} from "./board-frame-mount.ts";
import { boardReading as board } from "./board-reading-page.ts";
import { boardWork, story } from "./board-work.ts";

export const openDoughStory = story("Open Dough's own queued story", 301);
export const doughnutStory = story("Doughnut's own queued story", 302);
export const pygardonStory = story("Pygardon's own queued story", 303);

const openDough = boardWork([openDoughStory], {
  taken: [story("Open Dough's own taken story", 321)],
  direction: "Read Open Dough's own published direction.",
  revision: "0d".repeat(20),
});
const doughnut = boardWork([doughnutStory], {
  id: "doughnut",
  label: "Doughnut",
  taken: [story("Doughnut's own taken story", 322)],
  direction: "Read Doughnut's own published direction.",
  revision: "d7".repeat(20),
});
const pygardon = boardWork([pygardonStory], {
  id: "pygardon",
  label: "Pygardon",
  taken: [],
  revision: "c1".repeat(20),
});

function unexpectedIntentRead(): never {
  throw new Error("This test publishes no Intent locations.");
}

const intentReads: IntentReadSource = makeMe.anIntentReadSource
  .reading({
    readLocations: () => Promise.resolve({ status: "not-configured" }),
    readFile: unexpectedIntentRead,
    readCandidates: unexpectedIntentRead,
  })
  .please();

export function mountPerspectiveFrame(
  viewport = { width: 1280, height: 800 },
  {
    machine = {},
    failure,
  }: { machine?: BoardFrameMachine; failure?: Error } = {},
) {
  return mountBoardFrame(openDough, viewport, "stories", machine, {
    otherWork: [doughnut, pygardon],
    ...(failure === undefined ? {} : { initialSnapshot: failure }),
    intentReads,
  });
}

export const perspective = page.getByRole("radiogroup", {
  name: "Perspective",
});
export const development = perspective.getByRole("radio", {
  name: "Development",
});
export const intentChoice = perspective.getByRole("radio", { name: "Intent" });
export const intent = page.getByRole("main", { name: "Intent", exact: true });
export const project = (label: string) =>
  page.getByRole("radio", { name: label, exact: true });
export const params = () => new URL(location.href).searchParams;

export function currentHistoryIndex() {
  // A push can discard Forward entries while still advancing this frame.
  const entry = navigation.currentEntry;
  if (entry === null)
    throw new Error("The frame has no current history entry.");
  return entry.index;
}

export async function showsUnconfiguredIntent(label: string) {
  await expect.element(intentChoice).toBeChecked();
  await expect.element(development).not.toBeChecked();
  const explanation = intent.getByText(
    `No Intent locations are configured for ${label}. Add an intent.locations setting to .planning/open-dough.json to publish test-source folders for Intent to read.`,
    { exact: true },
  );
  await expect.element(explanation).toBeVisible();
  await expect
    .element(
      intent.getByRole("heading", { name: "No story selected", exact: true }),
    )
    .toBeVisible();
  await expect.element(page.getByText(/Structure/)).not.toBeInTheDocument();
  await expect.element(page.getByRole("main")).toHaveLength(1);
  await expect
    .element(page.getByRole("region", { name: "Board", exact: true }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole("heading", { name: "Near-future direction" }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByRole("button", { name: /^Start session in / }))
    .not.toBeInTheDocument();
  return explanation;
}

export async function showsProjectBoard(work: "Open Dough" | "Doughnut") {
  const snapshot = work === "Open Dough" ? openDough : doughnut;
  await expect.element(development).toBeChecked();
  await expect.element(intent).not.toBeInTheDocument();
  for (const [column, entries] of [
    ["Backlog", snapshot.backlog],
    ["Taken", snapshot.taken],
  ] as const) {
    for (const { title } of entries) {
      await expect
        .element(
          board
            .column(column)
            .getByRole("article", { name: title, exact: true }),
        )
        .toBeVisible();
    }
  }
  await page.getByRole("heading", { name: "Near-future direction" }).click();
  await expect
    .element(page.getByText(snapshot.direction, { exact: true }))
    .toBeVisible();
  await expect
    .element(page.getByRole("button", { name: `Start session in ${work}` }))
    .toBeVisible();
}
