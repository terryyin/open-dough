// What the accessible-board journeys publish: work too long for any line,
// and a backlog too long for one screen. Publishing supplies only source
// preconditions; what the page shows is for each test to observe.

import type { Page } from "@playwright/test";
import { describedBacklog } from "./describedRevisions.ts";
import {
  commitAnswer,
  publishOrigin,
  rawFileAnswer,
} from "./publishedOrigin.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

export const revision = "7c0ffee1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f607";

// One word no line can hold, as a title, a path, and an anchor may each be.
const unbroken = "Uninterruptedlyconcatenated".repeat(5);
const longPath = `seeds/SEED-090-${"a-very-long-file-name-".repeat(6)}end.md`;
const longAnchor = `${"a-long-anchor-".repeat(6)}end`;

export const longTitle = `Keep a title holding one ${unbroken} word, and many ordinary words after it, readable wherever the overview is opened and however narrow the window becomes`;
export const longIdentity = `SEED-090#${longAnchor}`;
export const longPlan = `slice-plans/090-${"readable-".repeat(12)}overview/PLAN.md`;
export const longAddress = `https://status.example.com/${"notes/".repeat(24)}2026-09?view=full#api`;
export const unusableTarget = `javascript:${"x".repeat(140)}`;

// A bounded correction, identified by its plan link alone.
const repairPlan = "slice-plans/059-installer-update-report/PLAN.md";
const repair = makeMe.aBacklogEntry
  .with({
    identity: repairPlan,
    title: "Repair the installer's update report",
    href: repairPlan,
  })
  .please();

export const longBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("long", {
      backlog: {
        direction: `Give developers visibility into a project's published work, including ${unbroken} when someone records it.
Derive it solely from Git state published to origin.`,
        taken: [
          makeMe.aBacklogEntry
            .with({
              identity: longIdentity,
              title: longTitle,
              href: `${longPath}#${longAnchor}`,
              plan: { label: "plan", target: longPlan },
            })
            .please(),
          repair,
        ],
        queued: [
          makeMe.aBacklogEntry
            .with({
              identity: "NOTE-7#api",
              title: "Read the hosting provider's note",
              href: longAddress,
            })
            .please(),
          makeMe.aBacklogEntry
            .with({
              identity: "HOSTILE-1#x",
              title: "Keep a target that is not offered as a link readable",
              href: unusableTarget,
            })
            .please(),
          makeMe.aBacklogEntry
            .with({
              identity: "SEED-008#same-machine-merge-queue",
              title: "Queue trunk integration for agents on the same machine",
              href: "seeds/SEED-008-sync.md#same-machine-merge-queue",
            })
            .please(),
        ],
      },
    })
    .please(),
);

export const queuedCount = 16;
export const queuedTitle = (place: number) =>
  `Queued work number ${place} waits for its turn`;
const queuedPlaces = Array.from(
  Array(queuedCount).keys(),
  (index) => index + 1,
);
export const queuedTitles = queuedPlaces.map(queuedTitle);

export const largeBacklog = describedBacklog(
  makeMe.aRepository
    .withRevision("large", {
      backlog: {
        taken: [repair],
        queued: queuedPlaces.map((place) =>
          makeMe.aBacklogEntry
            .with({
              identity: `SEED-1${place}#story`,
              title: queuedTitle(place),
              href: `seeds/SEED-1${place}-queued.md#story`,
            })
            .please(),
        ),
      },
    })
    .please(),
);

export async function publishLargeBacklog(page: Page) {
  await publishOrigin(page, {
    ref: commitAnswer(revision),
    backlog: { revision, answer: rawFileAnswer(largeBacklog) },
  });
}
